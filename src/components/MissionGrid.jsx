import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MissionModal from "./MissionModal";

// ── helpers ───────────────────────────────────────────────────────────────────

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

function progressColor(pct) {
  if (pct < 50) return "#dc2626";
  if (pct < 80) return "#ea580c";
  return "#16a34a";
}

const SORT_OPTIONS = [
  { key: "date_asc",  label: "Date de création croissante" },
  { key: "date_desc", label: "Date de création décroissante" },
  { key: "score_asc", label: "Score croissant" },
  { key: "score_desc",label: "Score décroissant" },
  { key: "nom_az",    label: "Nom A → Z" },
];

// ── SVG icons ─────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const IconBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/>
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const IconFolder = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconSearchEmpty = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconDots = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
);

// ── sous-composants ───────────────────────────────────────────────────────────

function ProgressCell({ perimetre }) {
  if (!perimetre) {
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ flex:1, height:6, background:"#e5e7eb", borderRadius:3 }} />
          <span style={{ fontSize:11, color:"#9ca3af", whiteSpace:"nowrap" }}>—</span>
        </div>
        <div style={{ fontSize:10, color:"#9ca3af", marginTop:3, fontStyle:"italic" }}>
          Périmètre non défini
        </div>
      </div>
    );
  }
  const { evalues, totalControles, progressPercent: pct } = perimetre;
  const color = progressColor(pct);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ flex:1, height:6, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width .4s" }} />
        </div>
        <span style={{ fontSize:11, color:"#6b7280", whiteSpace:"nowrap", flexShrink:0 }}>{pct}%</span>
      </div>
      <div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>
        {evalues} sur {totalControles} contrôles
      </div>
    </div>
  );
}

function DotsMenu({ mission, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          background:"none", border:"1px solid #e5e7eb", borderRadius:4,
          cursor:"pointer", padding:"4px 7px", color:"#6b7280",
          lineHeight:1, display:"flex", alignItems:"center",
        }}
        aria-label="Actions"
      >
        <IconDots />
      </button>
      {open && (
        <div style={{
          position:"absolute", right:0, top:"calc(100% + 4px)", zIndex:200,
          background:"#fff", border:"1px solid #e5e7eb", borderRadius:6,
          boxShadow:"0 4px 16px rgba(0,0,0,0.10)", minWidth:150, overflow:"hidden",
        }}>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onEdit(mission); }}
            style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 14px",
              background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#374151", textAlign:"left" }}
            onMouseEnter={e => e.currentTarget.style.background="#f3f4f6"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
          >
            <IconEdit /> Modifier
          </button>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onDelete(mission); }}
            style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 14px",
              background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#dc2626", textAlign:"left" }}
            onMouseEnter={e => e.currentTarget.style.background="#fef2f2"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
          >
            <IconTrash /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

// ── composant principal ───────────────────────────────────────────────────────

export default function MissionGrid({ missions, rapports, perimetres, onMissionClick, onMissionsChange }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("en_cours");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const filterRef = useRef(null);

  const countActives   = missions.filter(m => m.statut === "en_cours").length;
  const countTerminees = missions.filter(m => m.statut === "terminee").length;

  useEffect(() => {
    if (!filterOpen) return;
    function handler(e) { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const displayed = useMemo(() => {
    let list = missions.filter(m => m.statut === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.titre?.toLowerCase().includes(q) || m.client?.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sort === "date_asc")  return new Date(a.date_creation) - new Date(b.date_creation);
      if (sort === "date_desc") return new Date(b.date_creation) - new Date(a.date_creation);
      if (sort === "nom_az")    return (a.titre || "").localeCompare(b.titre || "");
      if (sort === "score_asc") return (rapports?.[a.id]?.score_global ?? -1) - (rapports?.[b.id]?.score_global ?? -1);
      if (sort === "score_desc") return (rapports?.[b.id]?.score_global ?? -1) - (rapports?.[a.id]?.score_global ?? -1);
      return 0;
    });
    return list;
  }, [missions, tab, search, sort, rapports]);

  function openMission(m) {
    localStorage.setItem("iso_audit_mission_id", m.id);
    localStorage.removeItem("iso_audit_datasafe");
    if (onMissionClick) onMissionClick(m.id);
    else navigate("/");
  }

  async function handleDelete(m) {
    if (!confirm(`Supprimer la mission "${m.titre}" et toutes ses données ?`)) return;
    await fetch(`/api/missions/${m.id}`, { method: "DELETE" });
    if (onMissionsChange) onMissionsChange(prev => prev.filter(x => x.id !== m.id));
  }

  function handleModalSave(savedMission, isNew) {
    if (onMissionsChange) {
      if (isNew) onMissionsChange(prev => [savedMission, ...prev]);
      else onMissionsChange(prev => prev.map(x => x.id === savedMission.id ? { ...x, ...savedMission } : x));
    }
    setModal(null);
  }

  const thStyle = {
    padding: "10px 14px", fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.07em",
    color: "#6b7280", background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb", textAlign: "left", whiteSpace: "nowrap",
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>

      {/* Onglets */}
      <div style={{ display:"flex", borderBottom:"2px solid #e5e7eb" }}>
        {[
          { key:"en_cours", label:"Actives",   count: countActives },
          { key:"terminee", label:"Terminées", count: countTerminees },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
            style={{
              background:"none", border:"none", cursor:"pointer", padding:"10px 20px",
              fontSize:14, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? "var(--primary)" : "#9ca3af",
              borderBottom: tab === t.key ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom:-2, transition:"color .15s",
            }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Barre recherche + filtre */}
      <div style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 0", marginBottom:4 }}>
        <div style={{ flex:"0 0 60%", position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", pointerEvents:"none", display:"flex" }}>
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une mission ou un client"
            style={{
              width:"100%", boxSizing:"border-box", padding:"8px 12px 8px 32px",
              border:"1px solid #e5e7eb", borderRadius:6,
              fontSize:13, color:"#374151", background:"#fff", outline:"none",
            }}
            onFocus={e => e.target.style.borderColor = "var(--primary)"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div ref={filterRef} style={{ position:"relative" }}>
          <button onClick={() => setFilterOpen(v => !v)}
            style={{
              display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
              border:"1px solid #e5e7eb", borderRadius:6, background:"#fff",
              cursor:"pointer", fontSize:13, color:"#374151", fontWeight:500,
            }}>
            <IconFilter /> Filtrer
          </button>
          {filterOpen && (
            <div style={{
              position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:100,
              background:"#fff", border:"1px solid #e5e7eb", borderRadius:6,
              boxShadow:"0 4px 16px rgba(0,0,0,0.10)", minWidth:220, overflow:"hidden",
            }}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => { setSort(opt.key); setFilterOpen(false); }}
                  style={{
                    display:"block", width:"100%", padding:"9px 14px",
                    background: sort === opt.key ? "#f0f4ff" : "none",
                    border:"none", cursor:"pointer", fontSize:13,
                    color: sort === opt.key ? "var(--primary)" : "#374151",
                    textAlign:"left", fontWeight: sort === opt.key ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (sort !== opt.key) e.currentTarget.style.background="#f9fafb"; }}
                  onMouseLeave={e => { if (sort !== opt.key) e.currentTarget.style.background="none"; }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div style={{ border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden", background:"#fff" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
          <colgroup>
            <col style={{ width:"35%" }} /><col style={{ width:"22%" }} />
            <col style={{ width:"25%" }} /><col style={{ width:"18%" }} />
          </colgroup>
          <thead>
            <tr>
              {["Mission","Client","Progression","Actions"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div style={{ textAlign:"center", padding:"3rem 1rem", color:"#9ca3af" }}>
                    {search.trim() ? (
                      <>
                        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><IconSearchEmpty /></div>
                        <div style={{ fontSize:14 }}>Aucun résultat pour cette recherche</div>
                      </>
                    ) : (
                      <>
                        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><IconFolder /></div>
                        <div style={{ fontSize:14, marginBottom:12 }}>
                          {tab === "en_cours" ? "Aucune mission active pour l'instant" : "Aucune mission terminée"}
                        </div>
                        {tab === "en_cours" && (
                          <button className="btn-primary" onClick={() => setModal({ mode:"create" })} style={{ fontSize:13 }}>
                            Créer une mission
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : displayed.map(m => (
              <MissionRow
                key={m.id}
                mission={m}
                perimetre={perimetres?.[m.id] ?? null}
                onOpen={() => openMission(m)}
                onEdit={() => setModal({ mode:"edit", mission: m })}
                onDelete={() => handleDelete(m)}
                onStart={() => {
                  localStorage.setItem("iso_audit_mission_id", m.id);
                  localStorage.removeItem("iso_audit_datasafe");
                  navigate("/audit/");
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <MissionModal
          mode={modal.mode}
          mission={modal.mission}
          onClose={() => setModal(null)}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}

// ── ligne du tableau ──────────────────────────────────────────────────────────

function DeadlineCell({ mission }) {
  if (!mission.date_fin) {
    return <span style={{ fontSize:11, color:"#9ca3af" }}>—</span>;
  }
  const now = new Date();
  const fin = new Date(mission.date_fin);
  const diff = Math.ceil((fin - now) / (1000 * 60 * 60 * 24));
  const color = diff < 0 ? "#dc2626" : diff <= 7 ? "#ea580c" : diff <= 14 ? "#d97706" : "#16a34a";
  const label = diff < 0 ? `${Math.abs(diff)}j dépassé` : diff === 0 ? "Aujourd'hui" : `${diff}j restants`;
  const barPct = Math.max(0, Math.min(100, diff <= 0 ? 100 : diff >= 30 ? 5 : 100 - (diff / 30) * 100));
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
        <div style={{ flex:1, height:4, background:"#e5e7eb", borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${barPct}%`, background:color, borderRadius:2, transition:"width .4s" }}/>
        </div>
      </div>
      <span style={{ fontSize:11, fontWeight:600, color, whiteSpace:"nowrap" }}>{label}</span>
    </div>
  );
}

function MissionRow({ mission, perimetre, onOpen, onEdit, onDelete, onStart }) {
  const [hovered, setHovered] = useState(false);

  const dateStr = mission.date_creation
    ? new Date(mission.date_creation).toLocaleDateString("fr-FR")
    : "—";

  const badgeStyle = mission.statut === "terminee"
    ? { background:"#16a34a", color:"#fff" }
    : { background:"#ea580c", color:"#fff" };

  const badgeLabel = mission.statut === "terminee" ? "Terminée" : "En cours";

  const tdBase = {
    padding: "12px 14px", borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle", fontSize: 13, color: "#374151",
    background: hovered ? "#f0f4ff" : "#fff", transition: "background .12s",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  };

  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      {/* Mission */}
      <td style={{ ...tdBase, cursor:"pointer" }} onClick={onOpen}>
        <div style={{ color:"#1e3a5f", textDecoration:"underline", textDecorationColor:"#c7d2fe", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {mission.titre}
        </div>
        <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>ISO 27002</div>
      </td>

      {/* Client */}
      <td style={{ ...tdBase, cursor:"pointer" }} onClick={onOpen}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>
          {mission.client || <em style={{ color:"#9ca3af" }}>—</em>}
        </span>
      </td>

      {/* Progression */}
      <td style={{ ...tdBase, whiteSpace:"normal", cursor:"pointer" }} onClick={onOpen}>
        <ProgressCell perimetre={perimetre} />
      </td>

      {/* Actions */}
      <td style={{ ...tdBase, cursor:"default" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <button
            onClick={e => { e.stopPropagation(); onStart(); }}
            style={{
              display:"flex", alignItems:"center", gap:4,
              padding:"5px 10px", background:"#1e3a8a", color:"#fff",
              border:"none", borderRadius:5, fontSize:11, fontWeight:700,
              cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Auditer
          </button>
          <span style={{ ...badgeStyle, fontSize:10, fontWeight:600, padding:"3px 7px", borderRadius:20, whiteSpace:"nowrap", flexShrink:0 }}>
            {badgeLabel}
          </span>
          <DotsMenu mission={mission} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </td>
    </tr>
  );
}
