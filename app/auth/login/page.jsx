"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) return setError("Email ou mot de passe incorrect");
    const session = await getSession();
    router.push(session?.user?.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="login-page">

      {/* FOND ANIMÉ */}
      <div className="login-bg">
        <span /><span /><span /><span /><span /><span />
      </div>

      {/* CARD */}
      <div className="login-card">

        {/* INPUTS — Frame 4592 : gap 10px */}
        <div className="login-inputs">
          <div className="login-field">
            <label>Adresse e-mail</label>
            {/* Frame 4643 : h50px, radius 12px, border #E5E7EB, padding 10px 20px */}
            <div className="login-input-wrap">
              <span>@</span>
              <input
                type="email"
                placeholder="Tom.exemple@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label>Mot de passe</label>
            <div className="login-input-wrap">
              <span>🔒</span>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>
        </div>

        {/* OPTIONS + BOUTON — Frame 4592 : gap 20px */}
        <div className="login-actions">
          {/* Frame 4644 : h30px, space-between */}
          <div className="login-options">
            <label><input type="checkbox" /> Se souvenir de moi</label>
            <Link href="/auth/forgot-password">Mot de passe oublié</Link>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="login-divider">
            <span /><p>Ou continuer avec</p><span />
          </div>
        </div>

        {/* SOCIAL — Frame 4646 : h50px, gap 20px */}
        <div className="login-social">
          <button>Google</button>
          <button>Facebook</button>
        </div>

        {/* FOOTER — Frame 4644 : h30px, space-between */}
        <div className="login-footer">
          <p>Pas encore de compte ?</p>
          <Link href="/auth/register">Créer un compte</Link>
        </div>

      </div>
    </div>
  );
}