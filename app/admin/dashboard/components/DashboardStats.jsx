"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
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
  }, []);

  if (error) {
    return <div>❌ Erreur chargement stats</div>;
  }

  if (!data) {
    return <div>⏳ Chargement…</div>;
  }

  const { stats, chartData } = data;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* 🔢 CARTES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard title="Clients" value={stats.customersCount} />
        <StatCard title="Commandes" value={stats.ordersCount} />
        <StatCard title="Chiffre d'affaires" value={`${stats.totalRevenue} €`} />
        <StatCard title="Aujourd’hui" value={stats.todayOrders} />
      </div>

      {/* 📊 GRAPH */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,.1)",
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>📊 Statistiques globales</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "16px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,.1)",
      }}
    >
      <p style={{ color: "#6b7280", fontSize: "14px" }}>{title}</p>
      <h3 style={{ fontSize: "26px", fontWeight: "bold" }}>{value}</h3>
    </div>
  );
}
