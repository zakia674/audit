import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS = {
  terminee: { label: "Terminée", color: "#16a34a", bar: "#16a34a" },
  en_cours: { label: "En cours", color: "#ea580c", bar: "#ea580c" },
};

export default function MissionCard({ mission, rapport, perimetre, onClick }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    localStorage.setItem("iso_audit_mission_id", mission.id);
    navigate("/");
    if (onClick) onClick();
  }

  const status = STATUS[mission.statut] || { label: mission.statut, color: "#6b7280", bar: "#6b7280" };

  const dateStr = mission.date_creation
    ? new Date(mission.date_creation).toLocaleDateString("fr-FR")
    : null;

  // Indicateur de progression
  const evalues = perimetre?.evalues ?? 0;
  const total   = perimetre?.totalControles ?? 0;
  const pct     = total > 0 ? Math.round((evalues / total) * 100) : 0;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered ? "0 6px 20px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Barre colorée statut */}
      <div style={{ height: 4, background: status.bar, flexShrink: 0 }} />

      {/* Corps */}
      <div style={{ padding: "1rem 1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>

        {/* Ligne 1 : titre + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <div style={{
            flex: 1,
            fontWeight: 700,
            fontSize: 16,
            color: "var(--primary)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {mission.titre}
          </div>
          <span style={{
            flexShrink: 0,
            fontSize: "0.72rem",
            fontWeight: 600,
            padding: "0.2rem 0.55rem",
            borderRadius: 3,
            background: status.color,
            color: "#fff",
            whiteSpace: "nowrap",
            marginTop: 2,
          }}>
            {status.label}
          </span>
        </div>

        {/* Ligne 2 : client */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 13, color: "var(--muted)" }}>
          <span>🏢</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {mission.client || <em>Client non renseigné</em>}
          </span>
        </div>

        {/* Ligne 3 : auditeur */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 13, color: "var(--muted)" }}>
          <span>👤</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {mission.auditeur || <em>Auditeur non renseigné</em>}
          </span>
        </div>

        {/* Ligne 4 : date */}
        {dateStr && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 12, color: "#9ca3af" }}>
            <span>📅</span>
            <span>{dateStr}</span>
          </div>
        )}
      </div>

      {/* Séparateur + barre de progression */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "0.6rem 1rem 0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              background: status.bar,
              borderRadius: 3,
              transition: "width 0.4s",
            }} />
          </div>
          <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap", flexShrink: 0 }}>
            {evalues} / {total} contrôles
          </span>
        </div>
      </div>
    </div>
  );
}
