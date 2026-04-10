import { createContext, useContext, useState, useEffect } from "react";
import { controls } from "../data/controls";

const AuditContext = createContext(null);
const STORAGE_KEY  = "iso_audit_datasafe";
const MISSION_KEY  = "iso_audit_mission_id";

// ── helpers API ──────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(`/api${path}`, {
      headers: opts.body ? { "Content-Type": "application/json" } : {},
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function computeScore(evaluations) {
  const vals = Object.values(evaluations);
  if (!vals.length) return 0;
  const conformes = vals.filter(e => e.status === "conforme").length;
  const partiels  = vals.filter(e => e.status === "partiel").length;
  return Math.round(((conformes + partiels * 0.5) / vals.length) * 100);
}

// Données par défaut du scénario — mission vide, fiche à remplir par l'auditeur
const DEFAULT_MISSION = {
  titre:    "",
  auditeur: "",
  client:   "",
};

const DEFAULT_FICHE = {
  nom: "", secteur: "", effectif: "",
  ca: "", siege: "", activite: "",
  clients_principaux: "", interlocuteurs: "",
};

export function AuditProvider({ children }) {
  const [missionId,         setMissionId]         = useState(null);
  const [mission,           setMission]           = useState(DEFAULT_MISSION);
  const [fiche,             setFiche]             = useState(DEFAULT_FICHE);
  const [incidents,         setIncidents]         = useState([]);
  const [evaluations,       setEvaluations]       = useState({});
  const [risks,             setRisks]             = useState({});
  const [revealedEvidences, setRevealedEvidences] = useState({});
  const [perimetre,         setPerimetre]         = useState([]); // ids numériques des contrôles sélectionnés

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Charger localStorage immédiatement (affichage instantané)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const d = JSON.parse(saved);
      setRevealedEvidences(d.revealedEvidences || {});
      setEvaluations(d.evaluations || {});
      setRisks(d.risks || {});
    }

    async function init() {
      let mid = Number(localStorage.getItem(MISSION_KEY)) || null;

      // Vérifier que la mission existe en DB
      if (mid) {
        const m = await apiFetch(`/missions/${mid}`);
        if (m) { setMission(m); }
        else { mid = null; localStorage.removeItem(MISSION_KEY); }
      }

      // Créer une nouvelle mission si besoin
      if (!mid) {
        const m = await apiFetch("/missions", { method: "POST", body: DEFAULT_MISSION });
        if (!m) return;
        mid = m.id;
        setMission(m);
        localStorage.setItem(MISSION_KEY, mid);
      } else {
        // Charger fiche et incidents depuis l'API
        const f = await apiFetch(`/missions/${mid}/fiche`);
        if (f) setFiche(f);
        const incs = await apiFetch(`/missions/${mid}/incidents`);
        if (incs) setIncidents(incs);
      }

      setMissionId(mid);

      // Charger les évaluations depuis l'API (priorité sur localStorage)
      const apiEvals = await apiFetch(`/missions/${mid}/evaluations`);
      if (apiEvals && apiEvals.length > 0) {
        const mapped = {};
        apiEvals.forEach(e => {
          mapped[e.code_iso] = {
            controlId: e.code_iso, status: e.statut,
            maturity: e.maturite, justification: e.justification || "",
            evaluatedAt: new Date().toISOString(),
          };
        });
        setEvaluations(mapped);
      }

      // Charger le périmètre
      const peri = await apiFetch(`/missions/${mid}/perimetre`);
      if (peri && peri.length > 0) {
        setPerimetre(peri.map(p => p.id));
      }
    }

    init().catch(() => {});
  }, []);

  // Persister dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ revealedEvidences, evaluations, risks }));
  }, [revealedEvidences, evaluations, risks]);

  // ── Actions ───────────────────────────────────────────────────────────────
  function revealEvidence(id) {
    setRevealedEvidences(prev => ({ ...prev, [id]: true }));
  }

  async function submitEvaluation(controlId, status, maturity, justification) {
    // Mise à jour locale immédiate
    setEvaluations(prev => ({
      ...prev,
      [controlId]: { controlId, status, maturity, justification, evaluatedAt: new Date().toISOString() },
    }));

    // Sync API
    if (!missionId) return;
    const controles = await apiFetch("/controles");
    if (!controles) return;
    const ctrl = controles.find(c => c.code_iso === controlId);
    if (!ctrl) return;
    await apiFetch(`/missions/${missionId}/evaluations`, {
      method: "POST",
      body: { controle_id: ctrl.id, statut: status, maturite: maturity, justification },
    });
  }

  async function submitRisk(controlId, gravity, probability, riskLevel, recommendation) {
    setRisks(prev => ({ ...prev, [controlId]: { controlId, gravity, probability, riskLevel, recommendation } }));

    if (!missionId) return;
    const controles = await apiFetch("/controles");
    if (!controles) return;
    const ctrl = controles.find(c => c.code_iso === controlId);
    if (!ctrl) return;
    await apiFetch(`/missions/${missionId}/evaluations`, {
      method: "POST",
      body: {
        controle_id: ctrl.id, statut: "non_conforme",
        risque: riskLevel === "élevé" ? "eleve" : riskLevel,
        recommandation: recommendation,
      },
    });
  }

  async function savePerimetre(controleIds) {
    setPerimetre(controleIds);
    if (!missionId) return;
    await apiFetch(`/missions/${missionId}/perimetre`, {
      method: "POST",
      body: { controle_ids: controleIds },
    });
  }

  async function saveFiche(data) {
    setFiche(prev => ({ ...prev, ...data }));
    if (!missionId) return;
    await apiFetch(`/missions/${missionId}/fiche`, { method: "POST", body: data });
  }

  async function resetSession() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MISSION_KEY);
    setMissionId(null); setEvaluations({}); setRisks({});
    setRevealedEvidences({}); setIncidents([]);
    setMission(DEFAULT_MISSION); setFiche(DEFAULT_FICHE);

    const m = await apiFetch("/missions", { method: "POST", body: DEFAULT_MISSION });
    if (!m) return;
    setMission(m); setMissionId(m.id);
    localStorage.setItem(MISSION_KEY, m.id);
  }

  const progress = Math.round((Object.keys(evaluations).length / controls.length) * 100);
  const score    = computeScore(evaluations);

  return (
    <AuditContext.Provider value={{
      controls, evaluations, risks, revealedEvidences,
      incidents, mission, fiche, missionId,
      perimetre, savePerimetre, saveFiche,
      progress, score,
      revealEvidence, submitEvaluation, submitRisk, resetSession,
    }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() { return useContext(AuditContext); }
