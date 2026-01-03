"use client";
import { useState, useEffect } from "react";

export default function ProductForm({ categories, onSave, editingProduct, onCancel }) {
  const [name, setName] = useState(editingProduct?.name || "");
  const [price, setPrice] = useState(editingProduct?.price || "");
  const [stock, setStock] = useState(editingProduct?.stock || "");
  const [category, setCategory] = useState(editingProduct?.category?._id || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editingProduct?.image || null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", Number(price));
      formData.append("stock", Number(stock));
      if (category) formData.append("category", category);
      if (imageFile) formData.append("image", imageFile);
      if (editingProduct?._id) formData.append("_id", editingProduct._id);

      await onSave(formData);
      setMsg("Produit enregistré !");
    } catch (err) {
      setMsg("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} required />
      <input type="number" placeholder="Prix" value={price} onChange={e => setPrice(e.target.value)} required />
      <input type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} required />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">-- Choisir catégorie --</option>
        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <input type="file" accept="image/*" onChange={e => {
        const file = e.target.files[0];
        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      }} />
      {imagePreview && <img src={imagePreview} className="w-24 h-24 object-contain" />}
      <div className="flex gap-2">
        <button type="submit" disabled={loading}>{loading ? "Chargement..." : "Enregistrer"}</button>
        <button type="button" onClick={onCancel}>Annuler</button>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
