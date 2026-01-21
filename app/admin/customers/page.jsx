// app/admin/customers/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./customers.css";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Charger les clients
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [statusFilter]);

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Synchroniser depuis les commandes
  const syncFromOrders = async () => {
    if (!window.confirm("Synchroniser les clients depuis les commandes existantes ?")) {
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        loadCustomers();
      }
    } catch (error) {
      console.error("Erreur sync:", error);
    } finally {
      setSyncing(false);
    }
  };

  // Bloquer/Débloquer client
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadCustomers();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Supprimer client
  const deleteCustomer = async (id, name) => {
    if (!window.confirm(`Supprimer le client "${name}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadCustomers();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div>
          <h1>👥 Gestion des Clients</h1>
          <p>{customers.length} client(s) trouvé(s)</p>
        </div>
        <button 
          className="sync-btn" 
          onClick={syncFromOrders}
          disabled={syncing}
        >
          {syncing ? "⏳ Synchronisation..." : "🔄 Sync depuis commandes"}
        </button>
      </div>

      {/* Filtres */}
      <div className="customers-filters">
        <div className="search-box">
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="active">✅ Actifs</option>
          <option value="blocked">🚫 Bloqués</option>
        </select>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="loading">Chargement...</div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <p>Aucun client trouvé</p>
          <button onClick={syncFromOrders} disabled={syncing}>
            🔄 Importer depuis les commandes
          </button>
        </div>
      ) : (
        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Ville</th>
                <th>Commandes</th>
                <th>Total dépensé</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td className="customer-name">
                    <div className="avatar">
                      {customer.firstname?.charAt(0)}{customer.lastname?.charAt(0)}
                    </div>
                    <div>
                      <strong>{customer.firstname} {customer.lastname}</strong>
                      <small>Inscrit le {new Date(customer.createdAt).toLocaleDateString("fr-FR")}</small>
                    </div>
                  </td>
                  <td className="customer-contact">
                    <div><i className="ri-mail-line"></i> {customer.email}</div>
                    {customer.phone && (
                      <div><i className="ri-phone-line"></i> {customer.phone}</div>
                    )}
                  </td>
                  <td>{customer.city || "-"}</td>
                  <td className="orders-count">
                    <span className="badge">{customer.totalOrders}</span>
                  </td>
                  <td className="total-spent">
                    {customer.totalSpent?.toLocaleString() || 0} Ar
                  </td>
                  <td>
                    <span className={`status ${customer.status}`}>
                      {customer.status === "active" ? "✅ Actif" : "🚫 Bloqué"}
                    </span>
                  </td>
                  <td className="actions">
                    <Link 
                      href={`/admin/customers/${customer._id}`}
                      className="btn-view"
                      title="Voir détails"
                    >
                      <i className="ri-eye-line"></i>
                    </Link>
                    <button
                      className={`btn-toggle ${customer.status}`}
                      onClick={() => toggleStatus(customer._id, customer.status)}
                      title={customer.status === "active" ? "Bloquer" : "Débloquer"}
                    >
                      {customer.status === "active" ? (
                        <i className="ri-forbid-line"></i>
                      ) : (
                        <i className="ri-check-line"></i>
                      )}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteCustomer(customer._id, `${customer.firstname} ${customer.lastname}`)}
                      title="Supprimer"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}