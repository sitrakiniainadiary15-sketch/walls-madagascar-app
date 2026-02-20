export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import Customer from "@/app/models/Customer";
import Product from "@/app/models/Product";

export async function GET(request) {
  try {
    await connectDB();

    // 📅 Récupérer le paramètre de période (default: 7 jours)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7"; // 1, 7, 30, 365

    const daysAgo = parseInt(period);
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - daysAgo);
    periodStart.setHours(0, 0, 0, 0);

    /* 👥 Clients */
    const customersCount = await Customer.countDocuments();
    
    // Nouveaux clients sur la période
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: periodStart },
    });

    /* 📦 Commandes */
    const ordersCount = await Order.countDocuments();

    // Commandes sur la période
    const periodOrders = await Order.countDocuments({
      createdAt: { $gte: periodStart },
    });

    /* 💰 Chiffre d'affaires TOTAL */
    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    /* 💰 CA sur la période */
    const periodRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const periodRevenue = periodRevenueAgg.length > 0 ? periodRevenueAgg[0].total : 0;

    /* 🛒 Panier moyen */
    const averageBasket = ordersCount > 0 ? (totalRevenue / ordersCount).toFixed(2) : 0;

    /* 📅 Commandes aujourd'hui */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    /* 📊 Évolution des ventes (7 derniers jours) */
    const salesEvolution = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dayStart, $lte: dayEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]);

      const dayOrders = await Order.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      salesEvolution.push({
        date: dayStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        revenue: dayRevenue.length > 0 ? dayRevenue[0].total : 0,
        orders: dayOrders,
      });
    }

    /* 🏆 Top 5 produits les plus vendus */
    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          name: "$productDetails.name",
          quantity: "$totalQuantity",
          image: "$productDetails.image",
        },
      },
    ]);

    /* 📋 5 dernières commandes */
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("customer.firstname customer.lastname total status createdAt")
      .lean();

    /* ⚠️ Alertes */
    // Produits en rupture de stock
    const lowStockProducts = await Product.countDocuments({
      stock: { $lt: 5 },
      isAvailable: true,
    });

    // Commandes en attente
    const pendingOrders = await Order.countDocuments({
      status: "pending",
    });

    /* 📊 Répartition des commandes par statut */
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusDistribution = ordersByStatus.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    /* 📊 Données pour graphique principal */
    const chartData = [
      { name: "Clients", value: customersCount },
      { name: "Commandes", value: ordersCount },
      { name: "CA (€)", value: Math.round(totalRevenue) },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        customersCount,
        newCustomers,
        ordersCount,
        periodOrders,
        totalRevenue: totalRevenue.toFixed(2),
        periodRevenue: periodRevenue.toFixed(2),
        averageBasket,
        todayOrders,
        lowStockProducts,
        pendingOrders,
      },
      salesEvolution,
      topProducts,
      recentOrders,
      statusDistribution,
      chartData,
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur stats",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
