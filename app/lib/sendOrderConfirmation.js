
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderConfirmation(order, customerEmail) {
  // ✅ Email au CLIENT (dynamique - celui qui commande)
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: customerEmail, // 👈 Email dynamique du client
    subject: `Confirmation de commande #${order.id}`,
    html: `
      <h1>Merci pour votre commande !</h1>
      <p>Commande #${order.id}</p>
      <p>Total: ${order.total} €</p>
    `,
  });

  // ✅ Email à l'ADMIN (notification)
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Nouvelle commande #${order.id}`,
    html: `<p>Nouvelle commande de ${customerEmail}</p>`,
  });
}