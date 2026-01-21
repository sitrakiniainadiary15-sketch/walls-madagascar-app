// app/api/admin/orders/[id]/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import { sendEmail } from "@/app/lib/mailer";

// ✅ GET - Récupérer les détails d'une commande

// ✅ AJOUTER CETTE FONCTION GET
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const order = await Order.findById(id).populate("products.product");

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// ✅ PATCH - Mettre à jour le statut (votre code existant)
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const { status } = await req.json();

    const allowedStatus = [
      "pending",
      "confirmed",
      "processing",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return NextResponse.json({ message: "Statut invalide" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    /* ======================
       📧 EMAIL AU CLIENT
    ====================== */
    const statusLabels = {
      pending: { label: "En attente", icon: "⏳", color: "#f59e0b" },
      confirmed: { label: "Confirmée", icon: "✔️", color: "#3b82f6" },
      processing: { label: "En préparation", icon: "📦", color: "#8b5cf6" },
      paid: { label: "Payée", icon: "💰", color: "#10b981" },
      shipped: { label: "Expédiée", icon: "🚚", color: "#06b6d4" },
      delivered: { label: "Livrée", icon: "✅", color: "#22c55e" },
      cancelled: { label: "Annulée", icon: "❌", color: "#ef4444" },
    };

    const statusInfo = statusLabels[status];
    const orderNumber = order._id.toString().slice(-8).toUpperCase();

    const statusMessages = {
      pending: "Votre commande est en attente de traitement.",
      confirmed: "Bonne nouvelle ! Votre commande a été confirmée.",
      processing: "Votre commande est en cours de préparation.",
      paid: "Votre paiement a été reçu. Merci !",
      shipped: "Votre commande a été expédiée ! Elle arrivera bientôt.",
      delivered: "Votre commande a été livrée. Merci pour votre achat !",
      cancelled: "Votre commande a été annulée. Contactez-nous pour plus d'informations.",
    };

    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="background: ${statusInfo.color}; color: white; padding: 20px; text-align: center;">
          ${statusInfo.icon} Mise à jour de votre commande
        </h1>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb;">
          <p>Bonjour <strong>${order.customer?.firstname || "Client"}</strong>,</p>
          
          <p>${statusMessages[status]}</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #6b7280;">Commande #${orderNumber}</p>
            <h2 style="margin: 10px 0; color: ${statusInfo.color};">
              ${statusInfo.icon} ${statusInfo.label}
            </h2>
          </div>
          
          <h3>📋 Récapitulatif</h3>
          <p><strong>📍 Adresse de livraison :</strong><br/>${order.customer?.address}, ${order.customer?.city}</p>
          <p><strong>💰 Total :</strong> ${order.total?.toLocaleString()} Ar</p>
          
          <hr style="margin: 20px 0;" />
          
          <p style="color: #6b7280; font-size: 14px;">
            Si vous avez des questions, n'hésitez pas à nous contacter.
          </p>
          
          <p>Merci de votre confiance !</p>
        </div>
        
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `;

    if (order.customer?.email) {
      await sendEmail({
        to: order.customer.email,
        subject: `${statusInfo.icon} Commande #${orderNumber} - ${statusInfo.label}`,
        html: clientEmailHtml,
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH ORDER ERROR:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// ✅ DELETE - Supprimer une commande
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    // ⚠️ Empêcher la suppression de commandes payées ou expédiées
    const protectedStatus = ["paid", "shipped", "delivered"];
    if (protectedStatus.includes(order.status)) {
      return NextResponse.json(
        { message: `Impossible de supprimer une commande ${order.status}` },
        { status: 400 }
      );
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}