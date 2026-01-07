export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";
import Category from "@/app/models/Category";
import User from "@/app/models/User";

export async function GET() {
  try {
    await connectDB();

    const productsCount = await Product.countDocuments();
    const categoriesCount = await Category.countDocuments();
    const usersCount = await User.countDocuments();

    // Exemple simple de stats (mock logique)
    const chartData = [
      { name: "Produits", value: productsCount },
      { name: "Catégories", value: categoriesCount },
      { name: "Utilisateurs", value: usersCount },
    ];

    return NextResponse.json({
      productsCount,
      categoriesCount,
      usersCount,
      chartData,
    });

  } catch (error) {
    console.error("STATS ERROR:", error);
    return NextResponse.json(
      { message: "Erreur stats" },
      { status: 500 }
    );
  }
}
