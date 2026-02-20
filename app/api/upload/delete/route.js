// app/api/upload/delete/route.js
import { NextResponse } from "next/server";
import cloudinary from "@/app/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { message: "publicId manquant" },
        { status: 400 }
      );
    }

    // ✅ Supprimer de Cloudinary
    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      message: "Image supprimée",
    });

  } catch (error) {
    console.error("❌ Erreur suppression:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}