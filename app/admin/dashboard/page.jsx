import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import DashboardStats from "./components/DashboardStats";
import styles from "./dashboard.module.css";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/admin/unauthorized");
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Dashboard Admin
      </h1>

      {/* 🔗 NAVIGATION EN HAUT */}
      <div className={styles.grid} style={{ marginBottom: "40px" }}>
        <a href="/admin/inventory" className={styles.card}>
          📦 Inventaire & Stock
        </a>

        <a href="/admin/products" className={styles.card}>
          🛒 Gestion Produits
        </a>

        <a href="/admin/categories" className={styles.card}>
          📂 Gestion Catégories
        </a>

        <a href="/admin/customers" className={styles.card}>
          👤 Utilisateurs
        </a>

        <a href="/admin/orders" className={styles.card}>
          📦 Voir les commandes
        </a>

      </div>

      {/* 📊 STATS + GRAPH EN BAS */}
      <DashboardStats />
    </div>
  );
}