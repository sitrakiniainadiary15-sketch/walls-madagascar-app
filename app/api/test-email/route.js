import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ✅ CORRECTION ICI
  },
});

    // 📩 Envoi du mail test
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // email de test
      subject: "✅ Test email réussi",
      html: `
        <h2>Test Nodemailer</h2>
        <p>🎉 Félicitations !</p>
        <p>Votre configuration email fonctionne correctement.</p>
      `,
    });

    return NextResponse.json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("EMAIL TEST ERROR:", error);

    return NextResponse.json(
      { message: "Erreur lors de l'envoi de l'email", error: error.message },
      { status: 500 }
    );
  }
}
