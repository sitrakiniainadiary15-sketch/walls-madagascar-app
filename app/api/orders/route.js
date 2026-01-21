// app/api/order/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import { sendEmail } from "@/app/lib/mailer";
import Customer from "@/app/models/Customer";

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

    // ✅ Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format d'email invalide" },
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
       FORMAT PRODUITS
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

    console.log("✅ Commande créée:", order._id);
    /* ======================
   👤 SYNC CUSTOMER (IMPORTANT)
====================== */
const normalizedEmail = email.toLowerCase();

let existingCustomer = await Customer.findOne({ email: normalizedEmail });

if (existingCustomer) {
  existingCustomer.totalOrders += 1;
  existingCustomer.totalSpent += Number(total);
  existingCustomer.lastOrderAt = new Date();

  if (!existingCustomer.phone && phone) existingCustomer.phone = phone;
  if (!existingCustomer.city && city) existingCustomer.city = city;
  if (!existingCustomer.address && address) existingCustomer.address = address;

  await existingCustomer.save();
} else {
  await Customer.create({
    firstname,
    lastname,
    email: normalizedEmail,
    phone: phone || "",
    city: city || "",
    address: address || "",
    totalOrders: 1,
    totalSpent: Number(total),
    lastOrderAt: new Date(),
    status: "active",
  });
}


    /* ======================
       📧 PRÉPARATION DES EMAILS
    ====================== */
    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    const orderDate = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const paymentLabels = {
      cash: "💵 Espèces à la livraison",
      mobile_money: "📱 Mobile Money",
      card: "💳 Carte bancaire",
      bank_transfer: "🏦 Virement bancaire",
    };

    const deliveryLabels = {
      standard: "🚚 Livraison standard",
      express: "⚡ Livraison express",
      pickup: "🏪 Retrait en magasin",
    };

    // Liste des produits formatée
    const productListHtml = cartItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            ${item.name || "Produit"}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${item.price ? Number(item.price).toLocaleString() + " Ar" : "-"}
          </td>
        </tr>
      `
      )
      .join("");

    /* ======================
       📧 EMAIL À L'ADMIN
    ====================== */
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
          
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🛒 Nouvelle Commande !</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Commande #${orderNumber}</p>
          </div>
          
          <div style="padding: 30px;">
            
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>📅 Date :</strong> ${orderDate}
              </p>
            </div>
            
            <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              👤 Informations Client
            </h2>
            <table style="width: 100%; margin-bottom: 25px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Nom complet</td>
                <td style="padding: 8px 0; font-weight: bold;">${firstname} ${lastname}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${email}" style="color: #3b82f6;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Téléphone</td>
                <td style="padding: 8px 0;">${phone || "Non renseigné"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Adresse</td>
                <td style="padding: 8px 0;">${address}, ${city}</td>
              </tr>
            </table>
            
            <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              📦 Produits Commandés
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produit</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qté</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${productListHtml}
              </tbody>
            </table>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0;">
                <strong>💳 Paiement :</strong> ${paymentLabels[payment] || payment}
              </p>
              <p style="margin: 0;">
                <strong>🚚 Livraison :</strong> ${deliveryLabels[delivery] || delivery}
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">TOTAL À PAYER</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold;">
                ${Number(total).toLocaleString()} Ar
              </p>
            </div>
            
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Connectez-vous au <a href="#" style="color: #3b82f6;">dashboard admin</a> pour gérer cette commande.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    /* ======================
       📧 EMAIL AU CLIENT
    ====================== */
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
          
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">✅ Commande Confirmée !</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">
              Merci pour votre achat, ${firstname} !
            </p>
          </div>
          
          <div style="padding: 30px;">
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
              <p style="margin: 0; color: #166534; font-size: 14px;">NUMÉRO DE COMMANDE</p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #15803d; letter-spacing: 2px;">
                #${orderNumber}
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Nous avons bien reçu votre commande et elle est en cours de traitement. 
              Vous recevrez un email dès que le statut de votre commande sera mis à jour.
            </p>
            
            <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px;">
              📋 Récapitulatif de votre commande
            </h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produit</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qté</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${productListHtml}
              </tbody>
            </table>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">📍 Détails de livraison</h3>
              <p style="margin: 0 0 8px 0; color: #4b5563;">
                <strong>Adresse :</strong> ${address}, ${city}
              </p>
              <p style="margin: 0 0 8px 0; color: #4b5563;">
                <strong>Mode :</strong> ${deliveryLabels[delivery] || delivery}
              </p>
              <p style="margin: 0; color: #4b5563;">
                <strong>Paiement :</strong> ${paymentLabels[payment] || payment}
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">TOTAL</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold;">
                ${Number(total).toLocaleString()} Ar
              </p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">❓ Une question ?</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Répondez directement à cet email ou contactez-nous au 
                <strong>${phone ? phone : "notre service client"}</strong>
              </p>
            </div>
            
          </div>
          
          <div style="background: #1f2937; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
              Merci de votre confiance ! 🙏
            </p>
            <p style="margin: 0; opacity: 0.7; font-size: 14px;">
              © ${new Date().getFullYear()} Mon Site E-commerce - Tous droits réservés
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    /* ======================
       📧 ENVOI DES EMAILS
    ====================== */
    let emailErrors = [];

    // 1️⃣ Email à l'ADMIN
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      console.log("📧 Envoi email ADMIN à:", adminEmail);

      await sendEmail({
        to: adminEmail,
        subject: `🛒 Nouvelle commande #${orderNumber} - ${firstname} ${lastname}`,
        html: adminEmailHtml,
      });

      console.log("✅ Email ADMIN envoyé avec succès");
    } catch (emailError) {
      console.error("❌ Erreur email ADMIN:", emailError.message);
      emailErrors.push({ type: "admin", error: emailError.message });
    }

    // 2️⃣ Email au CLIENT (✅ EMAIL DYNAMIQUE - tous les clients reçoivent !)
    try {
      console.log("📧 Envoi email CLIENT à:", email);

      await sendEmail({
        to: email, // ✅ L'email du client qui passe la commande
        subject: `✅ Confirmation de votre commande #${orderNumber}`,
        html: clientEmailHtml,
      });

      console.log("✅ Email CLIENT envoyé avec succès à:", email);
    } catch (emailError) {
      console.error("❌ Erreur email CLIENT:", emailError.message);
      emailErrors.push({ type: "client", error: emailError.message });
    }

    /* ======================
       ✅ RÉPONSE SUCCÈS
    ====================== */
    return NextResponse.json(
      {
        success: true,
        message: "Commande créée avec succès",
        order: {
          _id: order._id,
          orderNumber: orderNumber,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        },
        emailStatus: emailErrors.length === 0 ? "sent" : "partial",
        emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ ORDER API ERROR:", error);

    // Erreur de validation Mongoose
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Erreur de validation",
          errors: Object.values(error.errors).map((e) => e.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

/* ======================
   📋 GET - Liste des commandes (optionnel)
====================== */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit")) || 50;

    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("products.product");

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error("❌ GET ORDERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}