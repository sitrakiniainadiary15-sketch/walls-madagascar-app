"use client";
import { useState } from "react";
import "./ProductForm.css";

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

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(
    editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : [])
  );

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    const existingCount =
      editingProduct?.images?.length || (editingProduct?.image ? 1 : 0);

    if (index >= existingCount) {
      const newFileIndex = index - existingCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
  };

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

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const existingImages = imagePreviews.filter(
        (img) => typeof img === "string" && !img.startsWith("blob:")
      );
      formData.append("existingImages", JSON.stringify(existingImages));

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
    <form onSubmit={handleSubmit} className="product-form">
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

      {/* Upload images */}
      <div className="image-upload-section">
        <label>Images du produit</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        <p className="image-count">
          {imagePreviews.length} image(s) sélectionnée(s)
        </p>
      </div>

      {/* Prévisualisation */}
      {imagePreviews.length > 0 && (
        <div className="image-previews">
          {imagePreviews.map((src, index) => (
            <div key={index} className="image-preview-item">
              <img src={src} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="remove-image-btn"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="form-buttons">
        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? "Chargement..." : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Annuler
        </button>
      </div>

      {msg && (
        <p className={`form-message ${msg.includes("✅") ? "success" : "error"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}
