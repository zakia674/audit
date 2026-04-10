import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── SVG icons ─────────────────────────────────────────────────────────────────
const IconDoc      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconBuilding = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/></svg>;
const IconNetwork  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/><path d="M5 8v4h14V8"/><path d="M12 12v4"/></svg>;
const IconAlert    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconShield   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconChart    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

const FEATURES = [
  { icon: <IconDoc />,      color: "#1e40af", title: "Lettre de mission",       desc: "Rédigez et archivez la lettre de mission officielle avec toutes les informations contractuelles." },
  { icon: <IconBuilding />, color: "#1d4ed8", title: "Fiche entreprise",        desc: "Documentez le contexte organisationnel, les activités et les enjeux de l'entité auditée." },
  { icon: <IconNetwork />,  color: "#2563eb", title: "Architecture technique",  desc: "Cartographiez l'infrastructure réseau et les systèmes d'information concernés par l'audit." },
  { icon: <IconAlert />,    color: "#3b82f6", title: "Gestion des incidents",   desc: "Recensez et analysez les incidents de sécurité passés pour contextualiser les risques." },
  { icon: <IconShield />,   color: "#1e3a8a", title: "Contrôles ISO 27002",     desc: "Évaluez les 93 contrôles de la norme, collectez les preuves et justifiez chaque décision." },
  { icon: <IconChart />,    color: "#0ea5e9", title: "Rapport automatique",     desc: "Générez un rapport professionnel complet avec scores, graphiques et recommandations." },
];

const STEPS = [
  { n: "01", title: "Créez votre mission",        desc: "Définissez le périmètre, le client et les objectifs de l'audit." },
  { n: "02", title: "Collectez les informations", desc: "Renseignez la fiche entreprise, l'architecture et les incidents." },
  { n: "03", title: "Évaluez les contrôles",      desc: "Analysez chaque contrôle ISO 27002 et joignez les preuves." },
  { n: "04", title: "Générez le rapport",         desc: "Obtenez un rapport complet prêt à être remis au client." },
];

// ── Mockup dashboard (fond clair, style Vanta) ────────────────────────────────
function DashboardMockup() {
  return (
    <div style={{
      width: "100%",
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(30,58,138,0.18), 0 4px 16px rgba(30,58,138,0.08)",
      transform: "perspective(1400px) rotateY(-6deg) rotateX(2deg)",
      transformOrigin: "center center",
    }}>
      {/* Barre titre navigateur */}
      <div style={{ background:"#f8fafc", padding:"10px 16px", display:"flex", alignItems:"center", gap:6, borderBottom:"1px solid #e2e8f0" }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#febc2e" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#28c840" }} />
        <div style={{ flex:1, height:6, background:"#e2e8f0", borderRadius:3, marginLeft:12, maxWidth:200 }} />
      </div>

      {/* Header app */}
      <div style={{ background:"#1e3a8a", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:13 }}>Learn ⇒ Audit</span>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ width:24, height:24, borderRadius:"50%", background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#fff", fontSize:9, fontWeight:700 }}>JD</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:12, background:"#f8fafc" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[["8","Missions","#1e40af"],["5","En cours","#2563eb"],["3","Terminées","#16a34a"],["74%","Score","#0ea5e9"]].map(([v,l,c]) => (
            <div key={l} style={{ background:"#fff", borderRadius:8, padding:"10px 12px", border:"1px solid #e2e8f0", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:18, fontWeight:800, color:c }}>{v}</div>
              <div style={{ fontSize:9, color:"#94a3b8", marginTop:2, fontWeight:500 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tableau missions */}
        <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", border:"1px solid #e2e8f0" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", padding:"7px 12px", background:"#f1f5f9", borderBottom:"1px solid #e2e8f0" }}>
            {["MISSION","CLIENT","PROGRESSION"].map(h => (
              <div key={h} style={{ fontSize:8, color:"#94a3b8", fontWeight:700, letterSpacing:"0.07em" }}>{h}</div>
            ))}
          </div>
          {[
            ["Audit ISO 27001 — TechCorp","TechCorp SA","78%","#16a34a"],
            ["Audit ISO 27002 — DataSafe","DataSafe Maroc","45%","#ea580c"],
            ["Audit sécurité — FinGroup","FinGroup","92%","#16a34a"],
          ].map(([titre, client, pct, color]) => (
            <div key={titre} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", padding:"9px 12px", borderBottom:"1px solid #f1f5f9", alignItems:"center" }}>
              <div style={{ fontSize:10, color:"#1e3a8a", fontWeight:600 }}>{titre}</div>
              <div style={{ fontSize:9, color:"#64748b" }}>{client}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ flex:1, height:4, background:"#e2e8f0", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:pct, background:color, borderRadius:2 }} />
                </div>
                <span style={{ fontSize:8, color:"#94a3b8", flexShrink:0 }}>{pct}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mini cards flottantes */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[["ISO 27001","68%","#1e40af"],["ISO 27002","81%","#0ea5e9"]].map(([label, pct, color]) => (
            <div key={label} style={{ background:"#fff", borderRadius:8, padding:"10px 12px", border:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:9, color:"#94a3b8", marginBottom:6 }}>{label}</div>
              <div style={{ fontSize:16, fontWeight:800, color }}>{pct}</div>
              <div style={{ height:4, background:"#e2e8f0", borderRadius:2, marginTop:6, overflow:"hidden" }}>
                <div style={{ height:"100%", width:pct, background:color, borderRadius:2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToFeatures() {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", color:"#111827" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100, height:64,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 2.5rem",
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.0)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "none",
        transition: "background .3s, border .3s",
      }}>
        <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:"1.2rem", fontWeight:700, color:"#1e3a8a" }}>
          Learn ⇒ Audit
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <span style={{ fontSize:14, color:"#64748b", cursor:"pointer" }}>À propos</span>
          <button onClick={() => navigate("/login")}
            style={{ padding:"8px 22px", background:"#1e3a8a", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 8px rgba(30,58,138,0.25)" }}>
            Connexion
          </button>
        </div>
      </nav>

      {/* ── Hero — layout 2 colonnes style Vanta ── */}
      <section style={{
        minHeight:"100vh",
        background:"linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 40%, #dbeafe 100%)",
        display:"flex", alignItems:"center",
        padding:"80px 2.5rem 60px",
        overflow:"hidden",
        position:"relative",
      }}>
        {/* Cercles décoratifs en arrière-plan */}
        <div style={{ position:"absolute", top:-120, right:-120, width:500, height:500, borderRadius:"50%", background:"rgba(59,130,246,0.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:350, height:350, borderRadius:"50%", background:"rgba(30,58,138,0.06)", pointerEvents:"none" }} />

        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }}>

          {/* Colonne gauche — texte */}
          <div>
            {/* Badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(30,58,138,0.08)", border:"1px solid rgba(30,58,138,0.15)", borderRadius:20, padding:"6px 14px", marginBottom:24 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#3b82f6" }} />
              <span style={{ fontSize:12, color:"#1e40af", fontWeight:600, letterSpacing:"0.04em" }}>
                Plateforme d&apos;audit ISO 27001 / 27002
              </span>
            </div>

            {/* Titre */}
            <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:800, color:"#0f172a", lineHeight:1.15, margin:"0 0 8px" }}>
              Gérez vos missions
            </h1>
            <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:800, color:"#0f172a", lineHeight:1.15, margin:"0 0 8px" }}>
              d&apos;audit avec
            </h1>
            <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:800, color:"#1e40af", lineHeight:1.15, margin:"0 0 24px" }}>
              précision et professionnalisme
            </h1>

            {/* Sous-titre */}
            <p style={{ fontSize:16, color:"#475569", lineHeight:1.75, maxWidth:480, margin:"0 0 36px" }}>
              Une plateforme complète pour structurer vos audits ISO 27002, évaluer les contrôles, collecter les preuves et générer vos rapports.
            </p>

            {/* Boutons */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button onClick={() => navigate("/login")}
                style={{ padding:"13px 28px", background:"#1e3a8a", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(30,58,138,0.3)" }}>
                Accéder à mon espace →
              </button>
              <button onClick={scrollToFeatures}
                style={{ padding:"13px 28px", background:"#fff", color:"#1e3a8a", border:"1.5px solid #bfdbfe", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer" }}>
                Découvrir la plateforme
              </button>
            </div>

            {/* Indicateurs de confiance */}
            <div style={{ display:"flex", gap:24, marginTop:40, flexWrap:"wrap" }}>
              {[["93","Contrôles ISO"],["4","Thèmes"],["100%","Sécurisé"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize:22, fontWeight:800, color:"#1e40af" }}>{v}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite — mockup */}
          <div style={{ position:"relative" }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section ref={featuresRef} style={{ background:"#f8fafc", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color:"#0f172a", marginBottom:"0.5rem" }}>
            Tout ce dont un auditeur a besoin
          </h2>
          <p style={{ textAlign:"center", color:"#64748b", fontSize:15, marginBottom:"3rem" }}>
            De la collecte d&apos;informations à la remise du rapport, tout est intégré.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1.25rem" }}>
            {FEATURES.map(({ icon, color, title, desc }) => (
              <div key={title} style={{ background:"#fff", borderRadius:12, padding:"1.5rem", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", border:"1px solid #e2e8f0", transition:"box-shadow .2s" }}>
                <div style={{ width:44, height:44, borderRadius:10, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center", color, marginBottom:14 }}>
                  {icon}
                </div>
                <div style={{ fontWeight:700, fontSize:15, color:"#0f172a", marginBottom:6 }}>{title}</div>
                <div style={{ fontSize:13, color:"#64748b", lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section style={{ background:"#fff", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color:"#0f172a", marginBottom:"3rem" }}>
            Comment ça marche
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2rem" }}>
            {STEPS.map(({ n, title, desc }, i) => (
              <div key={n} style={{ textAlign:"center", position:"relative" }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position:"absolute", top:22, left:"calc(50% + 28px)", right:"-50%", height:2, background:"#dbeafe", zIndex:0 }} />
                )}
                <div style={{ width:44, height:44, borderRadius:"50%", background:"#1e3a8a", color:"#fff", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", position:"relative", zIndex:1 }}>
                  {n}
                </div>
                <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:6 }}>{title}</div>
                <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ background:"linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)", padding:"5rem 2.5rem", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color:"#fff", marginBottom:"1rem" }}>
          Prêt à commencer votre audit ?
        </h2>
        <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15, marginBottom:"2rem" }}>
          Rejoignez les auditeurs qui font confiance à Learn ⇒ Audit.
        </p>
        <button onClick={() => navigate("/login")}
          style={{ padding:"14px 32px", background:"#fff", color:"#1e3a8a", border:"none", borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>
          Se connecter maintenant →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background:"#0f172a", padding:"2rem 2.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:"1rem", fontWeight:700, color:"#fff" }}>Learn ⇒ Audit</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:4 }}>Plateforme d&apos;audit ISO 27002</div>
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>
          © 2026 Learn Audit. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
