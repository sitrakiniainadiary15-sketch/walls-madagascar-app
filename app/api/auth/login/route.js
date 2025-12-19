import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "Email incorrect" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ message: "Mot de passe incorrect" }, { status: 401 });
  }

  // 🔑 TOKEN
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const response = NextResponse.json({ message: "Login OK" });

  // 🍪 COOKIE (TRÈS IMPORTANT)
  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/"
  });

  return response;
}
