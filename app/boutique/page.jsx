"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./boutique.css";

export default function BoutiquePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Erreur chargement produits");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <p className="center">Chargement...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="boutique-container">
      <h1 className="title">🛍️ Boutique</h1>

      {products.length === 0 ? (
        <p>Aucun produit disponible</p>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <div className="card" key={product._id}>
              <div className="image-wrapper">
                <Image
                  src={product.image || "/no-image.png"}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="product-image"
                />
              </div>

              <h3>{product.name}</h3>
              <p className="price">{product.price} Ar</p>

              <Link
                href={`/products/${product._id}`}
                className="btn"
              >
                Voir le produit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
