import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  const { name, email, password } = await req.json();

  // vérifier email existant
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { message: "Email déjà utilisé" },
      { status: 400 }
    );
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  return NextResponse.json(
    { message: "User créé avec succès" },
    { status: 201 }
  );
}
