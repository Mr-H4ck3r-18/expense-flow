import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true });
}

// Optionally support POST too
export function POST() {
  return NextResponse.json({ ok: true, method: "POST" });
}
