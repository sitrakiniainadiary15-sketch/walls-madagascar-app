// app/admin/customers/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import "./customer-detail.css";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();

      if (data.success) {
        setCustomer(data.customer);
        setOrders(data.orders || []);
        setFormData(data.customer);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setCustomer(formData);
        setEditing(false);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const statusLabels = {
    pending: "⏳ En attente",
    confirmed: "✅ Confirmée",
    processing: "🔄 En cours",
    paid: "💳 Payée",
    shipped: "🚚 Expédiée",
    delivered: "📦 Livrée",
    cancelled: "❌ Annulée",
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!customer) {
    return <div className="error">Client non trouvé</div>;
  }

  return (
    <div className="customer-detail-page">
      <div className="page-header">
        <Link href="/admin/customers" className="back-btn">
          <i className="ri-arrow-left-line"></i> Retour
        </Link>
        <h1>👤 {customer.firstname} {customer.lastname}</h1>
      </div>

      <div className="detail-grid">
        {/* Infos client */}
        <div className="card info-card">
          <div className="card-header">
            <h2>Informations</h2>
            <button onClick={() => setEditing(!editing)}>
              {editing ? "Annuler" : "✏️ Modifier"}
            </button>
          </div>

          {editing ? (
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <button className="save-btn" onClick={handleSave}>
                💾 Enregistrer
              </button>
            </div>
          ) : (
            <div className="info-list">
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">{customer.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Téléphone</span>
                <span className="value">{customer.phone || "-"}</span>
              </div>
              <div className="info-item">
                <span className="label">Ville</span>
                <span className="value">{customer.city || "-"}</span>
              </div>
              <div className="info-item">
                <span className="label">Adresse</span>
                <span className="value">{customer.address || "-"}</span>
              </div>
              <div className="info-item">
                <span className="label">Statut</span>
                <span className={`status ${customer.status}`}>
                  {customer.status === "active" ? "✅ Actif" : "🚫 Bloqué"}
                </span>
              </div>
              {customer.notes && (
                <div className="info-item notes">
                  <span className="label">Notes</span>
                  <span className="value">{customer.notes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="card stats-card">
          <h2>📊 Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{customer.totalOrders}</span>
              <span className="stat-label">Commandes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{customer.totalSpent?.toLocaleString()} Ar</span>
              <span className="stat-label">Total dépensé</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {customer.totalOrders > 0 
                  ? Math.round(customer.totalSpent / customer.totalOrders).toLocaleString() 
                  : 0} Ar
              </span>
              <span className="stat-label">Panier moyen</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {customer.lastOrderAt 
                  ? new Date(customer.lastOrderAt).toLocaleDateString("fr-FR") 
                  : "-"}
              </span>
              <span className="stat-label">Dernière commande</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historique commandes */}
      <div className="card orders-card">
        <h2>📦 Historique des commandes ({orders.length})</h2>
        
        {orders.length === 0 ? (
          <p className="empty">Aucune commande</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Date</th>
                <th>Produits</th>
                <th>Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">
                    #{order._id.toString().slice(-8).toUpperCase()}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td>{order.products?.length || 0} produit(s)</td>
                  <td className="order-total">{order.total?.toLocaleString()} Ar</td>
                  <td>
                    <span className={`order-status ${order.status}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
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