import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import { sendEmail } from "@/app/lib/mailer";

export async function POST(req) {
  console.log("🚀 API /api/order APPELÉE");
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
      status: "pending",
    });

    /* ======================
       📧 EMAIL À L'ADMIN
    ====================== */
    const paymentLabels = {
      cash: "💵 Espèces à la livraison",
      mobile_money: "📱 Mobile Money",
      card: "💳 Carte bancaire",
      bank_transfer: "🏦 Virement bancaire",
    };

    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          🛒 Nouvelle Commande !
        </h1>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb;">
          <h2>📋 Détails de la commande</h2>
          <p><strong>Numéro :</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
          
          <hr style="margin: 20px 0;" />
          
          <h3>👤 Client</h3>
          <p><strong>Nom :</strong> ${firstname} ${lastname}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${phone || "Non renseigné"}</p>
          <p><strong>Adresse :</strong> ${address}, ${city}</p>
          
          <hr style="margin: 20px 0;" />
          
          <h3>📦 Produits commandés</h3>
          <ul>
            ${cartItems.map(item => `
              <li>${item.name || "Produit"} x${item.quantity}</li>
            `).join("")}
          </ul>
          
          <hr style="margin: 20px 0;" />
          
          <p><strong>💳 Paiement :</strong> ${paymentLabels[payment] || payment}</p>
          
          <h2 style="color: #059669; text-align: right;">
            Total : ${Number(total).toLocaleString()} Ar
          </h2>
        </div>
        
        <p style="text-align: center; color: #6b7280; margin-top: 20px;">
          Connectez-vous au dashboard admin pour gérer cette commande.
        </p>
      </div>
    `;
const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

console.log("📧 ADMIN EMAIL:", adminEmail);

await sendEmail({
  to: adminEmail,
  subject: `🛒 Nouvelle commande #${order._id.toString().slice(-8).toUpperCase()}`,
  html: adminEmailHtml,
});


    /* ======================
       📧 EMAIL AU CLIENT (Confirmation)
    ====================== */
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="background: #22c55e; color: white; padding: 20px; text-align: center;">
          ✅ Commande Confirmée !
        </h1>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb;">
          <p>Bonjour <strong>${firstname}</strong>,</p>
          
          <p>Merci pour votre commande ! Nous l'avons bien reçue et elle est en cours de traitement.</p>
          
          <h3>📋 Récapitulatif</h3>
          <p><strong>Numéro de commande :</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          
          <ul>
            ${cartItems.map(item => `
              <li>${item.name || "Produit"} x${item.quantity}</li>
            `).join("")}
          </ul>
          
          <p><strong>💳 Paiement :</strong> ${paymentLabels[payment] || payment}</p>
          <p><strong>📍 Livraison :</strong> ${address}, ${city}</p>
          
          <h2 style="color: #059669;">Total : ${Number(total).toLocaleString()} Ar</h2>
          
          <hr style="margin: 20px 0;" />
          
          <p>Vous recevrez un email lorsque le statut de votre commande sera mis à jour.</p>
          
          <p>Merci de votre confiance !</p>
        </div>
      </div>
    `;

    // Envoyer l'email au client
    await sendEmail({
      to: email,
      subject: `✅ Confirmation de votre commande #${order._id.toString().slice(-8).toUpperCase()}`,
      html: clientEmailHtml,
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