import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Customer from "@/app/models/Customer";
import Order from "@/app/models/Order";

// GET - Détails d'un client
export async function GET(req, { params }) {
  try {
    await connectDB();

    // ✅ Correction Next.js 15 : On attend que params soit résolu
    const resolvedParams = await params;
    const id = resolvedParams.id;

    console.log("Recherche du client avec l'ID:", id);

    const customer = await Customer.findById(id);

    if (!customer) {
      console.log("❌ Client non trouvé en base de données");
      return NextResponse.json(
        { success: false, message: "Client non trouvé dans la base" },
        { status: 404 }
      );
    }

    // Récupérer les commandes du client par son email
    const orders = await Order.find({ "customer.email": customer.email })
      .sort({ createdAt: -1 })
      .populate("products.product");

    console.log(`✅ Client trouvé : ${customer.firstname} - ${orders.length} commande(s)`);

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

    const { id } = await params; // ✅ Correction ici aussi
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

// DELETE - Supprimer ou Anonymiser un client
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params; // ✅ Correction ici aussi
    
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Client non trouvé" },
        { status: 404 }
      );
    }

    const ordersCount = await Order.countDocuments({
      "customer.email": customer.email,
    });

    if (ordersCount === 0) {
      await Customer.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: "Client supprimé avec succès",
        action: "deleted",
      });
    }

    if (action === "anonymize") {
      const anonymizedEmail = `deleted_${id}@anonymized.local`;
      const anonymizedData = {
        firstname: "Client",
        lastname: `Anonyme #${id.toString().slice(-6).toUpperCase()}`,
        email: anonymizedEmail,
        phone: null,
        city: null,
        address: null,
        notes: `[ANONYMISÉ le ${new Date().toLocaleDateString("fr-FR")}] ${customer.notes || ""}`,
        status: "deleted",
        deletedAt: new Date(),
      };

      await Customer.findByIdAndUpdate(id, { $set: anonymizedData });

      await Order.updateMany(
        { "customer.email": customer.email },
        { 
          $set: { 
            "customer.firstname": anonymizedData.firstname,
            "customer.lastname": anonymizedData.lastname,
            "customer.email": anonymizedEmail,
            "customer.phone": "[ANONYMISÉ]",
            "customer.isAnonymized": true,
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: `Client anonymisé avec succès.`,
        action: "anonymized",
        ordersCount,
      });
    }

    return NextResponse.json({
      success: false,
      message: `Action requise pour ce client avec commandes.`,
      ordersCount,
    }, { status: 400 });

  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}