import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAudit } from "../context/AuditContext";
import { useAuth } from "../context/AuthContext";
import IsoNetwork from "./IsoNetwork";
import PdfViewer from "../components/PdfViewer";

export const STEPS = [
  { id: "mission",    num: "01", label: "Lettre de mission",      icon: "📄" },
  { id: "entreprise", num: "02", label: "Fiche entreprise",       icon: "🏢" },
  { id: "reseau",     num: "03", label: "Architecture technique", icon: "🖧" },
  { id: "incidents",  num: "04", label: "Incidents de sécurité",  icon: "⚠" },
];

export default function ScenarioPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress, resetSession, incidents, mission, fiche, missionId, saveFiche } = useAudit();
  const { user } = useAuth();

  const [lettrePath, setLettrePath] = useState(null);
  const [archiPath,  setArchiPath]  = useState(null);
  const [fichePath,  setFichePath]  = useState(null);
  const [ficheForm,  setFicheForm]  = useState({ nom:"", secteur:"", effectif:"", ca:"", siege:"", activite:"" });
  const [ficheSaved, setFicheSaved] = useState(false);
  const [incForm,    setIncForm]    = useState({ titre:"", date_incident:"", gravite:"moyen", description:"" });
  const [incError,   setIncError]   = useState("");
  const [localIncidents, setLocalIncidents] = useState(null); // null = utiliser le contexte

  // Sync localIncidents depuis le contexte au premier chargement
  useEffect(() => {
    if (incidents.length > 0 && localIncidents === null) {
      setLocalIncidents(incidents);
    }
  }, [incidents]);

  // Sync ficheForm depuis le contexte
  useEffect(() => {
    if (fiche && (fiche.nom || fiche.secteur)) {
      setFicheForm({
        nom:      fiche.nom      || "",
        secteur:  fiche.secteur  || "",
        effectif: fiche.effectif || "",
        ca:       fiche.ca       || "",
        siege:    fiche.siege    || "",
        activite: fiche.activite || "",
      });
    }
  }, [fiche]);
  useEffect(() => {
    // Réinitialiser les fichiers à chaque changement de mission
    setLettrePath(null);
    setArchiPath(null);
    setFichePath(null);
    setLocalIncidents(null);
    if (!missionId) return;
    fetch(`/api/missions/${missionId}/lettre`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.fichier_path) setLettrePath(d.fichier_path); })
      .catch(() => {});
    fetch(`/api/missions/${missionId}/architecture`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.fichier_path) setArchiPath(d.fichier_path); })
      .catch(() => {});
    fetch(`/api/missions/${missionId}/fiche-pdf`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.fichier_path) setFichePath(d.fichier_path); })
      .catch(() => {});
  }, [missionId]);

  async function handleUploadLettre(e) {
    const file = e.target.files[0];
    if (!file || !missionId) return;
    const form = new FormData();
    form.append("fichier", file);
    const res = await fetch(`/api/missions/${missionId}/lettre`, { method: "POST", body: form });
    if (res.ok) { const d = await res.json(); setLettrePath(d.fichier_path); }
    e.target.value = "";
  }

  async function handleUploadFiche(e) {
    const file = e.target.files[0];
    if (!file || !missionId) return;
    const form = new FormData();
    form.append("fichier", file);
    const res = await fetch(`/api/missions/${missionId}/fiche-pdf`, { method: "POST", body: form });
    if (res.ok) { const d = await res.json(); setFichePath(d.fichier_path); }
    e.target.value = "";
  }

  async function handleUploadArchi(e) {
    const file = e.target.files[0];
    if (!file || !missionId) return;
    const form = new FormData();
    form.append("fichier", file);
    const res = await fetch(`/api/missions/${missionId}/architecture`, { method: "POST", body: form });
    if (res.ok) { const d = await res.json(); setArchiPath(d.fichier_path); }
    e.target.value = "";
  }

  async function handleAddIncident() {
    if (!incForm.titre.trim()) { setIncError("Le titre est requis."); return; }
    if (!missionId) return;
    setIncError("");
    const res = await fetch(`/api/missions/${missionId}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incForm),
    });
    if (res.ok) {
      const inc = await res.json();
      // Mettre à jour les incidents dans le contexte via rechargement
      setLocalIncidents(prev => [inc, ...prev]);
      setIncForm({ titre:"", date_incident:"", gravite:"moyen", description:"" });
    }
  }

  async function handleDeleteIncident(id) {
    await fetch(`/api/incidents/${id}`, { method: "DELETE" });
    setLocalIncidents(prev => prev.filter(i => i.id !== id));
  }

  // Mapper incidents API → format affichage
  const graviteLabel = { critique:"critique", eleve:"élevé", moyen:"moyen", faible:"faible" };
  const sourceIncidents = localIncidents !== null ? localIncidents : incidents;
  const incidentsDisplay = sourceIncidents.map(inc => ({
    id:       inc.id,
    date:     inc.date_incident ? new Date(inc.date_incident).toLocaleDateString("fr-FR",{month:"long",year:"numeric"}) : "—",
    severity: graviteLabel[inc.gravite] || inc.gravite || "moyen",
    title:    inc.titre,
    desc:     inc.description || "",
  }));

  // Parser interlocuteurs
  const interlocuteursList = (fiche.interlocuteurs || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const clientsList = (fiche.clients_principaux || "")
    .split(",").map(s => s.trim()).filter(Boolean);

  const stepId = searchParams.get("step") || "mission";

  function goNext(nextId) {
    setSearchParams({ step: nextId });
  }

  return (
    <div className="scenario-content">

      {/* ── Lettre de mission ── */}
      {stepId === "mission" && (
        <div className="ob-panel">
          <div className="ob-panel-label">01 — Lettre de mission</div>

          {/* Zone upload */}
          <div className="no-print" style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem", padding:"0.75rem 1rem", background:"var(--accent-bg)", border:"1px solid var(--border)", borderRadius:4 }}>
            {lettrePath ? (
              <>
                <span style={{ fontSize:"0.85rem", color:"var(--success)" }}>✓ Lettre de mission reçue du client</span>
                <a href={lettrePath} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding:"0.35rem 0.9rem", fontSize:"0.82rem" }}>
                  Ouvrir le PDF
                </a>
                <label style={{ cursor:"pointer" }}>
                  <span className="btn-secondary" style={{ padding:"0.35rem 0.9rem", fontSize:"0.82rem" }}>Remplacer</span>
                  <input type="file" accept=".pdf" style={{ display:"none" }} onChange={handleUploadLettre} />
                </label>
              </>
            ) : (
              <>
                <span style={{ fontSize:"0.85rem", color:"var(--muted)" }}>Lettre de mission reçue du client</span>
                <label style={{ cursor:"pointer" }}>
                  <span className="btn-primary" style={{ padding:"0.45rem 1.1rem", fontSize:"0.85rem" }}>Uploader le PDF</span>
                  <input type="file" accept=".pdf" style={{ display:"none" }} onChange={handleUploadLettre} />
                </label>
              </>
            )}
          </div>

          {/* Si PDF uploadé → l'afficher page par page, sinon zone drag & drop */}
          {lettrePath ? (
            <PdfViewer url={lettrePath} />
          ) : (
            <label style={{ cursor:"pointer", display:"block" }}>
              <input type="file" accept=".pdf" style={{ display:"none" }} onChange={handleUploadLettre} />
              <div
                style={{
                  padding:"3rem 2rem", textAlign:"center",
                  border:"2px dashed var(--border)", borderRadius:8,
                  background:"var(--accent-bg, #f8fafc)",
                  transition:"background .2s, border-color .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#93c5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background="var(--accent-bg, #f8fafc)"; e.currentTarget.style.borderColor="var(--border)"; }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#3b82f6"; }}
                onDragLeave={e => { e.currentTarget.style.background="var(--accent-bg, #f8fafc)"; e.currentTarget.style.borderColor="var(--border)"; }}
                onDrop={async e => {
                  e.preventDefault();
                  e.currentTarget.style.background="var(--accent-bg, #f8fafc)";
                  e.currentTarget.style.borderColor="var(--border)";
                  const file = e.dataTransfer.files[0];
                  if (!file || !missionId) return;
                  const form = new FormData();
                  form.append("fichier", file);
                  const res = await fetch(`/api/missions/${missionId}/lettre`, { method:"POST", body:form });
                  if (res.ok) { const d = await res.json(); setLettrePath(d.fichier_path); }
                }}
              >
                {/* Icône nuage upload */}
                <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #1e3a8a)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>
                <p style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--primary, #1e3a8a)", margin:"0 0 4px" }}>
                  Glissez votre PDF ici
                </p>
                <p style={{ fontSize:"0.85rem", color:"var(--muted)", margin:"0 0 10px" }}>
                  ou cliquez pour parcourir vos fichiers
                </p>
                <p style={{ fontSize:"0.75rem", color:"#9ca3af", margin:0 }}>
                  Formats acceptés : PDF — Taille maximale : 10 Mo
                </p>
              </div>
            </label>
          )}


        </div>
      )}

      {/* ── Fiche entreprise ── */}
      {stepId === "entreprise" && (
        <div className="ob-panel">
          <div className="ob-panel-label">02 — Fiche entreprise</div>

          {/* Upload + aperçu PDF en haut */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.65rem 1rem", background:"var(--accent-bg)", border:"1px solid var(--border)", borderRadius:4 }}>
            {fichePath ? (
              <>
                <a href={fichePath} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding:"0.35rem 0.9rem", fontSize:"0.82rem" }}>
                  Ouvrir le fichier
                </a>
                <label style={{ cursor:"pointer" }}>
                  <span className="btn-secondary" style={{ padding:"0.35rem 0.9rem", fontSize:"0.82rem" }}>Remplacer</span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }} onChange={handleUploadFiche} />
                </label>
              </>
            ) : (
              <>
                <span style={{ fontSize:"0.82rem", color:"var(--muted)", flex:1 }}>Document de référence (PDF/image)</span>
                <label style={{ cursor:"pointer" }}>
                  <span className="btn-primary" style={{ padding:"0.4rem 1rem", fontSize:"0.82rem" }}>Uploader</span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }} onChange={handleUploadFiche} />
                </label>
              </>
            )}
          </div>

          {fichePath ? (
            fichePath.match(/\.(png|jpg|jpeg)$/i) ? (
              <img src={fichePath} alt="Fiche entreprise"
                style={{ width:"100%", border:"1px solid var(--border)", borderRadius:4, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }} />
            ) : (
              <PdfViewer url={fichePath} />
            )
          ) : (
            <label style={{ cursor:"pointer", display:"block" }}>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }} onChange={handleUploadFiche} />
              <div
                style={{ padding:"2.5rem 1.5rem", textAlign:"center", border:"2px dashed var(--border)", borderRadius:8, background:"var(--accent-bg, #f8fafc)", transition:"background .2s, border-color .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#93c5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background="var(--accent-bg, #f8fafc)"; e.currentTarget.style.borderColor="var(--border)"; }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#3b82f6"; }}
                onDragLeave={e => { e.currentTarget.style.background="var(--accent-bg, #f8fafc)"; e.currentTarget.style.borderColor="var(--border)"; }}
                onDrop={async e => {
                  e.preventDefault();
                  e.currentTarget.style.background="var(--accent-bg, #f8fafc)";
                  e.currentTarget.style.borderColor="var(--border)";
                  const file = e.dataTransfer.files[0];
                  if (!file || !missionId) return;
                  const form = new FormData();
                  form.append("fichier", file);
                  const res = await fetch(`/api/missions/${missionId}/fiche-pdf`, { method:"POST", body:form });
                  if (res.ok) { const d = await res.json(); setFichePath(d.fichier_path); }
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #1e3a8a)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:8 }}>
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <p style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--primary, #1e3a8a)", margin:"0 0 4px" }}>Glissez le document ici</p>
                <p style={{ fontSize:"0.78rem", color:"#9ca3af", margin:0 }}>PDF, PNG, JPG — max 10 Mo</p>
              </div>
            </label>
          )}

          {/* Formulaire de saisie en bas */}
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:"1.25rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <div style={{ fontSize:"0.78rem", color:"var(--muted)" }}>
              Renseignez les informations après consultation du document.
              {user?.nom && <span style={{ marginLeft:6, color:"var(--primary)", fontWeight:600 }}>Auditeur : {user.nom}</span>}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
              {[
                { key:"nom",      label:"Nom de l'entreprise *", placeholder:"Ex : DataSafe Maroc SARL" },
                { key:"secteur",  label:"Secteur d'activité",    placeholder:"Ex : Conseil IT & Infogérance" },
                { key:"siege",    label:"Siège social",          placeholder:"Ex : Avenue Hassan II, Rabat" },
                { key:"effectif", label:"Effectif",              placeholder:"Ex : 35" },
                { key:"ca",       label:"CA estimé",             placeholder:"Ex : 8,5 M MAD / an" },
              ].map(f => (
                <div key={f.key} className="justification-field">
                  <label style={{ fontSize:"0.82rem" }}>{f.label}</label>
                  <input
                    className="form-input"
                    value={ficheForm[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => { setFicheForm(p => ({ ...p, [f.key]: e.target.value })); setFicheSaved(false); }}
                  />
                </div>
              ))}
            </div>

            <div className="justification-field">
              <label style={{ fontSize:"0.82rem" }}>Activité principale</label>
              <textarea
                className="form-input" rows={3}
                value={ficheForm.activite}
                placeholder="Décrivez l'activité principale de l'entreprise..."
                onChange={e => { setFicheForm(p => ({ ...p, activite: e.target.value })); setFicheSaved(false); }}
              />
            </div>

            <button
              className="btn-primary"
              style={{ alignSelf:"flex-start" }}
              onClick={async () => {
                await saveFiche({ ...ficheForm, effectif: ficheForm.effectif ? Number(ficheForm.effectif) : null });
                setFicheSaved(true);
              }}
            >
              {ficheSaved ? "✓ Enregistré" : "Enregistrer la fiche"}
            </button>
          </div>
        </div>
      )}

      {/* ── Architecture technique ── */}
      {stepId === "reseau" && (
        <div className="ob-panel" style={{ width:"90%", maxWidth:"none" }}>
          <div className="ob-panel-label">03 — Architecture technique</div>

          {/* Zone upload */}
          <div className="no-print" style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem", padding:"0.75rem 1rem", background:"var(--accent-bg)", border:"1px solid var(--border)", borderRadius:4 }}>
            {archiPath ? (
              <>
                <span style={{ fontSize:"0.85rem", color:"var(--success)" }}>✓ Schéma uploadé</span>
                <label style={{ cursor:"pointer" }}>
                  <span className="btn-secondary" style={{ padding:"0.35rem 0.9rem", fontSize:"0.82rem" }}>Remplacer</span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.svg,.webp" style={{ display:"none" }} onChange={handleUploadArchi} />
                </label>
              </>
            ) : (
              <>
                <span style={{ fontSize:"0.85rem", color:"var(--muted)" }}>Uploadez le schéma d'architecture du client (image ou PDF)</span>
                <label style={{ cursor:"pointer" }}>
                  <span className="btn-primary" style={{ padding:"0.45rem 1.1rem", fontSize:"0.85rem" }}>📎 Uploader le schéma</span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.svg,.webp" style={{ display:"none" }} onChange={handleUploadArchi} />
                </label>
              </>
            )}
          </div>

          {/* Affichage du fichier uploadé ou zone drag & drop */}
          {archiPath ? (
            archiPath.match(/\.(png|jpg|jpeg|svg|webp)$/i) ? (
              <div style={{ width:"100%", overflowX:"auto", borderRadius:6, border:"1px solid var(--border)", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" }}>
                <img src={archiPath} alt="Architecture technique"
                  style={{ display:"block", width:"100%", minWidth:600, height:"auto" }} />
              </div>
            ) : (
              <PdfViewer url={archiPath} />
            )
          ) : (
            <label style={{ cursor:"pointer", display:"block" }}>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.svg,.webp" style={{ display:"none" }} onChange={handleUploadArchi} />
              <div
                style={{
                  padding:"3rem 2rem", textAlign:"center",
                  border:"2px dashed var(--border)", borderRadius:8,
                  background:"var(--accent-bg, #f8fafc)",
                  transition:"background .2s, border-color .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#93c5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background="var(--accent-bg, #f8fafc)"; e.currentTarget.style.borderColor="var(--border)"; }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#3b82f6"; }}
                onDragLeave={e => { e.currentTarget.style.background="var(--accent-bg, #f8fafc)"; e.currentTarget.style.borderColor="var(--border)"; }}
                onDrop={async e => {
                  e.preventDefault();
                  e.currentTarget.style.background="var(--accent-bg, #f8fafc)";
                  e.currentTarget.style.borderColor="var(--border)";
                  const file = e.dataTransfer.files[0];
                  if (!file || !missionId) return;
                  const form = new FormData();
                  form.append("fichier", file);
                  const res = await fetch(`/api/missions/${missionId}/architecture`, { method:"POST", body:form });
                  if (res.ok) { const d = await res.json(); setArchiPath(d.fichier_path); }
                }}
              >
                <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #1e3a8a)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>
                <p style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--primary, #1e3a8a)", margin:"0 0 4px" }}>
                  Glissez votre schéma ici
                </p>
                <p style={{ fontSize:"0.85rem", color:"var(--muted)", margin:"0 0 10px" }}>
                  ou cliquez pour parcourir vos fichiers
                </p>
                <p style={{ fontSize:"0.75rem", color:"#9ca3af", margin:0 }}>
                  Formats acceptés : PDF, PNG, JPG, SVG — Taille maximale : 10 Mo
                </p>
              </div>
            </label>
          )}

          <button className="onboard-next-btn" style={{ marginTop:"1rem" }} onClick={() => goNext("incidents")}>
            Voir les incidents de sécurité →
          </button>
        </div>
      )}

      {/* ── Incidents ── */}
      {stepId === "incidents" && (
        <div className="ob-panel">
          <div className="ob-panel-label">04 — Incidents de sécurité</div>

          {/* Formulaire ajout incident */}
          <div className="step-block" style={{ gap:"0.75rem" }}>
            <div className="step-label">Ajouter un incident</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
              <div className="justification-field" style={{ gridColumn:"1/-1" }}>
                <label>Titre *</label>
                <input className="form-input" value={incForm.titre}
                  placeholder="Ex : Attaque phishing — 2 comptes compromis"
                  onChange={e => setIncForm(f => ({ ...f, titre: e.target.value }))} />
              </div>
              <div className="justification-field">
                <label>Date</label>
                <input type="date" className="form-input" value={incForm.date_incident}
                  onChange={e => setIncForm(f => ({ ...f, date_incident: e.target.value }))} />
              </div>
              <div className="justification-field">
                <label>Gravité</label>
                <select className="form-input" value={incForm.gravite}
                  onChange={e => setIncForm(f => ({ ...f, gravite: e.target.value }))}>
                  <option value="critique">Critique</option>
                  <option value="eleve">Élevé</option>
                  <option value="moyen">Moyen</option>
                  <option value="faible">Faible</option>
                </select>
              </div>
              <div className="justification-field" style={{ gridColumn:"1/-1" }}>
                <label>Description</label>
                <textarea className="form-input" rows={2} value={incForm.description}
                  placeholder="Décrivez l'incident en détail..."
                  onChange={e => setIncForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            {incError && <div className="error-msg">{incError}</div>}
            <button className="btn-primary" onClick={handleAddIncident}>Ajouter l'incident</button>
          </div>

          {/* Liste des incidents */}
          <div className="incidents-timeline">
            {incidentsDisplay.length === 0 && (
              <div style={{ padding:"1.5rem", textAlign:"center", color:"var(--muted)", fontSize:"0.9rem" }}>
                Aucun incident enregistré. Saisissez les incidents découverts lors de vos entretiens.
              </div>
            )}
            {incidentsDisplay.map((inc, i) => (
              <div key={inc.id || i} className={`incident-item sev-${inc.severity}`}>
                <div className="incident-date">{inc.date}</div>
                <div className="incident-content">
                  <div className="incident-title">{inc.title}</div>
                  <div className="incident-desc">{inc.desc}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginTop:"0.4rem" }}>
                    <span className={`incident-badge sev-${inc.severity}`}>{inc.severity}</span>
                    {inc.id && (
                      <button
                        onClick={() => handleDeleteIncident(inc.id)}
                        style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:"0.8rem", padding:0 }}
                      >
                        ✕ Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="onboard-start-zone">
            <button className="btn-hero-primary" onClick={() => navigate("/audit/controls")}>Commencer l'audit →</button>
          </div>
        </div>
      )}

    </div>
  );
}
