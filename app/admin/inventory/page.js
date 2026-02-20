"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export default function InventoryManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter: filter === "all" ? "all" : filter === "low" ? "low" : "out",
        sort: "stock",
        order: "asc",
        ...(search && { search }),
      });

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          updates: { stock: parseInt(newStock) },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, stock: parseInt(newStock) } : p
          )
        );
        // Rafraîchir les stats
        fetchProducts();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleBulkStockUpdate = async (productId, increment) => {
    const product = products.find((p) => p._id === productId);
    const newStock = Math.max(0, product.stock + increment);
    await handleStockUpdate(productId, newStock);
  };

  return (
    <div style={{maxWidth: "1400px", margin: "0 auto", padding: "24px"}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{fontSize: "32px", fontWeight: "bold", marginBottom: "24px"}}>📦 Gestion de l'Inventaire</h1> 
        <button
          onClick={() => router.push("/admin/products")}
          style={{
            padding: "10px 20px",
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Retour aux produits
        </button>
      </div>

      {/* ALERTES CRITIQUES */}
      {stats && (stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          {stats.outOfStock > 0 && (
            <div
              style={{
                flex: 1,
                minWidth: "250px",
                padding: "16px",
                background: "#fee2e2",
                border: "2px solid #dc2626",
                borderRadius: "8px",
                color: "#991b1b",
              }}
            >
              <strong>🚨 URGENT :</strong> {stats.outOfStock} produit(s) en rupture de stock
            </div>
          )}
          {stats.lowStock > 0 && (
            <div
              style={{
                flex: 1,
                minWidth: "250px",
                padding: "16px",
                background: "#fef3c7",
                border: "2px solid #f59e0b",
                borderRadius: "8px",
                color: "#92400e",
              }}
            >
              <strong>⚠️ ATTENTION :</strong> {stats.lowStock} produit(s) avec stock faible
            </div>
          )}
        </div>
      )}

      {/* STATS */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <StatCard title="Total produits" value={stats.total} icon="📦" color="#0088FE" />
          <StatCard title="En rupture" value={stats.outOfStock} icon="🚨" color="#dc2626" />
          <StatCard title="Stock faible" value={stats.lowStock} icon="⚠️" color="#f59e0b" />
          <StatCard
            title="Stock sain"
            value={stats.total - stats.outOfStock - stats.lowStock}
            icon="✅"
            color="#10b981"
          />
        </div>
      )}

      {/* FILTRES */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          {/* RECHERCHE */}
          <form onSubmit={handleSearch} style={{ flex: "1", minWidth: "250px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              🔍
            </button>
          </form>

          {/* FILTRES */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "Tous", value: "all", icon: "📦" },
              { label: "Rupture", value: "out", icon: "🚨" },
              { label: "Stock faible", value: "low", icon: "⚠️" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "8px 16px",
                  background: filter === f.value ? "#0070f3" : "#fff",
                  color: filter === f.value ? "#fff" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: filter === f.value ? "600" : "400",
                }}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLEAU INVENTAIRE */}
      <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,.1)", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>⏳ Chargement...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            {filter === "out" && "✅ Aucun produit en rupture de stock"}
            {filter === "low" && "✅ Aucun produit avec stock faible"}
            {filter === "all" && "Aucun produit trouvé"}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee", background: "#f9fafb" }}>
                <th style={tableHeaderStyle}>Produit</th>
                <th style={tableHeaderStyle}>Catégorie</th>
                <th style={tableHeaderStyle}>Stock actuel</th>
                <th style={tableHeaderStyle}>Statut</th>
                <th style={tableHeaderStyle}>Actions rapides</th>
                <th style={tableHeaderStyle}>Modifier stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  style={{
                    borderBottom: "1px solid #f5f5f5",
                    background: product.stock === 0 ? "#fef2f2" : product.stock < 5 ? "#fffbeb" : "#fff",
                  }}
                >
                  <td style={tableCellStyle}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                        />
                      ) : (
                        <div style={{ width: "50px", height: "50px", background: "#e5e7eb", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          📦
                        </div>
                      )}
                      <div>
                        <strong>{product.name}</strong>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                          {product.price} €
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tableCellStyle}>{product.category?.name || "—"}</td>
                  <td style={tableCellStyle}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: product.stock === 0 ? "#dc2626" : product.stock < 5 ? "#f59e0b" : "#10b981" }}>
                      {product.stock}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <StockBadge stock={product.stock} />
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleBulkStockUpdate(product._id, -1)}
                        disabled={product.stock === 0}
                        style={{
                          padding: "6px 12px",
                          background: product.stock === 0 ? "#e5e7eb" : "#fff",
                          color: product.stock === 0 ? "#9ca3af" : "#333",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: product.stock === 0 ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleBulkStockUpdate(product._id, -10)}
                        disabled={product.stock < 10}
                        style={{
                          padding: "6px 12px",
                          background: product.stock < 10 ? "#e5e7eb" : "#fff",
                          color: product.stock < 10 ? "#9ca3af" : "#333",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: product.stock < 10 ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleBulkStockUpdate(product._id, 10)}
                        style={{
                          padding: "6px 12px",
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleBulkStockUpdate(product._id, 50)}
                        style={{
                          padding: "6px 12px",
                          background: "#0070f3",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        +50
                      </button>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      min="0"
                      onBlur={(e) => {
                        if (e.target.value !== product.stock.toString()) {
                          handleStockUpdate(product._id, e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleStockUpdate(product._id, e.target.value);
                          e.target.blur();
                        }
                      }}
                      style={{
                        width: "80px",
                        padding: "8px",
                        border: "2px solid #0070f3",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* LÉGENDE */}
      <div style={{ marginTop: "20px", padding: "16px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px", color: "#6b7280" }}>
        💡 <strong>Astuces :</strong>
        <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
          <li>Utilisez les boutons rapides (+10, +50, -1, -10) pour ajuster rapidement le stock</li>
          <li>Modifiez directement le nombre dans l'input et appuyez sur Entrée</li>
          <li>Les produits en rupture sont surlignés en rouge, stock faible en jaune</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,.1)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>{title}</p>
          <h3 style={{ fontSize: "28px", fontWeight: "bold" }}>{value}</h3>
        </div>
        <span style={{ fontSize: "32px" }}>{icon}</span>
      </div>
    </div>
  );
}

function StockBadge({ stock }) {
  let color, text, icon;

  if (stock === 0) {
    color = { bg: "#fee2e2", text: "#991b1b" };
    text = "RUPTURE";
    icon = "🚨";
  } else if (stock < 5) {
    color = { bg: "#fef3c7", text: "#92400e" };
    text = "FAIBLE";
    icon = "⚠️";
  } else if (stock < 20) {
    color = { bg: "#dbeafe", text: "#1e40af" };
    text = "MOYEN";
    icon = "📊";
  } else {
    color = { bg: "#d1fae5", text: "#065f46" };
    text = "BON";
    icon = "✅";
  }

  return (
    <span
      style={{
        padding: "6px 12px",
        background: color.bg,
        color: color.text,
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {icon} {text}
    </span>
  );
}

const tableHeaderStyle = {
  padding: "16px 12px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
};

const tableCellStyle = {
  padding: "16px 12px",
  fontSize: "14px",
};
