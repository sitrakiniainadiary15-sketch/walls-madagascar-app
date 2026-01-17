import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    // 📦 Récupérer les commandes par email de l'utilisateur connecté
    const orders = await Order.find({ 
      "customer.email": session.user.email 
    })
    .sort({ createdAt: -1 })
    .populate("products.product", "name price image");

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}