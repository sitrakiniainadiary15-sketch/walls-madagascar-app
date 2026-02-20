"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/app/components/ProductForm";
import "./products.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || data || []);
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", 10);

      if (search) params.set("search", search);
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Erreur chargement produits:", err);
      setError("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION : Envoie du JSON au lieu de FormData
 const handleSave = async (productData) => {
  try {
    setLoading(true);
    setError("");

    const method = editingProduct ? "PUT" : "POST";

    const res = await fetch("/api/products", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Erreur serveur");
    }

    await fetchProducts();
    setShowForm(false);
    setEditingProduct(null);

    alert("Produit enregistré avec succès !");
  } catch (err) {
    console.error("Erreur sauvegarde:", err);
    setError(err.message);
    alert("Erreur: " + err.message);
  } finally {
    setLoading(false);
  }
};


  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur serveur");
      }

      alert("Produit supprimé avec succès !");
      await fetchProducts();
    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="page-header">
        <h1 className="page-title">📦 Gestion des Produits</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="btn btn-primary"
          disabled={loading}
        >
          ➕ Ajouter un produit
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {/* FILTRES */}
      <div className="filters-card">
        <div className="filter-group">
          <label>🔍 Rechercher</label>
          <input
            type="text"
            placeholder="Nom du produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>📂 Catégorie</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {(search || selectedCategory) && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("");
              setPage(1);
            }}
            className="btn btn-secondary"
          >
            🔄 Réinitialiser
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="stats-bar">
        <span className="stat-item">
          📊 Total : {products.length} produit{products.length > 1 ? "s" : ""}
        </span>
        <span className="stat-item">
          📄 Page {page} sur {totalPages}
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Marque</th>
                <th>Prix</th>
                <th>Promo</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-row">
                    😔 Aucun produit trouvé
                  </td>
                </tr>
              )}

              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="product-thumbnail"
                      />
                    ) : (
                      <div className="no-image">📷</div>
                    )}
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>{p.brand || "—"}</td>
                  <td className="price-cell">{p.price} Ar</td>
                  <td className="promo-cell">
                    {p.promoPrice ? (
                      <span className="promo-badge">{p.promoPrice} Ar</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className={`stock-badge ${p.stock === 0 ? "out" : p.stock < 5 ? "low" : "ok"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>{p.category?.name || "Non classé"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(p)}
                        className="btn-icon btn-edit"
                        title="Modifier"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="btn-icon btn-delete"
                        title="Supprimer"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            className="btn-page"
          >
            ← Précédent
          </button>

          <span className="page-info">
            Page {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || loading}
            className="btn-page"
          >
            Suivant →
          </button>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProductForm
              categories={categories}
              editingProduct={editingProduct}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
