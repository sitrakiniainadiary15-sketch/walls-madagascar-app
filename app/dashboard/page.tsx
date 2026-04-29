import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import User from "@/app/models/User";
import Link from "next/link";
import Image from "next/image";
import "./dashboard.css";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await connectDB();

  // Commandes de l'utilisateur
  const allOrders = await Order.find({ "customer.email": session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  // Profil utilisateur (pour les adresses)
  const user = await User.findOne({ email: session.user.email }).lean();
  const addresses = user?.addresses || [];

  const statusLabels = {
    pending:    "En attente",
    confirmed:  "Confirmée",
    processing: "En préparation",
    paid:       "Payée",
    shipped:    "Expédiée",
    delivered:  "Livré",
    cancelled:  "Annulé",
  };

  return (
    <div className="db-wrapper">

      {/* ── Titre ── */}
      <h1 className="db-page-title">Dashboard</h1>

      {/* ── Profil ── */}
      <div className="db-card">
        <div className="db-profile-row">

          {/* Nom */}
          <div className="db-profile-field">
            <span className="db-profile-field-value">{session.user.name}</span>
            <Link href="/dashboard/profile" className="db-edit-icon" title="Modifier">✏️</Link>
          </div>

          {/* Mail */}
          <div className="db-profile-field">
            <span className="db-profile-field-label">Mail :</span>
            <span className="db-profile-field-value">{session.user.email}</span>
            <Link href="/dashboard/profile" className="db-edit-icon" title="Modifier">✏️</Link>
          </div>

          {/* Tel */}
          <div className="db-profile-field">
            <span className="db-profile-field-label">Tel :</span>
            <span className="db-profile-field-value">{user?.phone || "—"}</span>
            <Link href="/dashboard/profile" className="db-edit-icon" title="Modifier">✏️</Link>
          </div>

          {/* Avatar */}
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name}
              width={48}
              height={48}
              className="db-profile-avatar"
            />
          ) : (
            <div className="db-profile-avatar-placeholder">
              {session.user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}

        </div>
      </div>

      {/* ── Historique de commande ── */}
      <div className="db-card">
        <p className="db-section-title">Historique de commande</p>

        {allOrders.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            Aucune commande pour le moment.{" "}
            <Link href="/boutique" style={{ color: "#c0616a" }}>Commencer mes achats</Link>
          </p>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Quantité</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="db-order-num">
                      #{order._id.toString().slice(-4).toUpperCase()}
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td>{Number(order.total).toLocaleString()}€</td>
                    <td>
                      {order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1}
                    </td>
                    <td className="db-status">
                      {statusLabels[order.status] || order.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Mes adresses ── */}
      <div className="db-card">
        <p className="db-section-title">Mes adresses</p>

        <div className="db-addresses-grid">
          {addresses.length === 0 && (
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              Aucune adresse enregistrée.
            </p>
          )}

          {addresses.map((addr, i) => (
            <div className="db-address-block" key={i}>
              <div className="db-address-label">
                Adresse n°{i + 1}
                <Link href={`/dashboard/addresses?edit=${i}`} className="db-edit-icon" title="Modifier">
                  ✏️
                </Link>
              </div>
              <p className="db-address-text">
                {addr.firstName} {addr.lastName}<br />
                {addr.street}<br />
                {addr.zip} {addr.city}, {addr.country}
              </p>
            </div>
          ))}

          {/* Bouton ajouter */}
          <Link href="/dashboard/addresses?new=1" className="db-add-address">
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Ajouter une adresse
          </Link>
        </div>
      </div>

    </div>
  );
}
