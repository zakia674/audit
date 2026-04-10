import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudit } from "../context/AuditContext";
import { controls as staticControls } from "../data/controls";

const RISK_COLORS = {
  faible: "var(--success)",
  moyen: "#8B5A1A",
  élevé: "#C45000",
  critique: "var(--danger)",
};

function computeRiskLevel(severity, probability) {
  const score = severity * probability;
  if (score <= 4) return "faible";
  if (score <= 9) return "moyen";
  if (score <= 16) return "élevé";
  return "critique";
}

export default function RiskPage() {
  const { controlId } = useParams();
  const navigate = useNavigate();
  const { evaluations, risks, submitRisk, perimetre } = useAudit();

  const codeIso = decodeURIComponent(controlId);
  const staticControl = staticControls.find(c => c.id === codeIso);

  const [apiControl,   setApiControl]   = useState(null);
  const [allControles, setAllControles] = useState([]);

  useEffect(() => {
    fetch("/api/controles").then(r => r.json()).then(data => {
      setAllControles(data);
      const found = data.find(c => c.code_iso === codeIso);
      if (found) setApiControl(found);
    }).catch(() => {});
  }, [codeIso]);

  const evaluation   = evaluations[codeIso];
  const existingRisk = risks[codeIso];

  const [severity,       setSeverity]       = useState(existingRisk?.severity || 3);
  const [probability,    setProbability]     = useState(existingRisk?.probability || 3);
  const [recommendation, setRecommendation] = useState(
    existingRisk?.recommendation || staticControl?.defaultRecommendation || ""
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(!!existingRisk);

  const periControles = perimetre.length > 0
    ? allControles.filter(c => perimetre.includes(c.id))
    : allControles;
  const currentIndex = periControles.findIndex(c => c.code_iso === codeIso);
  const nextControl  = periControles[currentIndex + 1] || null;

  if (!evaluation) return <div className="page"><p>Évaluation introuvable pour ce contrôle.</p></div>;

  const riskLevel = computeRiskLevel(severity, probability);
  const riskColor = RISK_COLORS[riskLevel];
  const title = staticControl?.title || apiControl?.titre || codeIso;

  function handleSave() {
    if (recommendation.trim().length < 10) {
      setError("La recommandation doit contenir au moins 10 caractères.");
      return;
    }
    setError("");
    submitRisk(codeIso, severity, probability, riskLevel, recommendation);
    setSaved(true);
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(`/audit/controls/${encodeURIComponent(codeIso)}`)}>
        ← Retour au contrôle
      </button>

      <div className="risk-header">
        <h2>Évaluation du risque</h2>
        <p>Contrôle {codeIso} — {title}</p>
        <span className="nc-badge-inline">Non conforme — Niveau {evaluation.maturity ?? ""}</span>
      </div>

      <div className="step-block">
        <div className="step-label">Étape 4 — Évaluation du risque</div>

        <div className="risk-matrix-section">
          <div className="risk-sliders">
            <div className="slider-group">
              <label>Gravité (Impact) : <strong>{severity}/5</strong></label>
              <input
                type="range" min={1} max={5} value={severity}
                onChange={(e) => { setSeverity(Number(e.target.value)); setSaved(false); }}
              />
              <div className="slider-labels">
                <span>Négligeable</span><span>Critique</span>
              </div>
            </div>
            <div className="slider-group">
              <label>Probabilité (Vraisemblance) : <strong>{probability}/5</strong></label>
              <input
                type="range" min={1} max={5} value={probability}
                onChange={(e) => { setProbability(Number(e.target.value)); setSaved(false); }}
              />
              <div className="slider-labels">
                <span>Très rare</span><span>Quasi certain</span>
              </div>
            </div>
          </div>

          <div className="risk-result" style={{ borderColor: riskColor }}>
            <div className="risk-score">Score : {severity * probability}/25</div>
            <div className="risk-level" style={{ color: riskColor }}>
              Niveau : <strong>{riskLevel.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        {/* Matrice visuelle 5x5 — dégradé */}
        <div className="risk-matrix-wrap">
          <div className="matrix-title">MATRICE DES RISQUES</div>

          <div className="matrix-legend">
            <span className="legend-item"><span className="legend-dot" style={{background:"#4CAF50"}} />Acceptable</span>
            <span className="legend-item"><span className="legend-dot" style={{background:"#FFC107"}} />ALARP</span>
            <span className="legend-item"><span className="legend-dot" style={{background:"#F44336"}} />Inacceptable</span>
          </div>

          <div className="matrix-body">
            {/* Label axe Y */}
            <div className="matrix-axis-y">
              <span>Gravité</span>
            </div>

            <div className="matrix-inner">
              {/* Grille 5×5 */}
              <div className="matrix-rows">
                {[
                  { val: 5, label: "Très grave" },
                  { val: 4, label: "Grave" },
                  { val: 3, label: "Moyenne" },
                  { val: 2, label: "Faible" },
                  { val: 1, label: "Très faible" },
                ].map(({ val: s, label: sLabel }) => (
                  <div key={s} className="matrix-row">
                    <div className="matrix-row-label">{sLabel}</div>
                    {[1, 2, 3, 4, 5].map((p) => {
                      const score = s * p;
                      const isActive = s === severity && p === probability;
                      // dégradé continu vert→jaune→orange→rouge selon score (1–25)
                      const t = (score - 1) / 24; // 0..1
                      const r = Math.round(76  + (244 - 76)  * t);
                      const g = Math.round(175 + (67  - 175) * t);
                      const b = Math.round(80  + (54  - 80)  * t);
                      const bg = `rgb(${r},${g},${b})`;
                      return (
                        <div
                          key={p}
                          className={`matrix-cell-new ${isActive ? "active" : ""}`}
                          style={{ background: bg }}
                          title={`Gravité ${s} × Probabilité ${p} = ${score}`}
                          onClick={() => { setSeverity(s); setProbability(p); setSaved(false); }}
                        >
                          {isActive && <span className="matrix-dot">●</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Labels axe X */}
              <div className="matrix-axis-x-labels">
                <div className="matrix-row-label" />
                {["Impossible","Improbable","Possible","Probable","Très probable"].map((l) => (
                  <div key={l} className="matrix-x-label-item">{l}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Label axe X */}
          <div className="matrix-axis-x-title">Probabilité</div>
        </div>
      </div>

      <div className="step-block">
        <div className="recommendation-section">
          <h3>Recommandation</h3>
          <textarea
            value={recommendation}
            onChange={(e) => { setRecommendation(e.target.value); setSaved(false); }}
            placeholder="Proposez une mesure corrective..."
            rows={4}
          />
          {error && <div className="error-msg">{error}</div>}
          {!saved ? (
            <button className="btn-primary" onClick={handleSave}>Enregistrer le risque</button>
          ) : (
            <div className="submitted-actions">
              <span className="success-msg">Risque enregistré</span>
              <button className="btn-primary" onClick={() =>
                nextControl
                  ? navigate(`/audit/controls/${encodeURIComponent(nextControl.code_iso)}`)
                  : navigate("/audit/controls")
              }>
                {nextControl ? `Contrôle suivant : ${nextControl.code_iso} →` : "Retour à la liste →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
