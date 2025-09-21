// lib/auth.js
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function verifyTokenFromReq(req) {
  // Next.js server request in app router -> req is a Request
  // Try Authorization header
  const authHeader = req.headers.get("authorization");
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback: cookie (if you set token as httpOnly cookie)
  if (!token) {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/(?:^|;\s*)expenseflow_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    const err = new Error("Missing auth token");
    err.status = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // { email, name, iat, exp }
  } catch (err) {
    const e = new Error("Invalid or expired token");
    e.status = 401;
    throw e;
  }
}
