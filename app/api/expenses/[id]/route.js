import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyTokenFromReq } from "@/lib/auth";
import { ObjectId } from "mongodb";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function GET(req, context) {
  try {
    // await params before using
    const { id } = await context.params;
    const _id = parseId(id);
    if (!_id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const user = verifyTokenFromReq(req);
    const db = await connectDB();
    const expense = await db.collection("expenses").findOne({ _id, userEmail: user.email });
    if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ expense });
  } catch (err) {
    console.error("[GET /api/expenses/:id] error:", err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const _id = parseId(id);
    if (!_id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const user = verifyTokenFromReq(req);
    const body = await req.json();

    const update = {};
    if (body.amount !== undefined) update.amount = Number(body.amount);
    if (body.category) update.category = body.category;
    if (body.description) update.description = body.description;
    if (body.date) update.date = new Date(body.date).toISOString().split("T")[0];

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    update.updatedAt = new Date();

    const db = await connectDB();
    const result = await db.collection("expenses").findOneAndUpdate(
      { _id, userEmail: user.email },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result.value) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ expense: result.value });
  } catch (err) {
    console.error("[PUT /api/expenses/:id] error:", err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const _id = parseId(id);
    if (!_id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const user = verifyTokenFromReq(req);
    const db = await connectDB();
    const result = await db.collection("expenses").deleteOne({ _id, userEmail: user.email });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/expenses/:id] error:", err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
    return NextResponse.json({ error: message }, { status });
  }
}
