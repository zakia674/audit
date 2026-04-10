import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STATUT_LABEL = { en_cours: "En cours", terminee: "Terminée", archivee: "Archivée" };
const STATUT_COLOR = { en_cours: "var(--primary)", terminee: "var(--success)", archivee: "var(--muted)" };

export default function MissionsPage() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: "", auditeur: "", client: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/missions")
      .then(r => r.json())
      .then(data => { setMissions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function createMission(e) {
    e.preventDefault();
    if (!form.titre.trim()) { setError("Le titre est requis."); return; }
    if (!form.client.trim()) { setError("Le nom du client est requis."); return; }
    setError("");
    const res = await fetch("/api/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const m = await res.json();
    // Stocker la mission sélectionnée et naviguer vers l'audit
    localStorage.setItem("iso_audit_mission_id", m.id);
    localStorage.removeItem("iso_audit_datasafe");
    navigate("/");
  }

  async function selectMission(m) {
    localStorage.setItem("iso_audit_mission_id", m.id);
    localStorage.removeItem("iso_audit_datasafe");
    navigate("/");
  }

  async function deleteMission(e, id) {
    e.stopPropagation();
    if (!confirm("Supprimer cette mission et toutes ses données ?")) return;
    await fetch(`/api/missions/${id}`, { method: "DELETE" });
    setMissions(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{
        background: "var(--primary)", color: "#fff",
        padding: "1.5rem 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.4rem", fontWeight:700 }}>
            Learn ⇒ Audit
          </div>
          <div style={{ fontSize:"0.82rem", opacity:0.6, marginTop:"0.2rem" }}>
            Plateforme d'audit ISO 27001/27002
          </div>
        </div>
        <button
          className="btn-hero-primary"
          onClick={() => { setShowForm(v => !v); setError(""); }}
          style={{ padding:"0.65rem 1.5rem", fontSize:"0.9rem" }}
        >
          {showForm ? "Annuler" : "+ Nouvelle mission"}
        </button>
      </div>

      <div style={{ maxWidth:860, margin:"2rem auto", padding:"0 1.5rem", width:"100%" }}>

        {/* Formulaire création */}
        {showForm && (
          <div className="step-block" style={{ marginBottom:"1.5rem", gap:"1rem" }}>
            <div className="step-label">Nouvelle mission d'audit</div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={createMission} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div className="justification-field">
                <label>Titre de la mission *</label>
                <input
                  className="form-input"
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  placeholder="Ex : Audit ISO 27001 — DataSafe Maroc 2026"
                />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div className="justification-field">
                  <label>Nom de l'auditeur</label>
                  <input
                    className="form-input"
                    value={form.auditeur}
                    onChange={e => setForm(f => ({ ...f, auditeur: e.target.value }))}
                    placeholder="Ex : Jean Dupont"
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
              </div>
              <div>
                <button type="submit" className="btn-primary">
                  Créer la mission →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des missions */}
        <div className="page-header" style={{ marginBottom:"1rem" }}>
          <h2>Mes missions d'audit</h2>
          <p>Sélectionnez une mission pour continuer ou créez-en une nouvelle.</p>
        </div>

        {loading && (
          <div style={{ textAlign:"center", color:"var(--muted)", padding:"3rem" }}>
            Chargement...
          </div>
        )}

        {!loading && missions.length === 0 && !showForm && (
          <div className="step-block" style={{ textAlign:"center", padding:"3rem", color:"var(--muted)" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>📋</div>
            <p style={{ marginBottom:"1rem" }}>Aucune mission pour l'instant.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Créer ma première mission
            </button>
          </div>
        )}

        <div className="controls-list">
          {missions.map(m => (
            <div
              key={m.id}
              className="control-row"
              style={{ borderLeftColor: STATUT_COLOR[m.statut] || "var(--border)", cursor:"pointer" }}
              onClick={() => selectMission(m)}
            >
              <div className="control-row-left" style={{ flex:1 }}>
                <span className="control-num" style={{ minWidth:32, fontSize:"0.85rem", opacity:0.5 }}>
                  #{m.id}
                </span>
                <div>
                  <div className="control-title-text">{m.titre}</div>
                  <div className="control-theme-tag">
                    {m.client && <span>{m.client}</span>}
                    {m.auditeur && <span> · {m.auditeur}</span>}
                    {m.date_creation && <span> · {new Date(m.date_creation).toLocaleDateString("fr-FR")}</span>}
                  </div>
                </div>
              </div>
              <div className="control-row-right">
                <span className="status-label" style={{ color: STATUT_COLOR[m.statut] }}>
                  {STATUT_LABEL[m.statut] || m.statut}
                </span>
                <button
                  className="btn-primary"
                  style={{ padding:"0.35rem 1rem", fontSize:"0.82rem" }}
                  onClick={() => selectMission(m)}
                >
                  Ouvrir
                </button>
                <button
                  className="btn-danger"
                  style={{ padding:"0.35rem 0.65rem", fontSize:"0.82rem" }}
                  onClick={e => deleteMission(e, m.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
