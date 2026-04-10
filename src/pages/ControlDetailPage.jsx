import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudit } from "../context/AuditContext";

const CMM_LEVELS = [
  { val: 0, label: "Inexistant",    desc: "Aucun processus en place. La pratique n'existe pas." },
  { val: 1, label: "Initial",       desc: "Pratiques ad hoc, non documentées, dépendantes des individus." },
  { val: 2, label: "Reproductible", desc: "Processus partiellement documentés, appliqués de façon irrégulière." },
  { val: 3, label: "Défini",        desc: "Processus documentés, approuvés et communiqués à tous." },
  { val: 4, label: "Géré",          desc: "Processus mesurés, surveillés et améliorés régulièrement." },
  { val: 5, label: "Optimisé",      desc: "Amélioration continue, bonnes pratiques intégrées à la culture." },
];

const STATUTS = [
  { val: "conforme",     label: "Conforme",              color: "var(--success)" },
  { val: "non_conforme", label: "Non conforme",           color: "var(--danger)"  },
  { val: "partiel",      label: "Partiellement conforme", color: "#8B5A1A"        },
  { val: "non_evalue",   label: "Non évalué",             color: "var(--muted)"   },
];

const RISQUES = [
  { val: "critique", label: "Critique", color: "var(--danger)"  },
  { val: "eleve",    label: "Élevé",    color: "#C45000"        },
  { val: "moyen",    label: "Moyen",    color: "#8B5A1A"        },
  { val: "faible",   label: "Faible",   color: "var(--success)" },
];

// Données enrichies (entretiens, objectifs) depuis controls.js statique
import { controls as staticControls } from "../data/controls";

export default function ControlDetailPage() {
  const { controlId } = useParams();
  const navigate = useNavigate();
  const { evaluations, submitEvaluation, missionId, perimetre } = useAudit();

  const codeIso = decodeURIComponent(controlId);

  // Contrôle depuis l'API
  const [apiControl, setApiControl]   = useState(null);
  const [allControles, setAllControles] = useState([]);

  // Données enrichies depuis le fichier statique (entretien, objectif, question)
  const staticControl = staticControls.find(c => c.id === codeIso);

  const existingEval = evaluations[codeIso];

  // État évaluation
  const [statut,         setStatut]         = useState(existingEval?.status        || "non_evalue");
  const [maturity,       setMaturity]        = useState(existingEval?.maturity      ?? null);
  const [justification,  setJustification]   = useState(existingEval?.justification || "");
  const [risque,         setRisque]          = useState(existingEval?.risque        || "");
  const [recommandation, setRecommandation]  = useState(existingEval?.recommandation || staticControl?.defaultRecommendation || "");
  const [error,          setError]           = useState("");
  const [submitted,      setSubmitted]       = useState(!!existingEval);

  // Preuves
  const [apiEvalId,      setApiEvalId]      = useState(null);
  const [preuves,        setPreuves]        = useState([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const preuveInputRef = useRef(null);

  // Charger tous les contrôles API + trouver le contrôle courant
  useEffect(() => {
    fetch("/api/controles")
      .then(r => r.json())
      .then(data => {
        setAllControles(data);
        const found = data.find(c => c.code_iso === codeIso);
        if (found) setApiControl(found);
      })
      .catch(() => {});
  }, [codeIso]);

  // Charger ou créer l'évaluation API dès l'ouverture
  useEffect(() => {
    if (!missionId || !apiControl) return;

    async function initEval() {
      const evals = await fetch(`/api/missions/${missionId}/evaluations`).then(r => r.json()).catch(() => []);
      const ev = evals.find(e => e.code_iso === codeIso);

      if (ev) {
        setApiEvalId(ev.id);
        setStatut(ev.statut || "non_evalue");
        setMaturity(ev.maturite ?? null);
        setJustification(ev.justification || "");
        setRisque(ev.risque || "");
        setRecommandation(ev.recommandation || staticControl?.defaultRecommendation || "");
        setSubmitted(ev.statut && ev.statut !== "non_evalue");
        fetch(`/api/evaluations/${ev.id}/preuves`)
          .then(r => r.json()).then(setPreuves).catch(() => {});
      } else {
        const res = await fetch(`/api/missions/${missionId}/evaluations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ controle_id: apiControl.id, statut: "non_evalue", maturite: null, justification: "" }),
        });
        if (res.ok) {
          const newEv = await res.json();
          setApiEvalId(newEv.id);
        }
      }
    }

    initEval();
  }, [missionId, apiControl?.id]);

  // Navigation contrôle suivant dans le périmètre
  const periControles = perimetre.length > 0
    ? allControles.filter(c => perimetre.includes(c.id))
    : allControles;
  const currentIndex = periControles.findIndex(c => c.code_iso === codeIso);
  const nextControl  = periControles[currentIndex + 1] || null;
  const isNonConforme = statut === "non_conforme" || statut === "partiel";

  async function handleSubmit() {
    if (!justification.trim() || justification.trim().length < 10) {
      setError("La justification doit contenir au moins 10 caractères."); return;
    }
    setError("");
    submitEvaluation(codeIso, statut, maturity, justification);
    if (missionId && apiControl) {
      const res = await fetch(`/api/missions/${missionId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controle_id: apiControl.id, statut, maturite: maturity,
          justification, risque: risque || null, recommandation: recommandation || null,
        }),
      });
      if (res.ok) { const ev = await res.json(); setApiEvalId(ev.id); }
    }
    setSubmitted(true);
  }

  async function handleUploadPreuve(e) {
    const file = e.target.files[0];
    if (!file || !apiEvalId) return;
    setUploadingProof(true);
    const form = new FormData();
    form.append("fichier", file);
    const res = await fetch(`/api/evaluations/${apiEvalId}/preuves`, { method: "POST", body: form });
    if (res.ok) { const p = await res.json(); setPreuves(prev => [p, ...prev]); }
    setUploadingProof(false);
    e.target.value = "";
  }

  async function handleDeletePreuve(id) {
    await fetch(`/api/preuves/${id}`, { method: "DELETE" });
    setPreuves(prev => prev.filter(p => p.id !== id));
  }

  function handleNext() {
    if (isNonConforme) navigate(`/audit/controls/${encodeURIComponent(codeIso)}/risk`);
    else if (nextControl) navigate(`/audit/controls/${encodeURIComponent(nextControl.code_iso)}`);
    else navigate("/audit/controls");
  }

  // Affichage chargement
  if (!apiControl) {
    return (
      <div className="page">
        <button className="btn-back" onClick={() => navigate("/audit/controls")}>← Retour à la liste</button>
        <p style={{ color:"var(--muted)", marginTop:"2rem" }}>Chargement du contrôle…</p>
      </div>
    );
  }

  // Fusionner données API + données statiques enrichies
  const title       = staticControl?.title       || apiControl.titre;
  const description = staticControl?.description || apiControl.description;
  const objective   = staticControl?.objective   || null;
  const question    = staticControl?.question    || `Le contrôle ${codeIso} est-il correctement mis en œuvre ?`;
  const interview   = staticControl?.interview   || null;

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate("/audit/controls")}>← Retour à la liste</button>

      <div className="control-detail-header">
        <span className="control-num-large">{codeIso}</span>
        <div>
          <h2>{title}</h2>
          <span className="theme-tag">{apiControl.theme}</span>
        </div>
      </div>

      {/* Étape 1 — Présentation */}
      <div className="step-block">
        <div className="step-label">Étape 1 — Présentation du contrôle</div>
        <p className="description-text">{description}</p>
        {objective && (
          <div className="objective-block">
            <span className="objective-label">Objectif</span>
            <p className="objective-text">{objective}</p>
          </div>
        )}
        <div className="iso-ref-tag">Réf. ISO/IEC 27002:2022 — Contrôle {codeIso}</div>
      </div>

      {/* Étape 2 — Entretien simulé */}
      {interview && (
        <div className="step-block">
          <div className="step-label">Étape 2 — Entretien simulé</div>
          <div className="interview-header">
            <span className="interview-icon">🎙</span>
            <div>
              <div className="interview-with">Entretien avec</div>
              <div className="interview-name">{interview.interlocutor}</div>
            </div>
          </div>
          <div className="interview-exchanges">
            {interview.exchanges.map((ex, i) => (
              <div key={i} className="interview-exchange">
                <div className="interview-q"><span className="interview-role-q">Auditeur</span>{ex.q}</div>
                <div className="interview-a"><span className="interview-role-a">Interlocuteur</span>{ex.a}</div>
              </div>
            ))}
          </div>
          <div className="interview-note">
            <span className="interview-note-label">📝 Note de l'auditeur</span>
            <p>{interview.auditorNote}</p>
          </div>
        </div>
      )}

      {/* Étape 3 — Preuves */}
      <div className="step-block">
        <div className="step-label">Étape {interview ? "3" : "2"} — Preuves collectées sur le terrain</div>
        {preuves.length === 0 && (
          <p style={{ fontSize:"0.85rem", color:"var(--muted)" }}>Aucune preuve uploadée pour ce contrôle.</p>
        )}
        <div className="evidences-list">
          {preuves.map(p => (
            <div key={p.id} className="evidence-item" style={{ flexDirection:"row", alignItems:"center", gap:"0.5rem" }}>
              <a className="evidence-btn revealed" href={`/api/preuves/${p.id}/fichier`} target="_blank" rel="noreferrer" style={{ flex:1 }}>
                <span className="evidence-type-pill pill-document">fichier</span>
                📎 {p.nom_fichier}
                <span style={{ marginLeft:"auto", fontSize:"0.75rem", color:"var(--muted)" }}>{p.date_upload}</span>
              </a>
              <button onClick={() => handleDeletePreuve(p.id)}
                style={{ background:"none", border:"none", color:"var(--danger)", cursor:"pointer", fontSize:"1rem", padding:"0 0.5rem" }}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop:"0.5rem" }}>
          <input ref={preuveInputRef} type="file" style={{ display:"none" }} onChange={handleUploadPreuve} />
          <button
            className="evidence-btn"
            style={{ width:"auto", opacity: uploadingProof ? 0.6 : 1, cursor: uploadingProof ? "not-allowed" : "pointer" }}
            onClick={() => { if (!uploadingProof) preuveInputRef.current?.click(); }}
          >
            <span className="evidence-type-pill pill-document">upload</span>
            {uploadingProof ? "Envoi en cours..." : "＋ Joindre une preuve"}
          </button>
        </div>
      </div>

      {/* Étape 4 — Évaluation */}
      <div className="step-block">
        <div className="step-label">Étape {interview ? "4" : "3"} — Évaluation</div>
        <p className="eval-question">{question}</p>

        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"0.75rem" }}>
          {STATUTS.map(s => (
            <button key={s.val} onClick={() => { setStatut(s.val); setSubmitted(false); }}
              style={{
                padding:"0.55rem 1rem", borderRadius:3,
                border:`2px solid ${statut === s.val ? s.color : "var(--border)"}`,
                background: statut === s.val ? s.color + "18" : "var(--bg)",
                color: statut === s.val ? s.color : "var(--text)",
                cursor:"pointer", fontFamily:"inherit", fontSize:"0.88rem", fontWeight: statut === s.val ? 600 : 400,
              }}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="cmm-grid">
          {CMM_LEVELS.map(lvl => (
            <button key={lvl.val}
              className={`cmm-btn ${maturity === lvl.val ? "selected" : ""} ${lvl.val < 3 ? "cmm-low" : "cmm-ok"}`}
              onClick={() => { setMaturity(lvl.val); setSubmitted(false); }}>
              <span className="cmm-num">{lvl.val}</span>
              <span className="cmm-label">{lvl.label}</span>
              <span className="cmm-desc">{lvl.desc}</span>
            </button>
          ))}
        </div>

        <div className="justification-field">
          <label>Justification (observations terrain)</label>
          <textarea value={justification} rows={3}
            onChange={e => { setJustification(e.target.value); setSubmitted(false); }}
            placeholder="Décrivez ce que vous avez observé sur le terrain..." />
        </div>

        <div className="justification-field">
          <label>Niveau de risque</label>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {RISQUES.map(r => (
              <button key={r.val} onClick={() => { setRisque(r.val); setSubmitted(false); }}
                style={{
                  padding:"0.45rem 0.9rem", borderRadius:3,
                  border:`2px solid ${risque === r.val ? r.color : "var(--border)"}`,
                  background: risque === r.val ? r.color + "18" : "var(--bg)",
                  color: risque === r.val ? r.color : "var(--text)",
                  cursor:"pointer", fontFamily:"inherit", fontSize:"0.85rem", fontWeight: risque === r.val ? 600 : 400,
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="justification-field">
          <label>Recommandation</label>
          <textarea value={recommandation} rows={3}
            onChange={e => { setRecommandation(e.target.value); setSubmitted(false); }}
            placeholder="Recommandation pour le client..." />
        </div>

        {error && <div className="error-msg">{error}</div>}

        {!submitted ? (
          <button className="btn-primary" onClick={handleSubmit}>Enregistrer l'évaluation</button>
        ) : (
          <div className="submitted-actions">
            <span className="success-msg">✓ Évaluation enregistrée en base</span>
            <button className="btn-secondary" onClick={() => setSubmitted(false)}>Modifier</button>
            <button className="btn-primary" onClick={handleNext}>
              {isNonConforme
                ? "Évaluer le risque →"
                : nextControl
                  ? `Contrôle suivant : ${nextControl.code_iso} →`
                  : "Retour à la liste →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
