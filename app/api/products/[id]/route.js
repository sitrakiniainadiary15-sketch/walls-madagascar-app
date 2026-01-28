// app/api/products/[id]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";
import "@/app/models/Category";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // ✅ Next.js 16 : params doit être await
    const { id } = await params;

    console.log("🔍 Recherche produit ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID manquant" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate({
        path: "category",
        select: "name slug",
        options: { strictPopulate: false },
      })
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produit non trouvé" },
        { status: 404 }
      );
    }

    console.log("✅ Produit trouvé:", product.name);

    return NextResponse.json({ 
      success: true, 
      product 
    });

  } catch (error) {
    console.error("❌ ERREUR:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}