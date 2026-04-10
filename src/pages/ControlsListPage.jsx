import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAudit } from "../context/AuditContext";

export default function ControlsListPage() {
  const navigate = useNavigate();
  const { evaluations, score, missionId } = useAudit();

  const [apiControles,    setApiControles]    = useState([]);
  const [periControleIds, setPeriControleIds] = useState(null);

  // Charger tous les contrôles depuis l'API
  useEffect(() => {
    fetch("/api/controles")
      .then(r => r.json())
      .then(setApiControles)
      .catch(() => {});
  }, []);

  // Charger le périmètre directement depuis l'API — source de vérité
  useEffect(() => {
    if (!missionId) return;
    fetch(`/api/missions/${missionId}/perimetre`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPeriControleIds(data.map(c => Number(c.id)));
        } else {
          setPeriControleIds([]);
        }
      })
      .catch(() => setPeriControleIds([]));
  }, [missionId]);

  // Filtrer les contrôles selon le périmètre
  const activeControls = (() => {
    if (apiControles.length === 0) return [];
    if (periControleIds !== null && periControleIds.length > 0) {
      return apiControles.filter(c => periControleIds.includes(Number(c.id)));
    }
    if (periControleIds !== null && periControleIds.length === 0) {
      return apiControles; // périmètre vide = tout afficher
    }
    return []; // encore en chargement
  })();

  const evaluated    = activeControls.filter(c => evaluations[c.code_iso]).length;
  const conformes    = activeControls.filter(c => evaluations[c.code_iso]?.status === "conforme").length;
  const nonConformes = activeControls.filter(c => evaluations[c.code_iso]?.status === "non_conforme").length;
  const progress     = activeControls.length > 0 ? Math.round((evaluated / activeControls.length) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h2>Contrôles ISO 27002:2022</h2>
          <p>Sélectionnez un contrôle pour collecter les preuves et évaluer sa conformité.</p>
        </div>
        <button className="btn-secondary" style={{ fontSize:"0.82rem", padding:"0.4rem 0.9rem" }}
          onClick={() => navigate("/audit/perimetre")}>
          ✎ Modifier le périmètre
        </button>
      </div>

      <div className="progress-bar-container">
        <div className="progress-info">
          <span>{evaluated} contrôle{evaluated > 1 ? "s" : ""} audité{evaluated > 1 ? "s" : ""} sur {activeControls.length}</span>
          <span>{score}% de conformité</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="audit-counters">
        <div className="counter-box">
          <span className="counter-num">{activeControls.length}</span>
          <span className="counter-label">Total</span>
        </div>
        <div className="counter-box conformes">
          <span className="counter-num">{conformes}</span>
          <span className="counter-label">Conformes</span>
        </div>
        <div className="counter-box non-conformes">
          <span className="counter-num">{nonConformes}</span>
          <span className="counter-label">Non conformes</span>
        </div>
      </div>

      {periControleIds !== null && periControleIds.length === 0 && (
        <div className="step-block" style={{ textAlign:"center", padding:"1.5rem", color:"var(--muted)" }}>
          <p style={{ marginBottom:"0.75rem" }}>Aucun périmètre défini. Définissez d'abord les contrôles à auditer.</p>
          <button className="btn-primary" onClick={() => navigate("/audit/perimetre")}>
            Définir le périmètre →
          </button>
        </div>
      )}

      {periControleIds === null && (
        <div style={{ textAlign:"center", padding:"2rem", color:"var(--muted)" }}>
          Chargement du périmètre…
        </div>
      )}

      <div className="controls-list">
        {activeControls.map((ctrl) => {
          const ev = evaluations[ctrl.code_iso];
          const statusClass = ev ? `status-${ev.status}` : "status-pending";
          const statusText  = ev
            ? ev.status === "conforme" ? "Conforme" : "Non conforme"
            : "À auditer";

          return (
            <div
              key={ctrl.id}
              className={`control-row ${statusClass}`}
              onClick={() => navigate(`/audit/controls/${encodeURIComponent(ctrl.code_iso)}`)}
            >
              <div className="control-row-left">
                <span className="control-num">{ctrl.code_iso}</span>
                <div>
                  <div className="control-title-text">{ctrl.titre}</div>
                  <div className="control-theme-tag">{ctrl.theme}</div>
                </div>
              </div>
              <div className="control-row-right">
                <span className={`status-label ${ev ? ev.status : ""}`}>{statusText}</span>
                <span className="arrow-icon">›</span>
              </div>
            </div>
          );
        })}
      </div>

      {evaluated > 0 && evaluated === activeControls.length && activeControls.length > 0 && (
        <div className="complete-banner">
          <span>Tous les contrôles ont été audités.</span>
          <button className="btn-primary" onClick={() => navigate("/audit/report")}>
            Générer le rapport
          </button>
        </div>
      )}
    </div>
  );
}
