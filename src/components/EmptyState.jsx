export default function EmptyState({ onNewMission }) {
  // Étapes du workflow en cercle
  const steps = [
    { angle: -90, color: "#1e40af", label: "Lettre de mission",  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { angle:   0, color: "#2563eb", label: "Évaluation contrôles",icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { angle:  90, color: "#3b82f6", label: "Fiche entreprise",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10"/></svg> },
    { angle: 180, color: "#60a5fa", label: "Rapport final",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ];

  const R = 90; // rayon du cercle

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "4rem 2rem", textAlign: "center",
      background: "#f8fafc", minHeight: "calc(100vh - 130px)",
    }}>

      {/* Visuel circulaire */}
      <div style={{ position: "relative", width: 260, height: 260, marginBottom: "2.5rem" }}>

        {/* Cercle SVG de fond */}
        <svg width="260" height="260" style={{ position: "absolute", top: 0, left: 0 }}>
          <circle cx="130" cy="130" r={R} fill="none" stroke="#dbeafe" strokeWidth="3" strokeDasharray="8 6" />
          <path d="M 130 40 A 90 90 0 0 1 220 130" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arr1)" />
          <path d="M 130 220 A 90 90 0 0 1 40 130" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arr2)" />
          <defs>
            <marker id="arr1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" />
            </marker>
            <marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>

        {/* Centre */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 52, height: 52, borderRadius: "50%",
          background: "#1e3a8a",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(30,58,138,0.3)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        {/* Icônes sur le cercle */}
        {steps.map(({ angle, color, label, icon }) => {
          const rad = (angle * Math.PI) / 180;
          const x = 130 + R * Math.cos(rad) - 22;
          const y = 130 + R * Math.sin(rad) - 22;
          return (
            <div key={label} title={label} style={{
              position: "absolute", left: x, top: y,
              width: 44, height: 44, borderRadius: "50%",
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(30,58,138,0.25)",
            }}>
              {icon}
            </div>
          );
        })}
      </div>

      {/* Texte */}
      <h2 style={{
        fontFamily: "'Libre Baskerville', Georgia, serif",
        fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px",
      }}>
        Bienvenue sur Learn ⇒ Audit
      </h2>
      <p style={{
        color: "#64748b", fontSize: "0.95rem", maxWidth: 440,
        lineHeight: 1.7, margin: "0 0 2rem",
      }}>
        Créez votre première mission d&apos;audit pour commencer à évaluer la conformité ISO 27001/27002, collecter les preuves et générer vos rapports.
      </p>

      {/* Bouton */}
      <button className="btn-primary" onClick={onNewMission}
        style={{ padding: "11px 28px", fontSize: "0.95rem", fontWeight: 700 }}>
        + Créer ma première mission
      </button>

      {/* Labels des étapes */}
      <div style={{ display: "flex", gap: 24, marginTop: "2.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {steps.map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
