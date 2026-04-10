import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconHelp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function initiales(nom) {
  if (!nom) return "?";
  const parts = nom.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed"];
function avatarColor(nom) {
  if (!nom) return "#9ca3af";
  let h = 0;
  for (let i = 0; i < nom.length; i++) h = nom.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function DashboardHeader({ onNewMission }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const auditorName = user?.nom || "Auditeur";
  const HAS_NOTIFS = false;
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const profileRef = useRef(null);
  const helpRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const iconBtn = {
    position: "relative", background: "none", border: "1px solid var(--border, #e5e7eb)",
    borderRadius: 8, cursor: "pointer", padding: "7px 8px", color: "var(--muted, #6b7280)",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const dropdown = {
    position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 300,
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: 180, overflow: "hidden",
  };

  function MenuItem({ label, color = "#374151", onClick }) {
    const [hov, setHov] = useState(false);
    return (
      <button onClick={onClick}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ display:"block", width:"100%", padding:"10px 16px", background: hov ? "#f9fafb" : "none",
          border:"none", cursor:"pointer", fontSize:13, color, textAlign:"left" }}>
        {label}
      </button>
    );
  }

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.25rem 2.5rem", borderBottom: "1px solid var(--border)",
      background: "var(--card-bg)",
    }}>
      <div>
        <h1 style={{ fontFamily:"'Libre Baskerville', Georgia, serif", fontSize:"1.4rem",
          fontWeight:700, color:"var(--primary)", margin:0, lineHeight:1.2 }}>
          Learn ⇒ Audit
        </h1>
        <p style={{ fontSize:"0.85rem", color:"var(--muted)", margin:"0.2rem 0 0" }}>
          Plateforme d&apos;audit ISO 27001/27002
        </p>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {/* Nouvelle mission */}
        <button
          onClick={onNewMission}
          style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"8px 16px", background:"var(--primary)", color:"#fff",
            border:"none", borderRadius:8, fontSize:13, fontWeight:700,
            cursor:"pointer", boxShadow:"0 2px 8px rgba(27,58,92,0.2)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouvelle mission
        </button>
        {/* Cloche */}
        <button style={iconBtn} aria-label="Notifications">
          <IconBell />
          {HAS_NOTIFS && (
            <span style={{ position:"absolute", top:5, right:5, width:7, height:7,
              borderRadius:"50%", background:"#dc2626", border:"1.5px solid #fff" }} />
          )}
        </button>

        {/* Aide */}
        <div ref={helpRef} style={{ position:"relative" }}>
          <button style={iconBtn} aria-label="Aide" onClick={() => setHelpOpen(v => !v)}>
            <IconHelp />
          </button>
          {helpOpen && (
            <div style={dropdown}>
              <div style={{ padding:"10px 16px 6px", fontSize:11, fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em", color:"#9ca3af" }}>
                Aide
              </div>
              <MenuItem label="Documentation" />
              <MenuItem label="Guide de démarrage" />
              <MenuItem label="Contacter le support" />
            </div>
          )}
        </div>

        {/* Avatar profil */}
        <div ref={profileRef} style={{ position:"relative" }}>
          <button onClick={() => setProfileOpen(v => !v)} aria-label="Menu profil"
            style={{ width:36, height:36, borderRadius:"50%", background:avatarColor(auditorName),
              color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {initiales(auditorName)}
          </button>
          {profileOpen && (
            <div style={dropdown}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{auditorName}</div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>Auditeur</div>
              </div>
              <MenuItem label="Mon profil" />
              <MenuItem label="Paramètres" />
              <div style={{ borderTop:"1px solid #f3f4f6" }}>
                <MenuItem label="Déconnexion" color="#dc2626" onClick={() => { logout(); navigate("/"); }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
