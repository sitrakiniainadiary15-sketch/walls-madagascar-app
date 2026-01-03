"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error("Erreur chargement produits");
        }

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="space-y-16">

      {/* HERO */}
      <section className="bg-black text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Bienvenue sur notre boutique
        </h1>
        <p className="opacity-80 mb-6">
          Découvrez nos produits de qualité
        </p>
        <Link
          href="/boutique"
          className="bg-white text-black px-6 py-3 rounded"
        >
          Voir la boutique
        </Link>
      </section>

      {/* PRODUITS */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">
          Produits récents
        </h2>

        {loading && <p>Chargement...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && products.length === 0 && (
          <p>Aucun produit disponible</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product) => (
            <div
              key={product._id}
              className="border rounded p-4"
            >
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="object-cover mb-3"
                />
              )}

              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600">
                {product.price} €
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
