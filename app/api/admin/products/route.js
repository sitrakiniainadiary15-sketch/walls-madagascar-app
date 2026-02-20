


export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Récupérer tous les produits
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    // Paramètres de filtrage
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // low, out, all
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt"; // stock, price, name, createdAt
    const order = searchParams.get("order") || "desc"; // asc, desc

    // Construction de la query
    let query = {};

    // Filtre par stock
    if (filter === "out") {
      query.stock = 0;
    } else if (filter === "low") {
      query.stock = { $gt: 0, $lt: 5 };
    }

    // Recherche par nom
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Tri
    const sortOptions = {};
    sortOptions[sort] = order === "asc" ? 1 : -1;

    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sortOptions)
      .lean();

    // Stats rapides
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 5 } });

    return NextResponse.json({
      success: true,
      products,
      stats: {
        total: totalProducts,
        outOfStock,
        lowStock,
      },
    });
  } catch (error) {
    console.error("PRODUCTS GET ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des produits",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - Modifier un produit (notamment le stock)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    const { productId, updates } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "ID produit manquant" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produit mis à jour",
      product,
    });
  } catch (error) {
    console.error("PRODUCT PATCH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la mise à jour",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "ID produit manquant" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produit supprimé",
    });
  } catch (error) {
    console.error("PRODUCT DELETE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la suppression",
        error: error.message,
      },
      { status: 500 }
    );
  }
}