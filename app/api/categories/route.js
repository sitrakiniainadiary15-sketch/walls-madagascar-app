import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Category from "@/app/models/Category";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    await connectDB();

    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET categories error:", err);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 🔒 ADMIN ONLY
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { message: "Nom requis" },
        { status: 400 }
      );
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return NextResponse.json(
        { message: "Catégorie existe déjà" },
        { status: 400 }
      );
    }

    const category = await Category.create({ name });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("POST category error:", err);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
