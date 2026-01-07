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


      {/* 📊 STATS + GRAPH */}
      <DashboardStats />

      {/* 🔗 NAVIGATION */}
      <div className={styles.grid}>
        <a href="/admin/products" className={styles.card}>
          🛒 Gestion Produits
        </a>

        <a href="/admin/categories" className={styles.card}>
          📂 Gestion Catégories
        </a>

        <a href="/admin/users" className={styles.card}>
          👤 Utilisateurs
        </a>
        <a href="/products/add" className={styles.card}>
  ➕ Ajouter un produit
</a>
      </div>
    </div>
  );
}
