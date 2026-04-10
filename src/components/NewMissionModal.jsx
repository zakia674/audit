import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NewMissionModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre: "", client: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titre.trim()) { setError("Le titre de la mission est requis."); return; }
    if (!form.client.trim()) { setError("Le nom du client est requis."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: form.titre, client: form.client, auditeur: user?.nom || "" }),
      });
      const mission = await res.json();
      onCreated(mission);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "1rem",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--card-bg)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "2rem", width: "100%", maxWidth: 520,
          display: "flex", flexDirection: "column", gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: "1.15rem", color: "var(--primary)", margin: 0,
          }}>
            Nouvelle mission d&apos;audit
          </h2>
          <button
            onClick={onClose} aria-label="Fermer"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        {error && <div style={{ color: "var(--danger, #dc2626)", fontSize: "0.85rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="justification-field">
            <label>Titre de la mission *</label>
            <input
              className="form-input"
              value={form.titre}
              onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
              placeholder="Ex : Audit ISO 27001 — DataSafe 2026"
              autoFocus
            />
          </div>
          <div className="justification-field">
            <label>Nom du client *</label>
            <input
              className="form-input"
              value={form.client}
              onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
              placeholder="Ex : DataSafe Maroc SARL"
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Création…" : "Créer la mission →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
