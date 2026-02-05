import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import { sendEmail } from "@/app/lib/mailer";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // 1. Récupérer la commande avec les détails des produits
    const order = await Order.findById(id).populate("products.product");

    if (!order) {
      return NextResponse.json({ success: false, message: "Commande non trouvée" }, { status: 404 });
    }

    // 2. Préparer les variables (Logique identique à ton fichier de création de commande)
    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    const { customer, products, total, payment, delivery } = order;

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

    // Liste des produits formatée pour le HTML
    const productListHtml = products.map((item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            ${item.product?.name || "Produit"}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${item.product?.price ? Number(item.product.price).toLocaleString() + " Ar" : "-"}
          </td>
        </tr>
    `).join("");

    // 3. TON TEMPLATE HTML (Celui de ton code d'origine)
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">✅ Récapitulatif de Commande</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Voici les détails de votre commande, ${customer.firstname} !</p>
          </div>
          <div style="padding: 30px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
              <p style="margin: 0; color: #166534; font-size: 14px;">NUMÉRO DE COMMANDE</p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #15803d;">#${orderNumber}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produit</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qté</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prix</th>
                </tr>
              </thead>
              <tbody>${productListHtml}</tbody>
            </table>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p><strong>Adresse :</strong> ${customer.address}, ${customer.city}</p>
              <p><strong>Mode :</strong> ${deliveryLabels[delivery] || delivery}</p>
              <p><strong>Paiement :</strong> ${paymentLabels[payment] || payment}</p>
            </div>
            <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">TOTAL</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold;">${Number(total).toLocaleString()} Ar</p>
            </div>
          </div>
          <div style="background: #1f2937; color: white; padding: 30px; text-align: center;">
            <p>© ${new Date().getFullYear()} Mon Site E-commerce</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Envoi de l'email
    await sendEmail({
      to: customer.email,
      subject: `🔄 Récapitulatif de votre commande #${orderNumber}`,
      html: clientEmailHtml,
    });

    return NextResponse.json({ success: true, message: "Email renvoyé avec succès" });

  } catch (error) {
    console.error("RESEND ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}