"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");

        if (!res.ok) {
          router.push("/admin/unauthorized");
          return;
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : [];

        setOrders(data);
      } catch (error) {
        console.error("FETCH ORDERS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (loading) {
    return <p style={{ padding: 30 }}>Chargement des commandes...</p>;
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>📦 Commandes</h1>

      {orders.length === 0 ? (
        <p>Aucune commande enregistrée</p>
      ) : (
        <table width="100%" border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Ville</th>
              <th>Total</th>
              <th>Paiement</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const customer = order.customer || {};

              const fullName =
                customer.firstname && customer.lastname
                  ? `${customer.firstname} ${customer.lastname}`
                  : customer.name || "—";

              return (
                <tr key={order._id}>
                  <td>{fullName}</td>
                  <td>{customer.email || "—"}</td>
                  <td>{customer.city || "—"}</td>
                  <td>{order.total} Ar</td>
                  <td>{order.payment}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "—"}
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
