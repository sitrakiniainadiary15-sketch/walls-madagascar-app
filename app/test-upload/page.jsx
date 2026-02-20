// app/test-upload/page.jsx
"use client";

import { useState } from "react";

export default function TestUpload() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "product");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setResult(data);
      console.log("✅ Upload réussi:", data);

    } catch (err) {
      setError("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        
        <h1 className="text-2xl font-bold text-center mb-6">
          🧪 Test Upload Cloudinary
        </h1>

        {/* Input fichier */}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={loading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer mb-4"
        />

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Upload en cours...</p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Résultat */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 font-bold mb-3">✅ Upload réussi !</p>
            
            {/* Image uploadée */}
            <img
              src={result.url}
              alt="Uploaded"
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            
            <p className="text-xs text-gray-500 break-all">
              <strong>URL :</strong> {result.url}
            </p>
            <p className="text-xs text-gray-500 break-all mt-1">
              <strong>Public ID :</strong> {result.publicId}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

