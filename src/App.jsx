import { useState } from "react";
import { Routes, Route, NavLink, BrowserRouter, Navigate, useLocation } from "react-router-dom";
import { AuditProvider, useAudit } from "./context/AuditContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ScenarioPage from "./pages/ScenarioPage";
import ControlsListPage from "./pages/ControlsListPage";
import ControlDetailPage from "./pages/ControlDetailPage";
import RiskPage from "./pages/RiskPage";
import ReportPage from "./pages/ReportPage";
import DashboardPage from "./pages/DashboardPage";
import PerimetrePage from "./pages/PerimetrePage";
import "./App.css";

// ── Guard : redirige vers /login si non connecté ──────────────────────────────
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const IC = {
  contexte:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  mission:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  entreprise:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10"/></svg>,
  reseau:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/><path d="M5 8v4h14V8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>,
  incidents:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  controles:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  perimetre:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  liste:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  rapport:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};

function GlobalSidebar({ collapsed, setCollapsed }) {
  const { progress, score } = useAudit();
  const { logout } = useAuth();
  const [openHome,     setOpenHome]     = useState(true);
  const [openControls, setOpenControls] = useState(true);
  const [darkMode,     setDarkMode]     = useState(() => document.body.classList.contains("dark-mode"));

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark-mode", next);
  }

  const HOME_STEPS = [
    { id: "mission",    label: "Lettre de mission",      icon: IC.mission },
    { id: "entreprise", label: "Fiche entreprise",       icon: IC.entreprise },
    { id: "reseau",     label: "Architecture technique", icon: IC.reseau },
    { id: "incidents",  label: "Incidents de sécurité",  icon: IC.incidents },
  ];

  function Section({ label, icon, open, onToggle, children }) {
    return (
      <div className={`gs-section ${open ? "open" : ""}`}>
        <button className="gs-section-header" onClick={onToggle} title={collapsed ? label : ""}>
          {collapsed
            ? <span className="gs-icon-only">{icon}</span>
            : <><span className="gs-section-label">{label}</span><span className="gs-section-arrow">{open ? "▾" : "▸"}</span></>
          }
        </button>
        {(open || collapsed) && <div className="gs-section-body">{children}</div>}
      </div>
    );
  }

  function SideItem({ to, label, icon, exact }) {
    return (
      <NavLink
        to={to} end={exact}
        className={({ isActive }) => `gs-item ${isActive ? "active" : ""}`}
        title={label}
      >
        {collapsed
          ? <span className="gs-icon-only">{icon}</span>
          : <span className="gs-item-label">{label}</span>
        }
      </NavLink>
    );
  }

  return (
    <aside className={`global-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="gs-brand" style={{ cursor:"pointer" }} onClick={() => window.location.href="/dashboard"}>
        {collapsed
          ? <span className="gs-brand-icon">⇒</span>
          : <><span className="gs-brand-text">Learn ⇒ Audit</span><div className="gs-brand-line"/></>
        }
      </div>

      <nav className="gs-nav">
        <Section label="Contexte" icon={IC.contexte} open={openHome} onToggle={() => setOpenHome(v => !v)}>
          {HOME_STEPS.map((s) => (
            <NavLink
              key={s.id}
              to={`/audit/?step=${s.id}`}
              className={({ isActive }) => `gs-sub-item${isActive ? " active" : ""}`}
              title={s.label}
            >
              {collapsed
                ? <span className="gs-icon-only">{s.icon}</span>
                : <span className="gs-sub-label">{s.label}</span>
              }
            </NavLink>
          ))}
        </Section>

        <Section label="Contrôles" icon={IC.controles} open={openControls} onToggle={() => setOpenControls(v => !v)}>
          <SideItem to="/audit/perimetre" label="Périmètre d'audit" icon={IC.perimetre} />
          <SideItem to="/audit/controls" label="Liste des contrôles" icon={IC.liste} exact />
        </Section>

        <SideItem to="/audit/report" label="Rapport final" icon={IC.rapport} exact />
      </nav>

      {!collapsed && (
        <div className="gs-score">
          <div className="gs-score-bar-track">
            <div className="gs-score-bar-fill" style={{ width: `${progress}%` }}/>
          </div>
          <div className="gs-score-labels">
            <span>{progress}% audité</span>
            <span>{score}% conf.</span>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => { logout(); window.location.href = "/"; }}
        title="Déconnexion"
        style={{
          padding: "0.65rem",
          background: "rgba(255,255,255,0.04)",
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: "0.6rem",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.10)"}
        onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        {!collapsed && <span style={{ fontSize:"0.82rem" }}>Déconnexion</span>}
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        title={darkMode ? "Mode clair" : "Mode sombre"}
        style={{
          padding: "0.6rem 0.65rem",
          background: "rgba(255,255,255,0.04)",
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: "0.6rem",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.10)"}
        onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}
      >
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          {!collapsed && <span style={{ fontSize:"0.82rem" }}>Mode sombre</span>}
        </div>
        {!collapsed && (
          <div style={{
            width: 36, height: 20, borderRadius: 10,
            background: darkMode ? "#4a90d9" : "rgba(255,255,255,0.2)",
            position: "relative", transition: "background 0.2s", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 2,
              left: darkMode ? 18 : 2,
              width: 16, height: 16, borderRadius: "50%",
              background: "#fff", transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}/>
          </div>
        )}
      </button>

      <button className="gs-collapse-btn" onClick={() => setCollapsed(v => !v)}>
        {collapsed ? "▶" : "◀"}
      </button>
    </aside>
  );
}

// ── Routes protégées avec sidebar ─────────────────────────────────────────────
function AuditRoutes() {
  const [collapsed, setCollapsed] = useState(false);
  const { missionId } = useAudit();
  const hasMission = !!missionId || !!localStorage.getItem("iso_audit_mission_id");
  const key = missionId || localStorage.getItem("iso_audit_mission_id") || "none";

  return (
    <Routes>
      {!hasMission && <Route path="*" element={<Navigate to="/dashboard" replace />} />}
      <Route path="/*" element={
        <div className="app-shell">
          <GlobalSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <main className={`app-main ${collapsed ? "sidebar-collapsed" : ""}`}>
            <Routes>
              <Route path="/" element={<ScenarioPage />} />
              <Route path="/perimetre" element={<PerimetrePage />} />
              <Route path="/controls" element={<ControlsListPage />} />
              <Route path="/controls/:controlId" element={<ControlDetailPage />} />
              <Route path="/controls/:controlId/risk" element={<RiskPage />} />
              <Route path="/report" element={<ReportPage />} />
            </Routes>          </main>
        </div>
      } />
    </Routes>
  );
}

// ── Routing global ────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard protégé */}
      <Route path="/dashboard" element={
        <RequireAuth><DashboardPage /></RequireAuth>
      } />

      {/* Audit protégé avec sidebar */}
      <Route path="/audit/*" element={
        <RequireAuth>
          <AuditProvider>
            <AuditRoutes />
          </AuditProvider>
        </RequireAuth>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
