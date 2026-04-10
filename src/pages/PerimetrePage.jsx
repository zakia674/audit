import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAudit } from "../context/AuditContext";

const THEME_COLORS = {
  Organisationnel: "#1B3A5C",
  Humain:          "#2D6A4F",
  Physique:        "#6B4226",
  Technologique:   "#4A1942",
};

export default function PerimetrePage() {
  const navigate = useNavigate();
  const { controls, perimetre, savePerimetre, missionId } = useAudit();

  // Charger les contrôles depuis l'API (avec leur id numérique)
  const [apiControles, setApiControles] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/controles")
      .then(r => r.json())
      .then(data => {
        setApiControles(data);
        // Pré-sélectionner le périmètre existant
        if (perimetre.length > 0) {
          setSelected(new Set(perimetre));
        } else {
          // Par défaut : tout sélectionner
          setSelected(new Set(data.map(c => c.id)));
        }
      })
      .catch(() => {});
  }, [perimetre]);

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSaved(false);
  }

  function selectAll()   { setSelected(new Set(apiControles.map(c => c.id))); setSaved(false); }
  function selectNone()  { setSelected(new Set()); setSaved(false); }

  async function handleSave() {
    await savePerimetre([...selected]);
    setSaved(true);
  }

  // Grouper par thème
  const themes = ["Organisationnel", "Humain", "Physique", "Technologique"];

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h2>Périmètre d'audit</h2>
        <p>Sélectionnez les contrôles ISO 27002 pertinents pour cette mission. Seuls les contrôles sélectionnés apparaîtront dans la section évaluation.</p>
      </div>

      {/* Actions rapides */}
      <div style={{ display:"flex", gap:"0.75rem", alignItems:"center", flexWrap:"wrap" }}>
        <button className="btn-secondary" onClick={selectAll}>Tout sélectionner</button>
        <button className="btn-secondary" onClick={selectNone}>Tout désélectionner</button>
        <span style={{ color:"var(--muted)", fontSize:"0.85rem" }}>
          {selected.size} contrôle{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
        </span>
      </div>

      {/* Contrôles groupés par thème */}
      {themes.map(theme => {
        const themeControles = apiControles.filter(c => c.theme === theme);
        if (!themeControles.length) return null;
        return (
          <div key={theme}>
            <div style={{
              fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em",
              color: THEME_COLORS[theme], fontWeight:700, marginBottom:"0.5rem",
              borderLeft:`3px solid ${THEME_COLORS[theme]}`, paddingLeft:"0.6rem",
            }}>
              {theme}
            </div>
            <div className="controls-list" style={{ marginBottom:"1rem" }}>
              {themeControles.map(c => (
                <div
                  key={c.id}
                  className="control-row"
                  style={{
                    borderLeftColor: selected.has(c.id) ? THEME_COLORS[theme] : "var(--border)",
                    cursor: "pointer",
                    opacity: selected.has(c.id) ? 1 : 0.5,
                  }}
                  onClick={() => toggle(c.id)}
                >
                  <div className="control-row-left">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      readOnly
                      style={{ width:16, height:16, accentColor: THEME_COLORS[theme], cursor:"pointer", flexShrink:0 }}
                    />
                    <span className="control-num">{c.code_iso}</span>
                    <div>
                      <div className="control-title-text">{c.titre}</div>
                      <div className="control-theme-tag">{c.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Boutons */}
      <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={selected.size === 0}
        >
          {saved ? "✓ Périmètre enregistré" : `Enregistrer le périmètre (${selected.size} contrôles)`}
        </button>
        {saved && selected.size > 0 && (
          <button className="btn-primary" onClick={() => navigate("/audit/controls")}>
            Commencer les évaluations →
          </button>
        )}
      </div>
    </div>
  );
}
