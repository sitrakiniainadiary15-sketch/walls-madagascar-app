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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory]);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || data || []);
  };

  const fetchProducts = async () => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", 5);

    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();

    setProducts(data.products || []);
    setTotalPages(data.totalPages || 1);
  };

  const handleSave = async (formData) => {
    const method = editingProduct ? "PUT" : "POST";

    const res = await fetch("/api/products", {
      method,
      body: formData,
    });

    if (!res.ok) throw new Error("Erreur serveur");

    await fetchProducts();
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;

    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Erreur serveur");

    await fetchProducts();
  };

  return (
    <div className="dashboard-container p-6 min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title">Dashboard Produits</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Ajouter produit
        </button>
      </div>

      {/* FILTRES */}
      <div className="filters-bar">
        <input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Catégorie</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                Aucun produit trouvé
              </td>
            </tr>
          )}

          {products.map((p) => (
            <tr key={p._id}>
              <td>
                {p.image ? (
                  <img src={p.image} className="product-image" />
                ) : (
                  "—"
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.price} €</td>
              <td>{p.stock}</td>
              <td>{p.category?.name || "Non classé"}</td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => handleEdit(p)}
                    className="btn-edit"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="btn-delete"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL FORM */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <ProductForm
              categories={categories}
              editingProduct={editingProduct}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
