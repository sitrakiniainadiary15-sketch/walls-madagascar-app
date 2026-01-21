// app/api/customers/[id]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Customer from "@/app/models/Customer";
import Order from "@/app/models/Order";

// GET - Détails d'un client
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les commandes du client
    const orders = await Order.find({ "customer.email": customer.email })
      .sort({ createdAt: -1 })
      .populate("products.product");

    return NextResponse.json({
      success: true,
      customer,
      orders,
    });

  } catch (error) {
    console.error("GET CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Modifier un client
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await req.json();

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Client non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Client mis à jour",
      customer,
    });

  } catch (error) {
    console.error("PUT CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un client
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // 1️⃣ Vérifier si le client existe
    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Client non trouvé" },
        { status: 404 }
      );
    }

    // 2️⃣ Vérifier s'il a des commandes
    const ordersCount = await Order.countDocuments({
      "customer.email": customer.email,
    });

    // ❌ Interdire la suppression si commandes existantes
    if (ordersCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ce client a déjà des commandes. Vous pouvez le bloquer mais pas le supprimer.",
        },
        { status: 400 }
      );
    }

    // 3️⃣ Supprimer le client (aucune commande)
    await Customer.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Client supprimé avec succès",
    });

  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
