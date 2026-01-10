"use client";
import { useState } from "react";

export default function ProductForm({
  categories,
  onSave,
  editingProduct,
  onCancel,
}) {
  const [name, setName] = useState(editingProduct?.name || "");
  const [brand, setBrand] = useState(editingProduct?.brand || "");
  const [size, setSize] = useState(editingProduct?.size || "");
  const [condition, setCondition] = useState(editingProduct?.condition || "");
  const [description, setDescription] = useState(editingProduct?.description || "");

  const [price, setPrice] = useState(editingProduct?.price || "");
  const [promoPrice, setPromoPrice] = useState(editingProduct?.promoPrice || "");
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
      formData.append("brand", brand);
      formData.append("size", size);
      formData.append("condition", condition);
      formData.append("description", description);

      formData.append("price", Number(price));
      if (promoPrice) formData.append("promoPrice", Number(promoPrice));
      formData.append("stock", Number(stock));

      if (category) formData.append("category", category);
      if (imageFile) formData.append("image", imageFile);
      if (editingProduct?._id) formData.append("_id", editingProduct._id);

      await onSave(formData);
      setMsg("✅ Produit enregistré !");
    } catch (err) {
      setMsg("❌ Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">

      <input
        placeholder="Nom du produit"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        placeholder="Marque (ex: Pull & Bear)"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      />

      <select value={size} onChange={(e) => setSize(e.target.value)}>
        <option value="">-- Taille --</option>
        <option value="XS">XS</option>
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
        <option value="XL">XL</option>
      </select>

      <select value={condition} onChange={(e) => setCondition(e.target.value)}>
        <option value="">-- État --</option>
        <option value="Neuf">Neuf</option>
        <option value="Très bon état">Très bon état</option>
        <option value="Bon état">Bon état</option>
        <option value="Correct">Correct</option>
      </select>

      <textarea
        placeholder="Description du produit"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <input
        type="number"
        placeholder="Prix"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Prix promo (optionnel)"
        value={promoPrice}
        onChange={(e) => setPromoPrice(e.target.value)}
      />

      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        required
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">-- Choisir catégorie --</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
          }
        }}
      />

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          className="w-24 h-24 object-contain border"
        />
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={loading}>
          {loading ? "Chargement..." : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>

      {msg && <p>{msg}</p>}
    </form>
  );
}
