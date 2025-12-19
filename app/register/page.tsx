"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    setMessage(data.message);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nom"
          value={name}
          onChange={e => setName(e.target.value)}
        /><br /><br />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
        /><br /><br />

        <button type="submit">Créer compte</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
