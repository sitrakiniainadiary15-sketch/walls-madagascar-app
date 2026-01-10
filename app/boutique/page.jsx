"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../components/CartContext";
import "./boutique.css";

export default function BoutiquePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

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

              {/* PRIX */}
              <p className="price">
                {product.promoPrice ? (
                  <>
                    <span className="old-price">
                      {product.price} Ar
                    </span>
                    <span className="promo-price">
                      {product.promoPrice} Ar
                    </span>
                  </>
                ) : (
                  <span>{product.price} Ar</span>
                )}
              </p>

              {/* AJOUT PANIER */}
              <button
                className="btn add-cart"
                disabled={!product.isAvailable || product.stock === 0}
                onClick={() =>
                  addToCart({
                    _id: product._id,
                    name: product.name,
                    price: product.promoPrice ?? product.price,
                    image: product.image,
                    quantity: 1,
                    stock: product.stock,
                  })
                }
              >
                Ajouter au panier
              </button>

              {/* LIEN PRODUIT */}
              <Link
                href={`/products/${product._id}`}
                className="btn secondary"
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
