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

import styles from "../dashboard.module.css";

export default function DashboardStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) {
    return <div className={styles.card}>Chargement…</div>;
  }

  return (
    <>
      {/* STATS */}
      <div className={styles.statsGrid}>
        <StatCard title="Produits" value={stats.productsCount} />
        <StatCard title="Catégories" value={stats.categoriesCount} />
        <StatCard title="Utilisateurs" value={stats.usersCount} />
      </div>

      {/* GRAPH */}
      <div className={styles.chartBox}>
        <h2 className={styles.chartTitle}>
          📊 Activité globale
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{value}</div>
    </div>
  );
}
