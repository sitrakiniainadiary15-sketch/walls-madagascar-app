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
  const [saving, setSaving] = useState(false);
  
  // ✅ Nouvel état pour gérer le chargement de l'envoi d'email
  const [sendingEmail, setSendingEmail] = useState(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const [modal, setModal] = useState({ show: false, type: "", data: null });
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    loadCustomer();
  }, [id]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const loadCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();

      if (data.success) {
        setCustomer(data.customer);
        setOrders(data.orders || []);
        setFormData({
          firstname: data.customer.firstname || "",
          lastname: data.customer.lastname || "",
          email: data.customer.email || "",
          phone: data.customer.phone || "",
          city: data.customer.city || "",
          address: data.customer.address || "",
          notes: data.customer.notes || "",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      showToast("error", "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FONCTION POUR RENVOYER L'EMAIL
  const handleResendEmail = async (orderId) => {
    setSendingEmail(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-email`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", "Email de facture renvoyé !");
      } else {
        showToast("error", "Erreur: " + data.message);
      }
    } catch (error) {
      showToast("error", "Impossible de contacter le serveur");
    } finally {
      setSendingEmail(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        setEditing(false);
        showToast("success", "Client mis à jour !");
      }
    } catch (error) {
      showToast("error", "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const confirmToggleStatus = async (newStatus) => {
    setModal({ show: false, type: "", data: null });
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        showToast("success", `Client ${newStatus === "blocked" ? "bloqué" : "débloqué"} !`);
      }
    } catch (error) {
      showToast("error", "Erreur de mise à jour");
    }
  };

  const toggleStatus = () => {
    const newStatus = customer.status === "active" ? "blocked" : "active";
    const action = newStatus === "blocked" ? "bloquer" : "débloquer";
    setModal({
      show: true,
      type: "confirm",
      data: {
        title: `${newStatus === "blocked" ? "🚫" : "✅"} ${action} ?`,
        message: `Voulez-vous vraiment ${action} ${customer.firstname} ?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        confirmClass: newStatus === "blocked" ? "warning" : "success",
        onConfirm: () => confirmToggleStatus(newStatus),
      },
    });
  };

  const handleDelete = () => {
    if (orders.length > 0) {
      setModal({
        show: true,
        type: "anonymize",
        data: { ordersCount: orders.length, customerName: `${customer.firstname} ${customer.lastname}` },
      });
    } else {
      setModal({
        show: true,
        type: "confirm",
        data: {
          title: "🗑️ Supprimer ?",
          message: "Action irréversible.",
          confirmText: "Supprimer",
          confirmClass: "danger",
          onConfirm: () => confirmDelete("delete"),
        },
      });
    }
  };

  const confirmDelete = async (action) => {
    setModal({ show: false, type: "", data: null });
    try {
      const res = await fetch(`/api/customers/${id}?action=${action}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Action effectuée");
        setTimeout(() => router.push("/admin/customers"), 1500);
      }
    } catch (error) {
      showToast("error", "Erreur suppression");
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

  if (loading) return <div className="loading">Chargement...</div>;
  if (!customer) return <div className="error">Client non trouvé</div>;

  const isAnonymized = customer.status === "deleted";

  return (
    <div className="customer-detail-page">
      {/* TOAST & MODAL (Inchangés) */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modal.type === "confirm" ? (
              <>
                <h3>{modal.data.title}</h3>
                <p>{modal.data.message}</p>
                <div className="modal-actions">
                  <button onClick={() => setModal({ show: false })}>Annuler</button>
                  <button className={modal.data.confirmClass} onClick={modal.data.onConfirm}>{modal.data.confirmText}</button>
                </div>
              </>
            ) : (
              <>
                <h3>Client avec commandes</h3>
                <p>Anonymisation recommandée pour le RGPD.</p>
                <button className="warning" onClick={() => confirmDelete("anonymize")}>🔒 Anonymiser</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="page-header">
        <div className="header-left">
          <Link href="/admin/customers" className="back-btn">← Retour</Link>
          <h1>{customer.firstname} {customer.lastname}</h1>
        </div>
        {!isAnonymized && (
          <div className="header-actions">
            <button className={`action-btn ${customer.status}`} onClick={toggleStatus}>
              {customer.status === "active" ? "🚫 Bloquer" : "✅ Débloquer"}
            </button>
            <button className="action-btn delete-btn" onClick={handleDelete}>🗑️ Supprimer</button>
          </div>
        )}
      </div>

      {/* INFO & STATS CARDS */}
      <div className="detail-grid">
        <div className="card info-card">
          <h2>📋 Informations</h2>
          <div className="info-list">
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Tel:</strong> {customer.phone || "-"}</p>
          </div>
        </div>
        <div className="card stats-card">
          <h2>📊 Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-item"><b>{customer.totalOrders || 0}</b> Commandes</div>
            <div className="stat-item"><b>{(customer.totalSpent || 0).toLocaleString()} Ar</b> Total</div>
          </div>
        </div>
      </div>

      {/* HISTORIQUE COMMANDES */}
      <div className="card orders-card">
        <h2>📦 Historique des commandes</h2>
        {orders.length === 0 ? <p>Aucune commande</p> : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Date</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-8).toUpperCase()}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td>{order.total.toLocaleString()} Ar</td>
                  <td><span className={`order-status ${order.status}`}>{statusLabels[order.status]}</span></td>
                  <td className="actions-cell">
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Link href={`/admin/orders/${order._id}`} className="view-link">Voir →</Link>
                        
                        {/* BOUTON RENVOI EMAIL */}
                        <button 
                          onClick={() => handleResendEmail(order._id)}
                          disabled={sendingEmail === order._id}
                          className="email-resend-btn"
                          title="Renvoyer la facture par email"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: sendingEmail === order._id ? "not-allowed" : "pointer",
                            fontSize: "1.2rem",
                            opacity: sendingEmail === order._id ? 0.5 : 1
                          }}
                        >
                          {sendingEmail === order._id ? "⏳" : "📧"}
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