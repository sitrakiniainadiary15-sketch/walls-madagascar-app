import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { customer, cartItems, total, payment, delivery } = body;

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

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { message: "Panier vide" },
        { status: 400 }
      );
    }

    const products = cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const order = await Order.create({
      customer: {
        firstname,
        lastname,
        email,
        phone,
        city,
        address,
      },
      products,
      total,
      payment: payment || "cash",
      delivery: delivery || "standard",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("ORDER API ERROR:", error);

    return NextResponse.json(
      {
        message: "Erreur serveur",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
