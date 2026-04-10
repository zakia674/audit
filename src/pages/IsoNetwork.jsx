import { useState, useCallback, useRef } from "react";

const NODES = {
  internet: { label: "Internet",            sub: "Maroc Telecom / 41.248.77.0/24",          icon: "internet",    warn: false, details: null },
  firewall: { label: "FortiGate 60F",       sub: "Firmware 7.2.4 — ⚠ non mis à jour",       icon: "firewall",    warn: true,  details: "Modèle : Fortinet FortiGate 60F\nFirmware : 7.2.4 (MAJ : 14/08/2024)\nRègles actives : 47 | VPN SSL : 18 tunnels\nIPS/IDS : activé\n⚠ Firmware non mis à jour depuis 7 mois" },
  switch:   { label: "HP Aruba 2930F",      sub: "Switch 24G — 3 VLANs",                    icon: "switch",      warn: false, details: "Modèle : HP Aruba 2930F 24G\nVLAN : Admin / Users / DMZ\nPort mirroring : NON\nDernière MAJ firmware : inconnue" },
  srv01:    { label: "DATASAFE-SRV01",      sub: "Windows Server 2019\nAD DS / DNS / DHCP", icon: "server",      warn: true,  details: "Dell PowerEdge R740\nOS : Windows Server 2019\nRôles : AD DS, DNS, DHCP, File Server\nRAM : 64 Go | Xeon 16 cœurs\n⚠ SPOF — pas de redondance" },
  srv02:    { label: "DATASAFE-SRV02",      sub: "Windows Server 2022\nApplication / IIS",  icon: "server",      warn: false, details: "Dell PowerEdge R740\nOS : Windows Server 2022\nRôles : Application Server, IIS\nRAM : 32 Go | Xeon 8 cœurs" },
  nas:      { label: "NAS Synology DS923+", sub: "32 To — ⚠ pas de copie hors site",        icon: "nas",         warn: true,  details: "Synology DS923+\nCapacité : 32 To (utilisé : 24 To)\nSauvegardes : hebdomadaires\nChiffrement : NON\n⚠ Pas de copie hors site" },
  postes:   { label: "35 Postes employés",  sub: "Dell Latitude\nWindows 11 Pro",            icon: "workstation", warn: true,  details: "Dell Latitude 5420/5540\nOS : Windows 11 Pro\nAntivirus : Microsoft Defender\nBitLocker : NON | MDM : NON\n⚠ 7 laptops non inventoriés" },
  azure:    { label: "Azure AD / M365",     sub: "MFA : 6/35 (17%)\n9 admins globaux",      icon: "cloud",       warn: true,  details: "Tenant : datasafe.onmicrosoft.com\nLicences M365 : 35\nMFA activé : 6/35 (17%)\nAdmins globaux : 9\n⚠ 5 comptes ex-employés actifs" },
  vpn:      { label: "VPN Télétravail",     sub: "18 consultants\nsans MFA",                 icon: "vpn",         warn: true,  details: "FortiClient VPN SSL\nUtilisateurs : 18 consultants\nAuth : mot de passe seul\nDouble facteur : NON\n⚠ Accès données clients sans MFA" },
};

const W = 150, H = 140;

// Layout horizontal optimisé — viewBox 1600×950
const POS = {
  internet: { x: 725, y:  30 },
  firewall: { x: 725, y: 220 },
  switch:   { x: 725, y: 410 },
  srv01:    { x:  80, y: 570 },
  srv02:    { x: 290, y: 570 },
  nas:      { x: 185, y: 780 },
  postes:   { x: 650, y: 570 },
  azure:    { x: 1050, y: 570 },
  vpn:      { x: 1200, y: 780 },
};

const ZONES = [
  { label: "Salle Serveurs", color: "#1B3A5C", x:  40, y: 535, w: 440, h: 360 },
  { label: "Postes",         color: "#2D6A4F", x: 620, y: 535, w: 220, h: 210 },
  { label: "Cloud & VPN",    color: "#4A1942", x: 1010, y: 535, w: 290, h: 360 },
];

const LINKS = [
  { from: "internet", to: "firewall", dashed: false },
  { from: "firewall", to: "switch",   dashed: false },
  { from: "switch",   to: "srv01",    dashed: false },
  { from: "switch",   to: "srv02",    dashed: false },
  { from: "switch",   to: "postes",   dashed: false },
  { from: "switch",   to: "azure",    dashed: false },
  { from: "srv01",    to: "nas",      dashed: false },
  { from: "firewall", to: "vpn",      dashed: true  },
  { from: "azure",    to: "vpn",      dashed: false },
];

function NodeIcon({ type, warn, size = 64 }) {
  const c = warn ? "#C45000" : "#1B3A5C";
  if (type === "internet") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="18" stroke={c} strokeWidth="2.5"/>
      <ellipse cx="22" cy="22" rx="8" ry="18" stroke={c} strokeWidth="1.8"/>
      <line x1="4" y1="22" x2="40" y2="22" stroke={c} strokeWidth="1.8"/>
    </svg>
  );
  if (type === "firewall") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="4" y="8" width="36" height="28" rx="3" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2.5"/>
      <rect x="9"  y="14" width="6" height="16" rx="1.5" fill={c}/>
      <rect x="19" y="14" width="6" height="16" rx="1.5" fill={c}/>
      <rect x="29" y="14" width="6" height="16" rx="1.5" fill={c}/>
    </svg>
  );
  if (type === "switch") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="2" y="14" width="40" height="16" rx="3" fill="#DDE6F0" stroke={c} strokeWidth="2.5"/>
      {[8,14,20,26,32,38].map(x => <circle key={x} cx={x} cy="22" r="2.5" fill={c}/>)}
      <line x1="10" y1="8" x2="10" y2="14" stroke={c} strokeWidth="2"/>
      <line x1="22" y1="8" x2="22" y2="14" stroke={c} strokeWidth="2"/>
      <line x1="34" y1="8" x2="34" y2="14" stroke={c} strokeWidth="2"/>
    </svg>
  );
  if (type === "server") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="4" y="4"  width="36" height="10" rx="2" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2"/>
      <rect x="4" y="17" width="36" height="10" rx="2" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2"/>
      <rect x="4" y="30" width="36" height="10" rx="2" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2"/>
      <circle cx="36" cy="9"  r="2.5" fill={warn?"#C45000":"#1A5C35"}/>
      <circle cx="36" cy="22" r="2.5" fill={warn?"#C45000":"#1A5C35"}/>
      <circle cx="36" cy="35" r="2.5" fill="#1A5C35"/>
    </svg>
  );
  if (type === "nas") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="10" y="4" width="24" height="36" rx="3" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2"/>
      <rect x="14" y="10" width="16" height="5" rx="1" fill={c} opacity="0.35"/>
      <rect x="14" y="19" width="16" height="5" rx="1" fill={c} opacity="0.35"/>
      <rect x="14" y="28" width="16" height="5" rx="1" fill={c} opacity="0.35"/>
      <circle cx="28" cy="12.5" r="2" fill={warn?"#C45000":"#1A5C35"}/>
      <circle cx="28" cy="21.5" r="2" fill={warn?"#C45000":"#1A5C35"}/>
    </svg>
  );
  if (type === "workstation") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="2" y="4"  width="40" height="26" rx="2" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2"/>
      <rect x="6" y="8"  width="32" height="18" rx="1" fill={c} opacity="0.12"/>
      <rect x="16" y="30" width="12" height="4" fill={c} opacity="0.35"/>
      <rect x="10" y="34" width="24" height="3" rx="1" fill={c} opacity="0.25"/>
    </svg>
  );
  if (type === "cloud") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <path d="M36 30H10a8 8 0 01-1-15.9A10 10 0 0134 20a6 6 0 012 10z" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2"/>
      <line x1="14" y1="38" x2="14" y2="30" stroke={c} strokeWidth="2"/>
      <line x1="20" y1="40" x2="20" y2="30" stroke={c} strokeWidth="2"/>
      <line x1="26" y1="40" x2="26" y2="30" stroke={c} strokeWidth="2"/>
      <line x1="32" y1="38" x2="32" y2="30" stroke={c} strokeWidth="2"/>
    </svg>
  );
  if (type === "vpn") return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="4" y="14" width="36" height="20" rx="3" fill={warn?"#FFE4D0":"#DDE6F0"} stroke={c} strokeWidth="2"/>
      <circle cx="22" cy="24" r="6" stroke={c} strokeWidth="2" fill="none"/>
      <circle cx="22" cy="24" r="2.5" fill={c}/>
      <line x1="22" y1="18" x2="22" y2="14" stroke={c} strokeWidth="2"/>
      <line x1="16" y1="14" x2="28" y2="14" stroke={c} strokeWidth="2"/>
    </svg>
  );
  return null;
}

function Arrow({ from, to, dashed }) {
  const f = POS[from], t = POS[to];
  const fx = f.x + W/2, fy = f.y + H/2;
  const tx = t.x + W/2, ty = t.y + H/2;
  const dx = tx-fx, dy = ty-fy;
  const len = Math.sqrt(dx*dx+dy*dy);
  const nx = dx/len, ny = dy/len;
  const pad = 82;
  return (
    <line
      x1={fx+nx*pad} y1={fy+ny*pad}
      x2={tx-nx*pad} y2={ty-ny*pad}
      stroke={dashed?"#6B3FA0":"#1B3A5C"}
      strokeWidth="3" strokeOpacity="0.6"
      strokeDasharray={dashed?"12,7":"none"}
      markerEnd={dashed?"url(#arrowP)":"url(#arrowB)"}
    />
  );
}

function NetNode({ id, onHover }) {
  const node = NODES[id];
  const { x, y } = POS[id];
  const cx = x + W/2;
  const iconSize = 64;
  const ix = cx - iconSize/2;
  const iy = y + 12;

  return (
    <g onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)} style={{cursor:"pointer"}}>
      <rect x={x} y={y} width={W} height={H} rx="12"
        fill="#fff"
        stroke={node.warn?"#C45000":"#C8D4E0"}
        strokeWidth="2.5"
      />
      {/* Icône SVG inline — compatible canvas export */}
      <g transform={`translate(${ix},${iy})`}>
        <NodeIcon type={node.icon} warn={node.warn} size={iconSize}/>
      </g>
      {node.warn && (
        <>
          <circle cx={x+W-14} cy={y+14} r="13" fill="#C45000"/>
          <text x={x+W-14} y={y+20} textAnchor="middle" fontSize="15" fill="#fff" fontWeight="bold">!</text>
        </>
      )}
      <text x={cx} y={y+H+26} textAnchor="middle" fontSize="16" fontWeight="700" fill="#1C1C1C" fontFamily="sans-serif">
        {node.label}
      </text>
      {node.sub.split("\n").map((line, i) => (
        <text key={i} x={cx} y={y+H+48+i*22} textAnchor="middle" fontSize="14"
          fill={node.warn?"#C45000":"#444"} fontFamily="sans-serif" fontWeight="500">
          {line}
        </text>
      ))}
    </g>
  );
}

export default function IsoNetwork() {
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const node = hovered ? NODES[hovered] : null;

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 });
  }, []);

  // Export PNG — approche fiable via data URL
  function exportPNG() {
    const svg = svgRef.current;
    if (!svg) return;

    // Cloner le SVG et remplacer les foreignObject par des rect (les icônes ne passent pas en canvas)
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    // Supprimer les foreignObject (icônes React) — les nœuds restent visibles via les rect/text
    clone.querySelectorAll("foreignObject").forEach(fo => fo.remove());

    const svgStr = new XMLSerializer().serializeToString(clone);
    const encoded = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);

    const w = 1600, h = 980;
    const canvas = document.createElement("canvas");
    canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.fillStyle = "#F7F5F0";
    ctx.fillRect(0, 0, w, h);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "architecture-datasafe.png";
      a.click();
    };
    img.onerror = () => {
      // Fallback : télécharger le SVG si le canvas échoue
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "architecture-datasafe.svg"; a.click();
      URL.revokeObjectURL(url);
    };
    img.src = encoded;
  }

  return (
    <div ref={wrapRef} className={`iso-wrap ${fullscreen ? "iso-fullscreen" : ""}`}>
      {/* Barre du haut avec légende + boutons */}
      <div className="iso-topbar">
        <div className="iso-legend">
          <span className="iso-legend-item"><span className="iso-legend-dot warn"/>Anomalie</span>
          <span className="iso-legend-item"><span className="iso-legend-dot ok"/>Nominal</span>
          <span className="iso-legend-item"><span className="iso-legend-line dashed"/>VPN</span>
          <span className="iso-legend-item"><span className="iso-legend-line"/>LAN</span>
        </div>
        <div style={{display:"flex", gap:"0.5rem", alignItems:"center"}}>
          <button className="iso-fullscreen-btn" onClick={exportPNG} title="Exporter en PNG">
            ↓ PNG
          </button>
          <button className="iso-fullscreen-btn" onClick={() => setFullscreen(v => !v)}>
            {fullscreen ? "⊠ Quitter plein écran" : "⊞ Plein écran"}
          </button>
        </div>
      </div>

      {/* Canvas SVG */}
      <div className="iso-canvas-container" style={{position:"relative"}} onMouseMove={handleMouseMove}>
        <svg
          ref={svgRef}
          viewBox="0 0 1600 980"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          style={{width:"100%", height:"100%", display:"block"}}
        >
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#1B3A5C" floodOpacity="0.12"/>
            </filter>
            <marker id="arrowB" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto">
              <path d="M0,0 L0,8 L9,4 z" fill="#1B3A5C" opacity="0.6"/>
            </marker>
            <marker id="arrowP" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto">
              <path d="M0,0 L0,8 L9,4 z" fill="#6B3FA0" opacity="0.7"/>
            </marker>
          </defs>

          {ZONES.map(z => (
            <g key={z.label}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="12"
                fill={z.color} fillOpacity="0.06"
                stroke={z.color} strokeWidth="2" strokeOpacity="0.3" strokeDasharray="8,5"/>
              <text x={z.x+16} y={z.y+z.h-16} fontSize="18" fontWeight="700"
                fill={z.color} fontFamily="serif" opacity="0.8">{z.label}</text>
            </g>
          ))}

          {LINKS.map((l,i) => <Arrow key={i} {...l}/>)}
          {Object.keys(NODES).map(id => (
            <NetNode key={id} id={id} onHover={setHovered}/>
          ))}
        </svg>

        {/* Tooltip — suit la souris, se décale si bord droit */}
        {node && node.details && (
          <div className="iso-tooltip" style={{
            top: mouse.y + 12,
            left: mouse.x > window.innerWidth - 340 ? mouse.x - 320 : mouse.x + 12,
            right: "auto",
          }}>
            <div className="iso-tooltip-title">
              {node.warn && <span className="iso-tooltip-warn-dot">!</span>}
              {node.label}
            </div>
            <div className="iso-tooltip-sub">{node.sub.replace("\n"," — ")}</div>
            <pre className="iso-tooltip-body">{node.details}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
