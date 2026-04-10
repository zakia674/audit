import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim())    { setError("L'email est requis."); return; }
    if (!form.password.trim()) { setError("Le mot de passe est requis."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Identifiants incorrects."); setLoading(false); return; }
      login(data);
      navigate("/dashboard");
    } catch {
      setError("Impossible de contacter le serveur.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f8fafc",
      padding: "1rem",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "2.5rem",
        width: "100%", maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--primary,#1e3a5f)" }}>
            Learn ⇒ Audit
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
            Connectez-vous à votre espace
          </div>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="justification-field">
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Adresse email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="jean@audit.com"
              autoFocus
            />
          </div>

          <div className="justification-field">
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 12 }}>
                {showPwd ? "Masquer" : "Voir"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ padding: "11px", fontSize: 14, fontWeight: 700, marginTop: 4 }}>
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <span onClick={() => navigate("/")}
            style={{ fontSize: 13, color: "#9ca3af", cursor: "pointer", textDecoration: "underline" }}>
            ← Retour à l&apos;accueil
          </span>
        </div>
      </div>
    </div>
  );
}
