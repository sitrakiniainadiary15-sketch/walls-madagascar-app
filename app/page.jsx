"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./home.css";



export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 


  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Erreur chargement produits");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="home">

      <section className="hero">
        <h1>Achetez malin. Achetez en confiance.</h1>
        <p>
          Découvrez une sélection de produits soigneusement choisis
          pour répondre à vos besoins.
        </p>
        <Link href="/boutique" className="hero-btn">
          Découvrir la boutique
        </Link>
      </section>

      <section className="advantages">
        <div className="advantages-grid">
          <div>
            <h3>Qualité garantie</h3>
            <p>Des produits sélectionnés avec soin.</p>
          </div>
          <div>
            <h3>Paiement sécurisé</h3>
            <p>Transactions fiables et protégées.</p>
          </div>
          <div>
            <h3>Support client</h3>
            <p>Une équipe à votre écoute.</p>
          </div>
        </div>
      </section>

      <section className="products">
        <div className="products-header">
          <h2>Produits récents</h2>
          <Link href="/boutique">Voir tout →</Link>
        </div>

        {loading && <p>Chargement...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && products.length === 0 && (
          <p>Aucun produit disponible</p>
        )}

        <div className="products-grid">
          {products.slice(0, 6).map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img
                  src={product.image || "/no-image.png"}
                  alt={product.name}
                />
              </div>

              <div className="product-content">
                <h3>{product.name}</h3>

                {product.brand && <p>Marque : <strong>{product.brand}</strong></p>}
                {product.size && <p>Taille : <strong>{product.size}</strong></p>}
                {product.condition && <p>État : <strong>{product.condition}</strong></p>}
                {product.description && <p className="desc">{product.description}</p>}

                <div className="price">
                  {product.promoPrice ? (
                    <>
                      <span className="promo">{product.promoPrice} Ar</span>
                      <span className="old">{product.price} Ar</span>
                    </>
                  ) : (
                    <span className="normal">{product.price} Ar</span>
                  )}
                </div>

                <Link
                  href={`/products/${product._id}`}
                  className="product-btn"
                >
                  Voir le produit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <Link href="/boutique" className="cta-btn">
          Accéder à la boutique
        </Link>
      </section>

    </main>
  );
}
