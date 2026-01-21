export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import Customer from "@/app/models/Customer";

export async function GET() {
  try {
    await connectDB();

    /* 👥 Clients */
    const customersCount = await Customer.countDocuments();

    /* 📦 Commandes */
    const ordersCount = await Order.countDocuments();

    /* 💰 Chiffre d'affaires */
    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    /* 📅 Commandes aujourd’hui */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    /* 📊 Données pour graphique */
    const chartData = [
      { name: "Clients", value: customersCount },
      { name: "Commandes", value: ordersCount },
      { name: "Chiffre d'affaires", value: totalRevenue },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        customersCount,
        ordersCount,
        totalRevenue,
        todayOrders,
      },
      chartData,
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur stats",
      },
      { status: 500 }
    );
  }
}
