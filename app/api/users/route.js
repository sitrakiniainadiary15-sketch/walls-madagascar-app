import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

// Afficher tous les users
export async function GET() {
  await connectDB();
  const users = await User.find();
  return NextResponse.json(users);
}

// Ajouter un user
export async function POST(req) {
  await connectDB();
  const data = await req.json();

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password
  });

  return NextResponse.json(user, { status: 201 });
}
