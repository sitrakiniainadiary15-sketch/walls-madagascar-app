import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { customer, cartItems, total, payment, delivery } = body;

    /* ======================
       VALIDATION CLIENT
    ====================== */
    if (!customer) {
      return NextResponse.json(
        { message: "Client manquant" },
        { status: 400 }
      );
    }

    const { firstname, lastname, email, city, address, phone } = customer;

    if (!firstname || !lastname || !email || !city || !address) {
      return NextResponse.json(
        { message: "Informations client manquantes" },
        { status: 400 }
      );
    }

    /* ======================
       VALIDATION PANIER
    ====================== */
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { message: "Panier vide" },
        { status: 400 }
      );
    }

    /* ======================
       FORMAT PRODUITS (IMPORTANT)
    ====================== */
    const products = cartItems.map((item) => {
      // 🔴 Empêche l’erreur "Cast to ObjectId failed"
      if (!mongoose.Types.ObjectId.isValid(item._id)) {
        throw new Error("ID produit invalide");
      }

      return {
        product: new mongoose.Types.ObjectId(item._id),
        quantity: Number(item.quantity) || 1,
      };
    });

    /* ======================
       CRÉATION COMMANDE
    ====================== */
    const order = await Order.create({
      customer: {
        firstname,
        lastname,
        email,
        phone: phone || "",
        city,
        address,
      },
      products,
      total: Number(total),
      payment: payment || "cash",
      delivery: delivery || "standard",
      status: "pending", // 🔥 IMPORTANT
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("ORDER API ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
