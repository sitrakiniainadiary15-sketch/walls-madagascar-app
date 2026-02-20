// app/api/upload/route.js
import { NextResponse } from "next/server";
import cloudinary from "@/app/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    // 🔒 Vérifier que l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type"); // "avatar" ou "product"

    if (!file) {
      return NextResponse.json(
        { message: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    // ✅ Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Format non autorisé. Utilisez JPG, PNG ou WEBP" },
        { status: 400 }
      );
    }

    // ✅ Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "Fichier trop volumineux. Maximum 5MB" },
        { status: 400 }
      );
    }

    // ✅ Convertir en base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // ✅ Définir le dossier selon le type
    const folder = type === "avatar" ? "avatars" : "products";

    // ✅ Upload sur Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: folder,
      transformation: type === "avatar"
        ? [{ width: 200, height: 200, crop: "fill", gravity: "face" }]
        : [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    });

    console.log(`✅ Image uploadée: ${result.secure_url}`);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error("❌ Erreur upload:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}