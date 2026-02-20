"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsManagement() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProducts();
  }, [filter, sort, order]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        sort,
        order,
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
        showToast("Stock mis à jour ✓");
      } else {
        showToast("Erreur lors de la mise à jour", "error");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Supprimer "${productName}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        showToast("Produit supprimé ✓");
      } else {
        showToast("Erreur lors de la suppression", "error");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>

      {/* 🔔 TOAST */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          padding: "14px 24px",
          background: toast.type === "error" ? "#dc2626" : "#16a34a",
          color: "#fff", borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,.2)",
          fontWeight: "500", fontSize: "14px",
          animation: "slideIn 0.3s ease",
        }}>
          {toast.message}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "24px" }}>Gestion des Produits</h1>
        <button
          onClick={() => router.push("/products/add")}
          style={{
            padding: "10px 20px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ➕ Ajouter un produit
        </button>
      </div>

      {/* STATS */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <StatCard title="Total produits" value={stats.total} color="#0088FE" />
          <StatCard title="Rupture de stock" value={stats.outOfStock} color="#FF8042" />
          <StatCard title="Stock faible" value={stats.lowStock} color="#FFBB28" />
        </div>
      )}

      {/* FILTRES ET RECHERCHE */}
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
              { label: "Tous", value: "all" },
              { label: "Rupture", value: "out" },
              { label: "Stock faible", value: "low" },
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
                {f.label}
              </button>
            ))}
          </div>

          {/* TRI */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <option value="createdAt">Date création</option>
            <option value="name">Nom</option>
            <option value="price">Prix</option>
            <option value="stock">Stock</option>
          </select>

          <button
            onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
            style={{
              padding: "10px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {order === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* TABLEAU PRODUITS */}
      <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,.1)", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>⏳ Chargement...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Aucun produit trouvé</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee", background: "#f9fafb" }}>
                <th style={tableHeaderStyle}>Image</th>
                <th style={tableHeaderStyle}>Nom</th>
                <th style={tableHeaderStyle}>Catégorie</th>
                <th style={tableHeaderStyle}>Prix</th>
                <th style={tableHeaderStyle}>Stock</th>
                <th style={tableHeaderStyle}>Statut</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={tableCellStyle}>
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
                  </td>
                  <td style={tableCellStyle}>
                    <strong>{product.name}</strong>
                  </td>
                  <td style={tableCellStyle}>
                    {product.category?.name || "—"}
                  </td>
                  <td style={tableCellStyle}>
                    {product.promoPrice ? (
                      <div>
                        <span style={{ textDecoration: "line-through", color: "#999", marginRight: "8px" }}>
                          {product.price.toLocaleString()} Ar
                        </span>
                        <strong style={{ color: "#0070f3" }}>{product.promoPrice.toLocaleString()} Ar</strong>
                      </div>
                    ) : (
                      <strong>{product.price.toLocaleString()} Ar</strong>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      onBlur={(e) => {
                        if (e.target.value !== product.stock.toString()) {
                          handleStockUpdate(product._id, e.target.value);
                        }
                      }}
                      style={{
                        width: "70px",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td style={tableCellStyle}>
                    <StockBadge stock={product.stock} />
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => router.push(`/products/edit/${product._id}`)}
                        style={{
                          padding: "6px 12px",
                          background: "#0070f3",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        style={{
                          padding: "6px 12px",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "16px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,.1)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>{title}</p>
      <h3 style={{ fontSize: "26px", fontWeight: "bold" }}>{value}</h3>
    </div>
  );
}

function StockBadge({ stock }) {
  let color, text;

  if (stock === 0) {
    color = { bg: "#fee2e2", text: "#991b1b" };
    text = "Rupture";
  } else if (stock < 5) {
    color = { bg: "#fef3c7", text: "#92400e" };
    text = "Stock faible";
  } else {
    color = { bg: "#d1fae5", text: "#065f46" };
    text = "Disponible";
  }

  return (
    <span
      style={{
        padding: "4px 12px",
        background: color.bg,
        color: color.text,
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
}

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#6b7280",
};

const tableCellStyle = {
  padding: "12px",
  fontSize: "14px",
};
