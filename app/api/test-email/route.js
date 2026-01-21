// app/api/test-email/route.js

import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/mailer";

// ✅ GET pour tester via navigateur
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({
      message: "Usage: /api/test-email?email=ton-email@gmail.com"
    });
  }

  try {
    console.log("🧪 Test envoi à:", email);

    await sendEmail({
      to: email,
      subject: "🧪 Test - " + new Date().toLocaleString("fr-FR"),
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h1 style="color: #22c55e;">✅ Ça marche !</h1>
          <p>Email reçu le ${new Date().toLocaleString("fr-FR")}</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Email envoyé à ${email}` 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}