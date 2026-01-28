export const runtime = "nodejs";

import mongoose from "mongoose";
import "@/app/models/Category";

import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";


/* =======================
   GET
======================= */
export async function GET(req) {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB non connecté");
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "") {
      filter.category = category;
    }

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
    console.error("❌ ERREUR GET PRODUITS:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   ✅ Fonction helper pour uploader plusieurs images
======================= */
async function uploadImages(files) {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const imagePaths = [];

  for (const file of files) {
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, "-")}`;
      
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      imagePaths.push(`/uploads/${fileName}`);
    }
  }

  return imagePaths;
}

/* =======================
   POST - Ajouter produit
======================= */
export async function POST(req) {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB non connecté");
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const brand = formData.get("brand");
    const size = formData.get("size");
    const condition = formData.get("condition");
    const description = formData.get("description");

    const price = Number(formData.get("price")) || 0;
    // ✅ Après (retourne null si vide)
const promoPriceRaw = formData.get("promoPrice");
const promoPrice = promoPriceRaw && promoPriceRaw !== "" ? Number(promoPriceRaw) : null;
    const stock = Number(formData.get("stock")) || 0;

    const rawCategory = formData.get("category");

    if (!name) {
      return NextResponse.json(
        { message: "Nom du produit obligatoire" },
        { status: 400 }
      );
    }

    // ✅ Récupérer TOUTES les images (getAll au lieu de get)
    const files = formData.getAll("images");
    const imagePaths = await uploadImages(files);

    const product = await Product.create({
      name,
      brand,
      size,
      condition,
      description,
      price,
      promoPrice,
      stock,
      category:
        rawCategory && rawCategory !== "null" && rawCategory !== ""
          ? rawCategory
          : undefined,
      // ✅ Stocker le tableau d'images
      images: imagePaths,
      // ✅ Garder "image" pour rétrocompatibilité (première image)
      image: imagePaths[0] || "",
      isAvailable: stock > 0,
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    console.error("❌ ERREUR POST PRODUIT:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   PUT - Modifier produit
======================= */
export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const _id = formData.get("_id");

    if (!_id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    // ✅ Récupérer les images existantes à conserver
    const existingImagesRaw = formData.get("existingImages");
    let existingImages = [];
    
    try {
      existingImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
    } catch (e) {
      existingImages = [];
    }

    // ✅ Récupérer et uploader les nouvelles images
    const newFiles = formData.getAll("images");
    const newImagePaths = await uploadImages(newFiles);

    // ✅ Fusionner : images existantes + nouvelles images
    const allImages = [...existingImages, ...newImagePaths];

    const updateData = {
      name: formData.get("name"),
      brand: formData.get("brand"),
      size: formData.get("size"),
      condition: formData.get("condition"),
      description: formData.get("description"),
      price: Number(formData.get("price")) || 0,
      promoPrice: Number(formData.get("promoPrice")) || null,
      stock: Number(formData.get("stock")) || 0,
      category: formData.get("category") || null,
      // ✅ Mettre à jour le tableau d'images
      images: allImages,
      image: allImages[0] || "",
      isAvailable: Number(formData.get("stock")) > 0,
    };

    const product = await Product.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ product });

  } catch (error) {
    console.error("ERREUR PUT:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
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

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Produit supprimé" });

  } catch (error) {
    console.error("PRODUCT API ERROR 👉", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}