"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);

        if (!res.ok) {
          router.push("/admin/orders");
          return;
        }

        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error("FETCH ORDER ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (loading) {
    return <p style={{ padding: 30 }}>Chargement...</p>;
  }

  if (!order) {
    return <p style={{ padding: 30 }}>Commande introuvable</p>;
  }

  const customer = order.customer || {};

  return (
    <div style={{ padding: 30 }}>
      <button onClick={() => router.back()}>⬅ Retour</button>

      <h1>🧾 Commande #{order._id}</h1>

      <h3>👤 Client</h3>
      <p>
        {customer.firstname} {customer.lastname}
      </p>
      <p>Email : {customer.email || "—"}</p>
      <p>Téléphone : {customer.phone || "—"}</p>

      <h3>📍 Adresse</h3>
      <p>{customer.address || "—"}</p>
      <p>{customer.city || "—"}</p>

      <h3>💰 Paiement</h3>
      <p>{order.payment}</p>

      <h3>📦 Statut</h3>
      <p>{order.status}</p>

      <h3>💵 Total</h3>
      <p>{order.total} Ar</p>

      <h3>📅 Date</h3>
      <p>
        {order.createdAt
          ? new Date(order.createdAt).toLocaleString("fr-FR")
          : "—"}
      </p>
    </div>
  );
}
