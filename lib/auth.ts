// lib/auth.ts
import jwt from "jsonwebtoken";
import { User } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface DecodedToken {
  email: string;
  name: string;
  iat: number;
  exp: number;
}

// Helper to add status property to Error
class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function verifyTokenFromReq(req: Request): DecodedToken {
  // Next.js server request in app router -> req is a Request
  // Try Authorization header
  const authHeader = req.headers.get("authorization");
  let token: string | null = null;

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
    throw new AuthError("Missing auth token", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded; // { email, name, iat, exp }
  } catch (err) {
    throw new AuthError("Invalid or expired token", 401);
  }
}
