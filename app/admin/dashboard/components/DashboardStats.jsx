"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En traitement",
  paid: "Payée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function DashboardStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState("7"); // 1, 7, 30, 365

  useEffect(() => {
    fetch(`/api/admin/stats?period=${period}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("API ERROR:", text);
          throw new Error("Erreur API");
        }
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true));
  }, [period]);

  if (error) {
    return (
      <div style={{ padding: "20px", background: "#fee", borderRadius: "8px", color: "#c00" }}>
        ❌ Erreur lors du chargement des statistiques
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "18px" }}>
        ⏳ Chargement des statistiques...
      </div>
    );
  }

  const { stats, chartData, salesEvolution, topProducts, recentOrders, statusDistribution } = data;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* 🎛️ SÉLECTEUR DE PÉRIODE */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Aujourd'hui", value: "1" },
          { label: "7 jours", value: "7" },
          { label: "30 jours", value: "30" },
          { label: "Année", value: "365" },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: period === p.value ? "#0070f3" : "#fff",
              color: period === p.value ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: period === p.value ? "600" : "400",
              transition: "all 0.2s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 🔢 CARTES KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          title="Clients"
          value={stats.customersCount}
          subtitle={`+${stats.newCustomers} nouveaux`}
          icon="👥"
          color="#0088FE"
        />
        <StatCard
          title="Commandes"
          value={stats.ordersCount}
          subtitle={`${stats.periodOrders} sur la période`}
          icon="📦"
          color="#00C49F"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${parseFloat(stats.totalRevenue).toLocaleString("fr-FR")} Ar`}
          subtitle={`${parseFloat(stats.periodRevenue).toLocaleString("fr-FR")} Ar sur la période`}
          icon="💰"
          color="#FFBB28"
        />
        <StatCard
          title="Panier moyen"
          value={`${parseFloat(stats.averageBasket).toLocaleString("fr-FR")} Ar`}
          subtitle={`Aujourd'hui: ${stats.todayOrders} cmd`}
          icon="🛒"
          color="#FF8042"
        />
      </div>

      {/* ⚠️ ALERTES */}
      {(stats.lowStockProducts > 0 || stats.pendingOrders > 0) && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {stats.lowStockProducts > 0 && (
            <Alert
              type="warning"
              message={`⚠️ ${stats.lowStockProducts} produit(s) en rupture de stock`}
            />
          )}
          {stats.pendingOrders > 0 && (
            <Alert
              type="info"
              message={`📋 ${stats.pendingOrders} commande(s) en attente`}
            />
          )}
        </div>
      )}

      {/* 📊 GRAPHIQUES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
        }}
      >
        {/* ÉVOLUTION DES VENTES */}
        <ChartCard title="📈 Évolution des ventes">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0070f3"
                strokeWidth={2}
                name="CA (€)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#00C49F"
                strokeWidth={2}
                name="Commandes"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* RÉPARTITION PAR STATUT */}
        <ChartCard title="📊 Commandes par statut">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${STATUS_LABELS[entry.name]} (${entry.value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 🏆 TOP PRODUITS */}
      <ChartCard title="🏆 Top 5 produits les plus vendus">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} fontSize={12} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#0070f3" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 📋 DERNIÈRES COMMANDES */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,.1)",
        }}
      >
        <h2 style={{ marginBottom: "16px", fontSize: "18px" }}>📋 Dernières commandes</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #eee" }}>
                <th style={tableHeaderStyle}>Client</th>
                <th style={tableHeaderStyle}>Montant</th>
                <th style={tableHeaderStyle}>Statut</th>
                <th style={tableHeaderStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={order._id || index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={tableCellStyle}>
                    {order.customer.firstname} {order.customer.lastname}
                  </td>
                  <td style={tableCellStyle}>
                    <strong>{parseFloat(order.total).toLocaleString("fr-FR")} Ar</strong>
                  </td>
                  <td style={tableCellStyle}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={tableCellStyle}>
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* 🎨 COMPOSANTS */

function StatCard({ title, value, subtitle, icon, color }) {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>{title}</p>
          <h3 style={{ fontSize: "28px", fontWeight: "bold", margin: "0" }}>{value}</h3>
          {subtitle && (
            <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "6px" }}>{subtitle}</p>
          )}
        </div>
        <span style={{ fontSize: "32px" }}>{icon}</span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,.1)",
      }}
    >
      <h2 style={{ marginBottom: "16px", fontSize: "18px" }}>{title}</h2>
      {children}
    </div>
  );
}

function Alert({ type, message }) {
  const colors = {
    warning: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  };

  const color = colors[type];

  return (
    <div
      style={{
        padding: "12px 16px",
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: "8px",
        color: color.text,
        fontSize: "14px",
        flex: 1,
        minWidth: "250px",
      }}
    >
      {message}
    </div>
  );
}

function StatusBadge({ status }) {
  const statusColors = {
    pending: { bg: "#fef3c7", text: "#92400e" },
    confirmed: { bg: "#dbeafe", text: "#1e40af" },
    processing: { bg: "#e0e7ff", text: "#3730a3" },
    paid: { bg: "#d1fae5", text: "#065f46" },
    shipped: { bg: "#cffafe", text: "#155e75" },
    delivered: { bg: "#d1fae5", text: "#065f46" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
  };

  const color = statusColors[status] || { bg: "#f3f4f6", text: "#374151" };

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
      {STATUS_LABELS[status] || status}
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
