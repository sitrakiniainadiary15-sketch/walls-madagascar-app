"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../components/CartContext";
import "./boutique.css";

export default function BoutiquePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔎 Paramètres URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  // 📦 States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  /* ======================
     FETCH PRODUITS
  ====================== */
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (category) query.append("category", category);

        const res = await fetch(`/api/products?${query.toString()}`);
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

    fetchProducts();
  }, [search, category]);

  /* ======================
     FETCH CATEGORIES
  ====================== */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories"); // ⚠️ vérifie le nom du dossier
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Erreur chargement catégories");
      }
    }

    fetchCategories();
  }, []);

  /* ======================
     HANDLERS
  ====================== */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    router.push(`/boutique?search=${value}&category=${category}`);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    router.push(`/boutique?search=${search}&category=${value}`);
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="boutique-container">
      <h1 className="title">🛍️ Boutique</h1>

      {/* FILTRES */}
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={handleSearchChange}
        />

        <select value={category} onChange={handleCategoryChange}>
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* ETATS */}
      {loading && <p className="center">Chargement...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && products.length === 0 && (
        <p>Aucun produit disponible</p>
      )}

      {/* GRID PRODUITS */}
      <div className="grid">
        {products.map((product) => (
          <div className="card" key={product._id}>
            <div className="image-wrapper">
              <Image
                src={product.image || "/no-image.png"}
                alt={product.name}
                width={300}
                height={220}
                className="product-image"
              />
            </div>

            <h3>{product.name}</h3>

            {/* PRIX */}
            <p className="price">
              {product.promoPrice ? (
                <>
                  <span className="old-price">{product.price} Ar</span>
                  <span className="promo-price">
                    {product.promoPrice} Ar
                  </span>
                </>
              ) : (
                <span>{product.price} Ar</span>
              )}
            </p>

            {/* PANIER */}
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

            {/* LIEN */}
            <Link
              href={`/products/${product._id}`}
              className="btn secondary"
            >
              Voir le produit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
