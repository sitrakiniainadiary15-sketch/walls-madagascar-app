import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 🔐 PROTECTION ADMIN
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Accès refusé" },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find()
      .populate("products.product")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
