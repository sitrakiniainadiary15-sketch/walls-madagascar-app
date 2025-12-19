import { connectDB } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  return NextResponse.json({ message: "MongoDB connecté ✅" });
}
