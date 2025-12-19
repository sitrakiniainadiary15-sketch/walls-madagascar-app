"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [msg, setMsg] = useState("");

  // charger catégories
  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // ajouter catégorie
  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const data = await res.json();
    setMsg(data.message);
    setName("");
    loadCategories();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Catégories</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nom de la catégorie"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button>Ajouter</button>
      </form>

      <p>{msg}</p>

      <ul>
        {categories.map(cat => (
          <li key={cat._id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}
