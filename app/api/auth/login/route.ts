import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

async function handleLogin(body: any) {
  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await connectDB();
  const user = await db.collection<User>("users").findOne({ email });
  if (!user || !user.password)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: "7d",
  });
  
  const response = NextResponse.json(
    { success: true, user: { email: user.email, name: user.name } },
    { status: 200 }
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

//route that handles /api/auth/login based on pathname
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname; // e.g. /api/auth/login
    const body = await req.json();

    // if you want subpaths: /api/auth/login
    if (pathname.endsWith("/login")) {
      return await handleLogin(body);
    }

    // optionally handle /api/auth with action field
    if (body?.action === "login") return await handleLogin(body);

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    console.error("Auth route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
