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

  const [uploadedUrls, setUploadedUrls] = useState(
    editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : [])
  );
  const [uploadedPublicIds, setUploadedPublicIds] = useState(
    editingProduct?.imagePublicIds || []
  );
  const [imagePreviews, setImagePreviews] = useState(
    editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : [])
  );

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ✅ Upload immédiat sur Cloudinary
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setMsg("📤 Upload en cours...");

    try {
      for (const file of files) {
        const localPreview = URL.createObjectURL(file);
        setImagePreviews((prev) => [...prev, localPreview]);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "product");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setMsg("❌ Erreur upload: " + data.message);
          setUploading(false);
          return;
        }

        setImagePreviews((prev) => [...prev.slice(0, -1), data.url]);
        setUploadedUrls((prev) => [...prev, data.url]);
        setUploadedPublicIds((prev) => [...prev, data.publicId]);
      }

      setMsg("✅ Images uploadées !");
    } catch (err) {
      setMsg("❌ Erreur: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadedPublicIds((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Envoie du JSON pur
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) {
      setMsg("⏳ Attendez la fin de l'upload...");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      // ✅ Objet JSON simple
      const body = {
        name,
        brand,
        size,
        condition,
        description,
        price: Number(price),
        promoPrice: promoPrice ? Number(promoPrice) : null,
        stock: Number(stock),
        category: category || null,
        images: uploadedUrls,
        image: uploadedUrls[0] || "",
        imagePublicIds: uploadedPublicIds,
      };

      if (editingProduct?._id) body._id = editingProduct._id;

      // ✅ onSave reçoit un objet JSON, pas un FormData
      await onSave(body);
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
          disabled={uploading}
        />
        {uploading && (
          <p style={{ color: "#0070f3", marginTop: "8px" }}>
            ⏳ Upload en cours...
          </p>
        )}
        <p className="image-count">
          {uploadedUrls.length} image(s) sur Cloudinary ✅
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
        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-submit"
        >
          {loading ? "Enregistrement..." : uploading ? "Upload..." : "Enregistrer"}
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