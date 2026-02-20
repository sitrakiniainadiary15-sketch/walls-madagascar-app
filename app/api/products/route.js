// app/api/products/route.js
export const runtime = "nodejs";

import mongoose from "mongoose";
import "@/app/models/Category";

import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";
import { NextResponse } from "next/server";
import cloudinary from "@/app/lib/cloudinary";

/* =======================
   GET
======================= */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category && category !== "") filter.category = category;

    const total = await Product.countDocuments(filter).catch(() => 0);

    const products = await Product.find(filter)
      .populate({
        path: "category",
        select: "name",
        options: { strictPopulate: false },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error("❌ ERREUR GET:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/* =======================
   Supprimer de Cloudinary
======================= */
async function deleteFromCloudinary(publicIds) {
  for (const publicId of publicIds) {
    if (!publicId) continue;
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️ Image supprimée: ${publicId}`);
    } catch (error) {
      console.error(`❌ Erreur suppression: ${publicId}`, error);
    }
  }
}

/* =======================
   POST - Ajouter produit
   ✅ Reçoit du JSON (images déjà uploadées)
======================= */
export async function POST(req) {
  try {
    await connectDB();
    console.log("🟢 POST produit - DB connectée");

    // ✅ JSON au lieu de FormData
    const body = await req.json();
    console.log("🟢 Body reçu:", { name: body.name, images: body.images?.length });

    const {
      name, brand, size, condition, description,
      price, promoPrice, stock, category,
      images, image, imagePublicIds,
    } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Nom du produit obligatoire" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      brand: brand || "",
      size: size || "",
      condition: condition || "",
      description: description || "",
      price: Number(price) || 0,
      promoPrice: promoPrice || null,
      stock: Number(stock) || 0,
      category: category && category !== "null" && category !== ""
        ? category
        : undefined,
      images: images || [],
      image: image || images?.[0] || "",
      imagePublicIds: imagePublicIds || [],
      isAvailable: Number(stock) > 0,
    });

    console.log(`✅ Produit créé: ${product.name}`);
    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    console.error("❌ ERREUR POST:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/* =======================
   PUT - Modifier produit
   ✅ Reçoit du JSON (images déjà uploadées)
======================= */
export async function PUT(req) {
  try {
    await connectDB();

    // ✅ JSON au lieu de FormData
    const body = await req.json();
    const {
      _id, name, brand, size, condition, description,
      price, promoPrice, stock, category,
      images, image, imagePublicIds,
    } = body;

    if (!_id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const updateData = {
      name,
      brand: brand || "",
      size: size || "",
      condition: condition || "",
      description: description || "",
      price: Number(price) || 0,
      promoPrice: promoPrice || null,
      stock: Number(stock) || 0,
      category: category && category !== "null" && category !== ""
        ? category
        : undefined,
      images: images || [],
      image: image || images?.[0] || "",
      imagePublicIds: imagePublicIds || [],
      isAvailable: Number(stock) > 0,
    };

    const product = await Product.findByIdAndUpdate(_id, updateData, { new: true });

    if (!product) {
      return NextResponse.json({ message: "Produit introuvable" }, { status: 404 });
    }

    console.log(`✅ Produit modifié: ${product.name}`);
    return NextResponse.json({ product });

  } catch (error) {
    console.error("❌ ERREUR PUT:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/* =======================
   DELETE
======================= */
export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (product?.imagePublicIds?.length > 0) {
      await deleteFromCloudinary(product.imagePublicIds);
    }

    await Product.findByIdAndDelete(id);
    console.log(`🗑️ Produit supprimé: ${id}`);
    return NextResponse.json({ message: "Produit supprimé", success: true });

  } catch (error) {
    console.error("❌ ERREUR DELETE:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}