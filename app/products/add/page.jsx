"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Charger catégories
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Charger produits
  useEffect(() => {
    const url = selectedCategory
      ? `/api/products?category=${selectedCategory}`
      : "/api/products";

    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [selectedCategory]);

  // Ajouter produit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) {
      setMsg("Veuillez remplir tous les champs");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, stock, category }),
    });

    const data = await res.json();
    setMsg(data.message);

    setName(""); setPrice(""); setStock(""); setCategory("");
    setShowForm(false);

    // Recharger produits
    const reloadUrl = selectedCategory
      ? `/api/products?category=${selectedCategory}`
      : "/api/products";
    fetch(reloadUrl)
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Produits</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Ajouter un produit
        </button>
      </div>

      <div className="flex gap-6">
        {/* Categories */}
        <div className="w-1/4 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Catégories</h3>
          <p
            className="cursor-pointer mb-2 font-medium hover:text-blue-600"
            onClick={() => setSelectedCategory("")}
          >
            Tous les produits
          </p>
          {categories.map(cat => (
            <p
              key={cat._id}
              className="cursor-pointer mb-2 hover:text-blue-600"
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </p>
          ))}
        </div>

        {/* Produits */}
        <div className="w-3/4">
          <h3 className="font-semibold mb-4">Liste des produits</h3>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Prix</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">Aucun produit</td>
                  </tr>
                ) : (
                  products.map(prod => (
                    <tr key={prod._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{prod.name}</td>
                      <td className="px-4 py-2">{prod.price}</td>
                      <td className="px-4 py-2">{prod.stock}</td>
                      <td className="px-4 py-2">{prod.category?.name || "Aucune"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Formulaire Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Ajouter un produit</h3>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
              <input
                placeholder="Nom du produit"
                value={name}
                onChange={e => setName(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                placeholder="Prix"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Choisir catégorie --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex justify-between mt-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
              </div>
              {msg && <p className="text-green-600 mt-2">{msg}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
