"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import "./verify-email.css";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch (error) {
        setStatus("error");
        setMessage("Erreur lors de la vérification");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        {status === "loading" && (
          <>
            <div className="spinner"></div>
            <h1>Vérification en cours...</h1>
            <p>Veuillez patienter</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="icon success">✅</div>
            <h1>Email vérifié !</h1>
            <p>{message}</p>
            <p>Redirection automatique vers la connexion...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="icon error">❌</div>
            <h1>Erreur</h1>
            <p>{message}</p>
            <Link href="/register" className="verify-btn">
              Retour à l'inscription
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
