"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./register.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const router = useRouter();

  function getPasswordStrength(pwd) {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: "Faible", color: "#ef4444", width: "33%" };
    if (pwd.length < 10) return { label: "Moyen", color: "#f59e0b", width: "66%" };
    return { label: "Fort", color: "#10b981", width: "100%" };
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessageType("error");
      return setMessage("Les mots de passe ne correspondent pas");
    }
    if (!acceptTerms) {
      setMessageType("error");
      return setMessage("Vous devez accepter les conditions");
    }
    if (password.length < 6) {
      setMessageType("error");
      return setMessage("Mot de passe trop court (min. 6 caractères)");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessageType("error");
        return setMessage(data.message || "Erreur");
      }
      setMessage("Compte créé ! Redirection...");
      setMessageType("success");
      setTimeout(async () => {
        await signIn("credentials", { email, password, redirect: false });
        router.push("/dashboard");
      }, 1500);
    } catch {
      setMessageType("error");
      setMessage("Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">

      {/* FOND ANIMÉ */}
      <div className="register-bg">
        <span /><span /><span /><span /><span /><span />
      </div>

      <div className="register-wrapper">

        {/* HEADER */}
        <div className="register-header">
          <div className="register-logo">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1>Créer un compte 🎉</h1>
        </div>

        {/* CARD */}
        <div className="register-card">

          {/* CHAMPS */}
          <div className="register-inputs">

            <div className="register-field">
              <label>Nom complet</label>
              <div className="register-input-wrap">
                <span>👤</span>
                <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>

            <div className="register-field">
              <label>Adresse e-mail</label>
              <div className="register-input-wrap">
                <span>@</span>
                <input type="email" placeholder="vous@exemple.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="register-field">
              <label>Mot de passe</label>
              <div className="register-input-wrap">
                <span>🔒</span>
                <input type={showPwd ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}>{showPwd ? "🙈" : "👁"}</button>
              </div>
              {strength && (
                <div className="register-strength">
                  <div className="register-strength-bar">
                    <div style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="register-field">
              <label>Confirmer le mot de passe</label>
              <div className="register-input-wrap">
                <span>🔒</span>
                <input type={showConfirmPwd ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>{showConfirmPwd ? "🙈" : "👁"}</button>
              </div>
            </div>

          </div>

          {/* CGU */}
          <label className="register-terms">
            <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
            <span>J'accepte les <Link href="/cgu">conditions d'utilisation</Link> et la <Link href="/privacy">politique de confidentialité</Link></span>
          </label>

          {/* MESSAGE */}
          {message && <p className={`register-message ${messageType}`}>{message}</p>}

          {/* BOUTON */}
          <button className="register-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          {/* DIVIDER */}
          <div className="register-divider">
            <span /><p>Ou s'inscrire avec</p><span />
          </div>

          {/* SOCIAL */}
          <div className="register-social">
            <button type="button" onClick={() => signIn("google")}>Google</button>
            <button type="button" onClick={() => signIn("facebook")}>Facebook</button>
          </div>

          {/* FOOTER */}
          <div className="register-footer">
            <p>Vous avez déjà un compte ?</p>
            <Link href="/auth/login">Se connecter</Link>
          </div>

        </div>
      </div>
    </div>
  );
}