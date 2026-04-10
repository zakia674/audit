import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// Étapes visuelles du workflow
const WORKFLOW_STEPS = [
  { angle: -90, color: "#1e40af", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: "Lettre" },
  { angle:   0, color: "#2563eb", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: "Contrôles" },
  { angle:  90, color: "#3b82f6", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10"/></svg>, label: "Entreprise" },
  { angle: 180, color: "#60a5fa", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: "Rapport" },
];

const R = 56;

function WorkflowCircle() {
  return (
    <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
      <svg width="160" height="160" style={{ position: "absolute", top: 0, left: 0 }}>
        <circle cx="80" cy="80" r={R} fill="none" stroke="#dbeafe" strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 80 24 A 56 56 0 0 1 136 80" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" markerEnd="url(#a1)" />
        <path d="M 80 136 A 56 56 0 0 1 24 80" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" markerEnd="url(#a2)" />
        <defs>
          <marker id="a1" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#3b82f6" />
          </marker>
          <marker id="a2" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#3b82f6" />
          </marker>
        </defs>
      </svg>
      {/* Centre */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 34, height: 34, borderRadius: "50%", background: "#1e3a8a",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 3px 10px rgba(30,58,138,0.35)",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      {/* Icônes */}
      {WORKFLOW_STEPS.map(({ angle, color, icon, label }) => {
        const rad = (angle * Math.PI) / 180;
        const x = 80 + R * Math.cos(rad) - 16;
        const y = 80 + R * Math.sin(rad) - 16;
        return (
          <div key={label} title={label} style={{
            position: "absolute", left: x, top: y,
            width: 32, height: 32, borderRadius: "50%", background: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 8px rgba(30,58,138,0.2)",
          }}>
            {icon}
          </div>
        );
      })}
    </div>
  );
}

export default function MissionModal({ mode, mission, onClose, onSave }) {
  const { user } = useAuth();
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    titre:    mission?.titre    ?? "",
    client:   mission?.client   ?? "",
    date_fin: mission?.date_fin ? mission.date_fin.slice(0,10) : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titre.trim())  { setError("Le titre de la mission est requis."); return; }
    if (!form.client.trim()) { setError("Le nom du client est requis."); return; }
    setError("");
    setLoading(true);
    const payload = { ...form, auditeur: user?.nom || "" };
    try {
      let saved;
      if (isEdit) {
        const res = await fetch(`/api/missions/${mission.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        saved = await res.json();
      } else {
        const res = await fetch("/api/missions", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        saved = await res.json();
      }
      onSave(saved, !isEdit);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#f8fafc",
        borderRadius: 16, width: "100%", maxWidth: 560,
        boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
        overflow: "hidden",
      }}>
        {/* Header coloré */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          padding: "1.5rem 2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {isEdit ? "Modifier la mission" : "Nouvelle mission"}
            </div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, fontFamily: "'Libre Baskerville',Georgia,serif" }}>
              {isEdit ? mission?.titre : "Créer une mission d'audit"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>

        {/* Corps */}
        <div style={{ padding: "1.75rem 2rem", display: "flex", gap: "1.75rem", alignItems: "flex-start" }}>

          {/* Visuel circulaire */}
          {!isEdit && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 8 }}>
              <WorkflowCircle />
              <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", lineHeight: 1.5, maxWidth: 120 }}>
                Workflow complet<br />ISO 27001/27002
              </div>
            </div>
          )}

          {/* Formulaire */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "9px 12px", fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            <div className="justification-field">
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Titre de la mission *</label>
              <input className="form-input" value={form.titre}
                onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                placeholder="Ex : Audit ISO 27001 — DataSafe 2026"
                autoFocus
                style={{ background: "#fff" }}
              />
            </div>

            <div className="justification-field">
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Nom du client *</label>
              <input className="form-input" value={form.client}
                onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                placeholder="Ex : DataSafe Maroc SARL"
                style={{ background: "#fff" }}
              />
            </div>

            <div className="justification-field">
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Date limite (deadline)</label>
              <input type="date" className="form-input" value={form.date_fin}
                onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))}
                style={{ background: "#fff" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" onClick={onClose}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6b7280", padding: "9px 14px" }}>
                Annuler
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{ padding: "9px 22px", background: "#1e3a8a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(30,58,138,0.25)" }}>
                {loading ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la mission →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
