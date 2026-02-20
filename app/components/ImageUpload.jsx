// app/components/ImageUpload.jsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageUpload({ 
  type = "product",      // "avatar" ou "product"
  currentImage = "",     // Image actuelle
  onUpload,              // Callback quand upload réussi
  multiple = false       // Upload multiple (pour produits)
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const uploadedUrls = [];

      for (const file of files) {
        // ✅ Preview local immédiat
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        // ✅ Préparer le FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        // ✅ Upload
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Erreur lors de l'upload");
          return;
        }

        uploadedUrls.push(data.url);
        setPreview(data.url);
      }

      // ✅ Appeler le callback
      if (multiple) {
        onUpload(uploadedUrls);
      } else {
        onUpload(uploadedUrls[0]);
      }

    } catch (err) {
      setError("Erreur lors de l'upload");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      
      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className={`object-cover rounded-lg border-2 border-gray-200 ${
              type === "avatar" 
                ? "w-24 h-24 rounded-full" 
                : "w-48 h-48"
            }`}
          />
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
          )}
        </div>
      )}

      {/* Zone upload */}
      <label className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-gray-50 transition ${
        preview ? "border-gray-300 w-48" : "border-gray-400 w-64 h-40"
      }`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={handleUpload}
          className="hidden"
          disabled={loading}
        />
        {loading ? (
          <p className="text-sm text-gray-500">Upload en cours...</p>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-sm text-gray-500">
              {preview ? "Changer l'image" : "Cliquer pour uploader"}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP - Max 5MB</p>
          </>
        )}
      </label>

      {/* Erreur */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}