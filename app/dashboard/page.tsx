import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import Link from "next/link";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  await connectDB();

  // Récupérer les commandes de l'utilisateur
  const allOrders = await Order.find({ 
    "customer.email": session.user.email 
  })
  .sort({ createdAt: -1 })
  .lean();

  // Calculer les stats
  const totalOrders = allOrders.length;
  const totalSpent = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = allOrders.filter(o => o.status === "pending" || o.status === "confirmed" || o.status === "processing").length;
  const deliveredOrders = allOrders.filter(o => o.status === "delivered").length;

  // Dernières commandes (3)
  const recentOrders = allOrders.slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Bienvenue, {session.user.name} ! 👋</h1>
        <p className="page-subtitle">Voici un aperçu de votre compte</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <span className="stat-icon">📦</span>
            <span className="stat-label">Total Commandes</span>
          </div>
          <div className="stat-value">{totalOrders}</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <span className="stat-label">Total Dépensé</span>
          </div>
          <div className="stat-value">{totalSpent.toLocaleString()} Ar</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <span className="stat-icon">⏳</span>
            <span className="stat-label">En Cours</span>
          </div>
          <div className="stat-value">{pendingOrders}</div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Livrées</span>
          </div>
          <div className="stat-value">{deliveredOrders}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📦 Dernières commandes</h2>
          <Link href="/dashboard/orders" className="btn btn-secondary">
            Voir tout
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Aucune commande pour le moment</p>
            <Link href="/boutique" className="btn btn-primary">
              🛍️ Commencer mes achats
            </Link>
          </div>
        ) : (
          <div>
            {recentOrders.map((order) => (
              <OrderQuickView key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🚀 Actions rapides</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <Link href="/dashboard/profile" className="btn btn-secondary" style={{ justifyContent: "center" }}>
            👤 Modifier mon profil
          </Link>
          <Link href="/dashboard/addresses" className="btn btn-secondary" style={{ justifyContent: "center" }}>
            📍 Gérer mes adresses
          </Link>
          <Link href="/boutique" className="btn btn-primary" style={{ justifyContent: "center" }}>
            🛍️ Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant pour affichage rapide d'une commande
function OrderQuickView({ order }) {
  const statusInfo = {
    pending: { label: "En attente", color: "#f59e0b", icon: "⏳" },
    confirmed: { label: "Confirmée", color: "#3b82f6", icon: "✔️" },
    processing: { label: "En préparation", color: "#8b5cf6", icon: "📦" },
    paid: { label: "Payée", color: "#10b981", icon: "💰" },
    shipped: { label: "Expédiée", color: "#06b6d4", icon: "🚚" },
    delivered: { label: "Livrée", color: "#22c55e", icon: "✅" },
    cancelled: { label: "Annulée", color: "#ef4444", icon: "❌" },
  };

  const status = statusInfo[order.status] || statusInfo.pending;

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      borderBottom: "1px solid #e5e7eb",
      flexWrap: "wrap",
      gap: "1rem"
    }}>
      <div>
        <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
          Commande #{order._id.toString().slice(-8).toUpperCase()}
        </div>
        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
          {order.total?.toLocaleString()} Ar
        </div>
        <span style={{
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          fontSize: "0.85rem",
          fontWeight: "600",
          backgroundColor: status.color + "20",
          color: status.color
        }}>
          {status.icon} {status.label}
        </span>
      </div>
    </div>
  );
}
