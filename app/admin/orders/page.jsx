"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");

        if (!res.ok) {
          router.push("/admin/unauthorized");
          return;
        }

        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("FETCH ORDERS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erreur lors du changement de statut");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === data._id ? data : order
        )
      );
    } catch (error) {
      console.error("UPDATE STATUS ERROR:", error);
      alert("Erreur serveur");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: 30 }}>Chargement des commandes...</p>;
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>📦 Commandes</h1>

      {orders.length === 0 ? (
        <p>Aucune commande enregistrée</p>
      ) : (
        <table width="100%" cellPadding="10" style={{ background: "white" }}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Ville</th>
              <th>Total</th>
              <th>Paiement</th>
              <th>Action</th>
              <th>Statut</th>
              <th>date</th>

            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const customer = order.customer || {};

              return (
                <tr key={order._id}>
                  <td>{customer.firstname} {customer.lastname}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>{customer.address || "—"}</td>
                  <td>{customer.city}</td>
                  <td><strong>{order.total} Ar</strong></td>

                  <td>
                    {order.payment === "cash" && "💵 Espèces"}
                    {order.payment === "mobile_money" && "📱 Mobile Money"}
                    {order.payment === "card" && "💳 Carte"}
                    {order.payment === "bank_transfer" && "🏦 Virement"}

                  </td>
                  <td>
  <button
    onClick={() => router.push(`/admin/orders/${order._id}`)}
  >
    Voir
  </button>
</td>


                  <td>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                    >
                      <option value="pending">⏳ En attente</option>
                      <option value="confirmed">✔️ Confirmée</option>
                      <option value="processing">📦 En préparation</option>
                      <option value="paid">💰 Payée</option>
                      <option value="shipped">🚚 Expédiée</option>
                      <option value="delivered">✅ Livrée</option>
                      <option value="cancelled">❌ Annulée</option>
                    </select>
                  </td>

                  <td>
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
