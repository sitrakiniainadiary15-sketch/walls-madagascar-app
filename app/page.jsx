"use client";


import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";



export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Erreur chargement produits");

        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="space-y-24">

      {/* ================= HERO ================= */}
      <section className="bg-black text-white py-24 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Achetez malin. Achetez en confiance.
        </h1>

        <p className="opacity-80 max-w-xl mx-auto mb-8">
          Découvrez une sélection de produits soigneusement choisis
          pour répondre à vos besoins.
        </p>

        <Link
          href="/boutique"
          className="inline-block bg-white text-black px-8 py-4 rounded font-medium"
        >
          Découvrir la boutique
        </Link>
      </section>

      {/* ================= AVANTAGES ================= */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            ["Qualité garantie", "Des produits sélectionnés avec soin."],
            ["Paiement sécurisé", "Transactions fiables et protégées."],
            ["Support client", "Une équipe à votre écoute."],
          ].map(([title, text]) => (
            <div key={title}>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRODUITS ================= */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Produits récents</h2>
          <Link href="/boutique" className="text-sm underline">
            Voir tout →
          </Link>
        </div>
        

        {loading && <p>Chargement...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && products.length === 0 && (
          <p>Aucun produit disponible</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 6).map((product) => (
            <div
              key={product._id}
              className="border rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition"
            >
              {/* IMAGE */}
              <div className="relative h-48 w-full bg-gray-100">
                <Image
                  src={product.image || "/no-image.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-medium mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {product.price} €
                </p>

                <Link
                  href={`/products/${product._id}`}
                  className="mt-auto text-sm font-medium underline"
                >
                  Voir le produit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="text-center pb-24">
        <Link
          href="/boutique"
          className="inline-block bg-black text-white px-10 py-4 rounded"
        >
          Accéder à la boutique
        </Link>
      </section>

    </main>
  );
}
