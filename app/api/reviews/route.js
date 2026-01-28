import { connectDB } from "@/app/lib/db";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return new Response(JSON.stringify({ error: "productId manquant" }), { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    const reviews = await db
      .collection("reviews")
      .find({ productId })
      .sort({ date: -1 })
      .toArray();

    return new Response(JSON.stringify(reviews), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { productId, name, rating, comment } = body;

    if (!productId || !name || !comment || !rating) {
      return new Response(JSON.stringify({ error: "Informations manquantes" }), { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;

    const newReview = {
      productId,
      name,
      rating,
      comment,
      date: new Date(),
    };

    await db.collection("reviews").insertOne(newReview);

    return new Response(JSON.stringify(newReview), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}