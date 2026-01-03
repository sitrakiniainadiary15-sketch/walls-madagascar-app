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
   PUT
======================= */
export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const _id = formData.get("_id");

    if (!_id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const updateData = {
      name: formData.get("name"),
      price: Number(formData.get("price")) || 0,
      stock: Number(formData.get("stock")) || 0,
      category: formData.get("category") || null,
    };

    const file = formData.get("image");

    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      updateData.image = `/uploads/${fileName}`;
    }

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
