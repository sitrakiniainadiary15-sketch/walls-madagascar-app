"use client";
import { useEffect, useState } from "react";
import ProductForm from "@/app/components/ProductForm";


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
    if (editingProduct?._id) {
      formData.append("_id", editingProduct._id);
    }

    const method = editingProduct ? "PUT" : "POST";
    const res = await fetch("/api/products", { method, body: formData });

    if (!res.ok) throw new Error("Erreur serveur");

    await fetchProducts();
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
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
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard Produits</h1>
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

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded flex-1"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">-- Toutes catégories --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Image</th>
            <th className="p-3">Nom</th>
            <th className="p-3">Prix</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Catégorie</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4">
                Aucun produit trouvé
              </td>
            </tr>
          )}

          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="p-2">
                {p.image ? (
                  <img
                    src={p.image}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.price} €</td>
              <td className="p-2">{p.stock}</td>
              <td className="p-2">{p.category?.name || "Non classé"}</td>
              <td className="p-2 flex gap-2 justify-center">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <ProductForm
          categories={categories}
          editingProduct={editingProduct}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
