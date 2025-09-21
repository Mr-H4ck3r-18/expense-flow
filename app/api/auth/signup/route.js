import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

async function handleSignup(body) {
  const { email, password, name } = body || {};
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await connectDB();
  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { email, name, password: hashedPassword, createdAt: new Date() };
  await db.collection("users").insertOne(user);

  const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: "7d" });
  return NextResponse.json({ token, user: { email, name } }, { status: 201 });
}

// route that handles /api/auth/signup based on pathname
export async function POST(req) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname; // e.g. /api/auth or /api/auth/signup
    const body = await req.json();

    // if you want subpaths: /api/auth/signup
    if (pathname.endsWith("/signup")) {
      return await handleSignup(body);
    }

    // optionally handle /api/auth with action field
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
