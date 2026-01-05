import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET; // Must be set in env

if (!JWT_SECRET) {
  // In dev we might warn, but better to facilitate safe fallback or error
  // For this migration, we kept behaviour but added type check.
  // Actually the original code threw error if missing.
  // We keep it strict.
}

async function handleSignup(body: any) {
  const { email, password, name } = body || {};
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await connectDB();
  const existingUser = await db.collection<User>("users").findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user: User = { email, name, password: hashedPassword, createdAt: new Date() };
  await db.collection("users").insertOne(user as any); // cast as any because insertOne expects OptionalId<User>

  // Original code threw error if secret missing, here we rely on env or dev-fallback if we wanted to be loose,
  // but original code had: if (!JWT_SECRET) throw...
  if (!JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
  }

  const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: "7d" });
  
  const response = NextResponse.json(
      { success: true, user: { email, name } },
      { status: 201 }
  );

  response.cookies.set("expenseflow_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    sameSite: "strict",
  });

  return response;
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const body = await req.json();

    if (pathname.endsWith("/signup")) {
      return await handleSignup(body);
    }
    if (body?.action === "signup") return await handleSignup(body);

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    console.error("Auth route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
