import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";
import { NextResponse } from "next/server";

/* =======================
   GET : afficher produits
   ======================= */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const products = category
      ? await Product.find({ category }).populate("category")
      : await Product.find().populate("category");

    return NextResponse.json(products);

  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   POST : ajouter produit
   ======================= */
export async function POST(req) {
  try {
    await connectDB();

    const { name, price, stock, category } = await req.json();

    if (!name || !price || !category) {
      return NextResponse.json(
        { message: "Champs manquants" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      price,
      stock,
      category,
    });

    return NextResponse.json({
      message: "Produit ajouté avec succès",
      product,
    });

  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
