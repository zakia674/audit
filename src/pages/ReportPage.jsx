import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAudit } from "../context/AuditContext";
import { useAuth } from "../context/AuthContext";

const THEME_COLORS = { Organisationnel:"#1B3A5C", Humain:"#2D6A4F", Physique:"#6B4226", Technologique:"#4A1942" };
const RISK_COLORS  = { faible:"#1A5C35", moyen:"#7A4F00", eleve:"#B84000", critique:"#8B1A1A" };
const RISK_BG      = { faible:"#E8F5EE", moyen:"#FFF3E0", eleve:"#FFF0E8", critique:"#FDECEA" };
const STATUT_LABEL = { conforme:"Conforme", non_conforme:"Non conforme", partiel:"Partiel", non_evalue:"Non évalué" };

export default function ReportPage() {
  const navigate = useNavigate();
  const { missionId, mission, fiche, resetSession } = useAudit();
  const { user } = useAuth();

  const [rapport,  setRapport]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [fichePdfPath, setFichePdfPath] = useState(null);

  const today = new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });

  useEffect(() => {
    if (!missionId) return;
    setLoading(true);
    fetch(`/api/missions/${missionId}/rapport`)
      .then(r => { if (!r.ok) throw new Error("Erreur API"); return r.json(); })
      .then(d => { setRapport(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
    fetch(`/api/missions/${missionId}/fiche-pdf`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.fichier_path) setFichePdfPath(d.fichier_path); })
      .catch(() => {});
  }, [missionId]);

  function verdictText(s) {
    if (s >= 80) return "Niveau de conformité satisfaisant — certification envisageable";
    if (s >= 50) return "Niveau partiel — plan d'action ciblé recommandé";
    return "Niveau insuffisant — plan d'action urgent sur 3 mois indispensable";
  }
  function verdictColor(s) {
    if (s >= 80) return "#1A5C35";
    if (s >= 50) return "#7A4F00";
    return "#8B1A1A";
  }

  if (loading) return (
    <div className="doc-report">
      <div className="doc-toolbar no-print">
        <button className="btn-secondary" onClick={() => navigate("/audit/controls")}>← Retour</button>
      </div>
      <div style={{ padding:"3rem", textAlign:"center", color:"var(--muted)" }}>Calcul du rapport en cours...</div>
    </div>
  );

  if (error || !rapport) return (
    <div className="doc-report">
      <div className="doc-toolbar no-print">
        <button className="btn-secondary" onClick={() => navigate("/audit/controls")}>← Retour</button>
      </div>
      <div style={{ padding:"2rem", color:"var(--danger)" }}>
        Impossible de générer le rapport. Vérifiez que le backend est démarré.
      </div>
    </div>
  );

  const { score_global, nb_conformes, nb_non_conformes, nb_partiels, recommandation_finale, evaluations, total } = rapport;
  const score   = Math.round(score_global);
  const pending = (rapport.mission ? 0 : 0); // calculé depuis evaluations

  // Grouper par thème pour les barres
  const themes = ["Organisationnel","Humain","Physique","Technologique"];
  const themeStats = themes.map(t => {
    const tEvals = evaluations.filter(e => e.theme === t);
    const tConf  = tEvals.filter(e => e.statut === "conforme").length;
    const pct    = tEvals.length ? Math.round((tConf / tEvals.length) * 100) : 0;
    return { theme: t, total: tEvals.length, conformes: tConf, pct };
  });

  // Points forts et non-conformes
  const conformesList    = evaluations.filter(e => e.statut === "conforme");
  const nonConformesList = evaluations.filter(e => e.statut === "non_conforme" || e.statut === "partiel");

  // Plan d'action
  const actionPlan = nonConformesList.map(e => {
    const priority = e.risque === "critique" ? "urgente" : e.risque === "eleve" ? "importante" : "normale";
    const delay    = e.risque === "critique" ? "< 1 mois" : e.risque === "eleve" ? "1–3 mois" : "3–6 mois";
    return { e, priority, delay };
  }).sort((a, b) => {
    const order = { urgente:0, importante:1, normale:2 };
    return order[a.priority] - order[b.priority];
  });

  const m    = rapport.mission || mission;
  const f    = fiche;

  return (
    <div className="doc-report">
      <div className="doc-toolbar no-print">
        <button className="btn-secondary" onClick={() => navigate("/audit/controls")}>← Retour</button>
        <button className="btn-primary" onClick={() => window.print()}>Exporter PDF</button>
      </div>

      {/* En-tête */}
      <div className="doc-header">
        <div className="doc-header-left">
          <div className="doc-brand">Learn ⇒ Audit</div>
          <h1 className="doc-report-title">Rapport d'Audit de Conformité</h1>
          <div className="doc-report-sub">ISO/IEC 27001 · ISO/IEC 27002:2022</div>
        </div>
        <div className="doc-header-right">
          <div className="doc-score-badge" style={{ borderColor: verdictColor(score), color: verdictColor(score) }}>
            <span className="doc-score-num">{score}%</span>
            <span className="doc-score-label">Score global</span>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="doc-meta-section">
        <table className="doc-meta-table">
          <tbody>
            <tr><td className="doc-meta-key">Entreprise auditée</td><td className="doc-meta-val">{fiche.nom || m.client || "—"}</td></tr>
            {fiche.secteur  && <tr><td className="doc-meta-key">Secteur</td><td className="doc-meta-val">{fiche.secteur}</td></tr>}
            {fiche.siege    && <tr><td className="doc-meta-key">Siège</td><td className="doc-meta-val">{fiche.siege}</td></tr>}
            {fiche.effectif && <tr><td className="doc-meta-key">Effectif</td><td className="doc-meta-val">{fiche.effectif} employés</td></tr>}
            {fiche.ca       && <tr><td className="doc-meta-key">CA estimé</td><td className="doc-meta-val">{fiche.ca}</td></tr>}
            <tr><td className="doc-meta-key">Auditeur</td><td className="doc-meta-val">{user?.nom || m.auditeur || "—"}</td></tr>
            <tr><td className="doc-meta-key">Date de génération</td><td className="doc-meta-val">{today}</td></tr>
            <tr><td className="doc-meta-key">Référence dossier</td><td className="doc-meta-val">DA-{String(missionId).padStart(4,"0")}</td></tr>
            <tr><td className="doc-meta-key">Référentiel</td><td className="doc-meta-val">ISO/IEC 27002:2022</td></tr>
          </tbody>
        </table>
      </div>

      {/* Synthèse */}
      <div className="doc-section">
        <div className="doc-section-title">Synthèse exécutive</div>
        <div className="exec-score-row">
          <div className="exec-score-circle" style={{ borderColor: verdictColor(score) }}>
            <span className="exec-score-num" style={{ color: verdictColor(score) }}>{score}%</span>
            <span className="exec-score-lbl">Conformité</span>
          </div>
          <div className="exec-verdict-block">
            <div className="exec-verdict" style={{ color: verdictColor(score) }}>{verdictText(score)}</div>
            <div className="exec-counts">
              <span className="exec-count ok">{nb_conformes} conforme{nb_conformes>1?"s":""}</span>
              <span className="exec-count nc">{nb_non_conformes} non conforme{nb_non_conformes>1?"s":""}</span>
              {nb_partiels > 0 && <span className="exec-count muted">{nb_partiels} partiel{nb_partiels>1?"s":""}</span>}
            </div>
          </div>
        </div>
        <div className="exec-highlights">
          <div className="exec-highlight-col">
            <div className="exec-highlight-title ok">✓ Points forts identifiés</div>
            {conformesList.length > 0
              ? conformesList.slice(0,3).map((e,i) => (
                  <div key={i} className="exec-highlight-item ok">{e.code_iso} — {e.controle_titre}</div>
                ))
              : <div className="exec-highlight-item muted">Aucun contrôle conforme</div>}
          </div>
          <div className="exec-highlight-col">
            <div className="exec-highlight-title nc">⚠ Non-conformités prioritaires</div>
            {nonConformesList.length > 0
              ? nonConformesList.slice(0,3).map((e,i) => (
                  <div key={i} className="exec-highlight-item nc">{e.code_iso} — {e.controle_titre}</div>
                ))
              : <div className="exec-highlight-item muted">Aucune non-conformité</div>}
          </div>
        </div>
        <div className="exec-reco-box">
          <span className="exec-reco-label">Recommandation finale</span>
          <p>{recommandation_finale}</p>
        </div>
      </div>

      {/* Conformité par domaine */}
      <div className="doc-section">
        <div className="doc-section-title">Conformité par domaine ISO</div>
        <div className="domain-bars">
          {themeStats.filter(t => t.total > 0).map(t => (
            <div key={t.theme} className="domain-bar-row">
              <div className="domain-bar-label" style={{ color: THEME_COLORS[t.theme] }}>{t.theme}</div>
              <div className="domain-bar-track">
                <div className="domain-bar-fill" style={{ width:`${t.pct}%`, background: THEME_COLORS[t.theme] }}/>
              </div>
              <div className="domain-bar-pct">{t.pct}%</div>
              <div className="domain-bar-detail">{t.conformes}/{t.total}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Détail par contrôle */}
      <div className="doc-section">
        <div className="doc-section-title">Détail des résultats par contrôle</div>
        <table className="doc-table">
          <thead>
            <tr><th>N°</th><th>Contrôle</th><th>Thème</th><th>Maturité</th><th>Statut</th><th>Risque</th></tr>
          </thead>
          <tbody>
            {evaluations.map(e => {
              const isNC = e.statut === "non_conforme" || e.statut === "partiel";
              return (
                <tr key={e.id}>
                  <td className="doc-td-id">{e.code_iso}</td>
                  <td>
                    <div>{e.controle_titre}</div>
                    {e.justification && <div style={{ fontSize:"0.75rem", color:"var(--muted)", marginTop:"0.2rem" }}>{e.justification}</div>}
                  </td>
                  <td>
                    <span className="doc-theme-pill" style={{ background: THEME_COLORS[e.theme]+"18", color: THEME_COLORS[e.theme], borderColor: THEME_COLORS[e.theme]+"40" }}>
                      {e.theme}
                    </span>
                  </td>
                  <td>
                    {e.maturite !== null
                      ? <span className="doc-maturity-badge" style={{ color: isNC?"var(--danger)":"var(--success)" }}>Niv. {e.maturite}</span>
                      : "—"}
                  </td>
                  <td>
                    <span className={`doc-status-pill ${isNC?"nc":e.statut==="conforme"?"ok":"pending"}`}>
                      {STATUT_LABEL[e.statut] || e.statut}
                    </span>
                  </td>
                  <td>
                    {e.risque
                      ? <span className="doc-risk-pill" style={{ color: RISK_COLORS[e.risque], background: RISK_BG[e.risque] }}>{e.risque}</span>
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Plan d'action */}
      {actionPlan.length > 0 && (
        <div className="doc-section">
          <div className="doc-section-title">Plan d'action priorisé</div>
          <table className="doc-table">
            <thead>
              <tr><th>Priorité</th><th>Contrôle</th><th>Recommandation</th><th>Délai</th></tr>
            </thead>
            <tbody>
              {actionPlan.map(({ e, priority, delay }) => (
                <tr key={e.id}>
                  <td>
                    <span className="doc-priority-pill" style={{
                      color: priority==="urgente"?"#8B1A1A":priority==="importante"?"#C45000":"#1B3A5C",
                      background: priority==="urgente"?"#FDECEA":priority==="importante"?"#FFF0E8":"#EEF2F7",
                    }}>{priority}</span>
                  </td>
                  <td>
                    <div className="doc-td-id">{e.code_iso}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--muted)" }}>{e.controle_titre}</div>
                  </td>
                  <td style={{ fontSize:"0.83rem" }}>{e.recommandation || "—"}</td>
                  <td><span className="doc-delay-tag">{delay}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="doc-footer">
        <span>Learn ⇒ Audit — Audit ISO 27001/27002:2022</span>
        <span>Document généré le {today}</span>
      </div>
    </div>
  );
}
