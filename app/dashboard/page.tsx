import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import UserOrdersClient from "./UserOrdersClient";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // 🔐 Si admin → Dashboard admin
  if (session.user.role === "admin") {
    return (
      <div style={{ padding: 30 }}>
        <h1>Dashboard ADMIN ✅</h1>
        <a href="/admin/orders">📦 Gérer les commandes</a>
      </div>
    );
  }

  // 👤 Si user → Récupérer ses commandes
  await connectDB();
  
  const orders = await Order.find({ 
    "customer.email": session.user.email 
  })
  .sort({ createdAt: -1 })
  .populate("products.product", "name price image")
  .lean();

  // Convertir les ObjectId en strings pour le client
  const ordersData = JSON.parse(JSON.stringify(orders));

  return (
    <div style={{ padding: 30 }}>
      <h1>👤 Mon Compte</h1>
      <p>Bienvenue, <strong>{session.user.name}</strong> !</p>
      
      <UserOrdersClient orders={ordersData} />
    </div>
  );
}