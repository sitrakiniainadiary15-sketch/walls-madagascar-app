"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Catégories</h1>

      <a
        href="/admin/categories/add"
        className="bg-black text-white px-4 py-2 rounded"
      >
        + Ajouter une catégorie
      </a>

      <ul className="mt-6 space-y-2">
        {categories.map((cat) => (
          <li
            key={cat._id}
            className="border p-3 rounded"
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
