import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // 587
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // évite self-signed certificate error
  },
});

// Vérification SMTP au démarrage
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP prêt à envoyer des emails");
  }
});

export async function sendEmail({ to, subject, html }) {
  if (!to) {
    console.error("❌ Destinataire email manquant");
    return;
  }

  // 🔥 Version TEXT obligatoire pour Gmail
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // 🔥 OBLIGATOIRE
      html,
    });

    console.log("✅ Email envoyé:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ ERREUR EMAIL:", error);
    throw error;
  }
}
