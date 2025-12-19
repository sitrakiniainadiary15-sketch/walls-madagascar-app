import { connectDB } from "@/app/lib/db";
import Category from "@/app/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const categories = await Category.find();
  return NextResponse.json(categories);
}

export async function POST(req) {
  try {
    await connectDB();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Nom requis" }, { status: 400 });
    }

    const category = await Category.create({ name });

    return NextResponse.json({
      message: "Catégorie ajoutée avec succès",
      category,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
 