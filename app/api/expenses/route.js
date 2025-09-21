import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyTokenFromReq } from "@/lib/auth";

export async function GET(req) {
  try {
    // Require authentication
    const user = verifyTokenFromReq(req);

    const db = await connectDB();
    // Fetch user's expenses (assuming we store email on the expense)
    const expenses = await db
      .collection("expenses")
      .find({ userEmail: user.email })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({ expenses });
  } catch (err) {
    console.error("[GET /api/expenses] error:", err);
    const status = err.status || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req) {
  try {
    const user = verifyTokenFromReq(req);
    const body = await req.json();

    // Basic validation
    const { amount, category, description, date } = body || {};
    if (
      amount === undefined ||
      amount === null ||
      isNaN(Number(amount)) ||
      !category ||
      !description ||
      !date
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const expense = {
      userEmail: user.email,
      amount: Number(amount),
      category,
      description,
      date: new Date(date).toISOString().split("T")[0],
      timestamp: Date.now(),
      createdAt: new Date(),
    };

    const result = await db.collection("expenses").insertOne(expense);

    // return created item with _id
    return NextResponse.json(
      { expense: { ...expense, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/expenses] error:", err);
    const status = err.status || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;
    return NextResponse.json({ error: message }, { status });
  }
}
