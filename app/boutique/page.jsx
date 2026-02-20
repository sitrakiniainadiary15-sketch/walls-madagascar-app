"use client";

import { useEffect, useState, useCallback } from "react";
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
  const sort = searchParams.get("sort") || "";
  const view = searchParams.get("view") || "grid";

  // 📦 States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(search);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Filtres avancés
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();

  /* ======================
     DEBOUNCE SEARCH
  ====================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateURL({ search: searchInput, page: 1 });
      }
    }, 500); // Attendre 500ms après la dernière frappe

    return () => clearTimeout(timer);
  }, [searchInput]);

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
        if (sort) query.append("sort", sort);

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
    setCurrentPage(1); // Reset page quand filtres changent
  }, [search, category, sort]);

  /* ======================
     FETCH CATEGORIES
  ====================== */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Erreur chargement catégories");
      }
    }

    fetchCategories();
  }, []);

  /* ======================
     FILTRAGE & TRI
  ====================== */
  const filteredProducts = products.filter((product) => {
    // Filtrage par prix
    if (priceMin && product.price < parseFloat(priceMin)) return false;
    if (priceMax && product.price > parseFloat(priceMax)) return false;
    return true;
  });

  // Tri
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return (a.promoPrice || a.price) - (b.promoPrice || b.price);
      case "price-desc":
        return (b.promoPrice || b.price) - (a.promoPrice || a.price);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  /* ======================
     HELPERS
  ====================== */
  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/boutique?${newParams.toString()}`);
  };

  const handleCategoryChange = (e) => {
    updateURL({ category: e.target.value, page: 1 });
  };

  const handleSortChange = (e) => {
    updateURL({ sort: e.target.value, page: 1 });
  };

  const handleViewChange = (newView) => {
    updateURL({ view: newView });
  };

  const resetFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setSearchInput("");
    router.push("/boutique");
  };

  const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    const productDate = new Date(createdAt);
    const now = new Date();
    const daysDiff = (now - productDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30; // Nouveau si moins de 30 jours
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="boutique-container">
      {/* HEADER */}
      <div className="boutique-header">
        <h1 className="title">🛍️ Boutique</h1>
        <p className="subtitle">
          {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""} disponible{sortedProducts.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* FILTRES PRINCIPAUX */}
      <div className="filters">
        <div className="filter-group">
          <label>🔍 Rechercher</label>
          <input
            type="text"
            placeholder="Nom du produit..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>📂 Catégorie</label>
          <select value={category} onChange={handleCategoryChange}>
            <option value="">Toutes</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>↕️ Trier par</label>
          <select value={sort} onChange={handleSortChange}>
            <option value="">Par défaut</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="newest">Nouveautés</option>
          </select>
        </div>

        <button 
          className="btn-filters" 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "➖" : "➕"} Filtres avancés
        </button>
      </div>

      {/* FILTRES AVANCÉS */}
      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label>💰 Prix minimum (Ar)</label>
            <input
              type="number"
              placeholder="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>💰 Prix maximum (Ar)</label>
            <input
              type="number"
              placeholder="1000000"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>

          <button className="btn-reset" onClick={resetFilters}>
            🔄 Réinitialiser
          </button>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="view-toggle">
          <button
            className={view === "grid" ? "active" : ""}
            onClick={() => handleViewChange("grid")}
            title="Vue grille"
          >
            ⊞
          </button>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => handleViewChange("list")}
            title="Vue liste"
          >
            ☰
          </button>
        </div>

        <div className="results-count">
          Affichage {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, sortedProducts.length)} sur {sortedProducts.length}
        </div>
      </div>

      {/* ÉTATS */}
      {loading && (
        <div className="loading-skeleton">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-message">❌ {error}</div>}

      {!loading && sortedProducts.length === 0 && (
        <div className="empty-state">
          <p>😔 Aucun produit trouvé</p>
          <button className="btn-reset" onClick={resetFilters}>
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* GRID/LIST PRODUITS */}
      {!loading && currentProducts.length > 0 && (
        <div className={`products-container ${view}`}>
          {currentProducts.map((product) => (
            <div className="card" key={product._id}>
              {/* BADGES */}
              <div className="badges">
                {product.promoPrice && (
                  <span className="badge badge-promo">
                    -{Math.round(((product.price - product.promoPrice) / product.price) * 100)}%
                  </span>
                )}
                {isNewProduct(product.createdAt) && (
                  <span className="badge badge-new">Nouveau</span>
                )}
                {product.stock === 0 && (
                  <span className="badge badge-stock">Rupture</span>
                )}
                {product.stock > 0 && product.stock < 5 && (
                  <span className="badge badge-low">Stock faible</span>
                )}
              </div>

              <div className="image-wrapper">
                <Image
                  src={product.image || "/no-image.png"}
                  alt={product.name}
                  width={300}
                  height={220}
                  className="product-image"
                />
              </div>

              <div className="card-content">
                <h3>{product.name}</h3>

                {product.description && view === "list" && (
                  <p className="description">{product.description.slice(0, 100)}...</p>
                )}

                {/* PRIX */}
                <div className="price">
                  {product.promoPrice ? (
                    <>
                      <span className="promo-price">{product.promoPrice.toLocaleString()} Ar</span>
                      <span className="old-price">{product.price.toLocaleString()} Ar</span>
                    </>
                  ) : (
                    <span className="normal-price">{product.price.toLocaleString()} Ar</span>
                  )}
                </div>

                {/* STOCK INFO */}
                {product.stock > 0 && product.stock < 10 && (
                  <p className="stock-info">⚠️ Plus que {product.stock} en stock</p>
                )}

                {/* ACTIONS */}
                <div className="card-actions">
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
                    {product.stock === 0 ? "Rupture de stock" : "🛒 Ajouter"}
                  </button>

                  <Link
                    href={`/products/${product._id}`}
                    className="btn secondary"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Précédent
          </button>

          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Afficher seulement quelques pages autour de la page actuelle
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    className={`btn-page ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return <span key={pageNum}>...</span>;
              }
              return null;
            })}
          </div>

          <button
            className="btn-page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
