import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyTokenFromReq } from "@/lib/auth";
import { Expense } from "@/types";

export async function GET(req: Request) {
  try {
    // Require authentication
    const user = verifyTokenFromReq(req);

    const db = await connectDB();
    // Fetch user's expenses
    const expenses = await db
      .collection<Expense>("expenses")
      .find({ userEmail: user.email })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({ expenses });
  } catch (err: any) {
    console.error("[GET /api/expenses] error:", err);
    const status = err.status || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const user = verifyTokenFromReq(req);
    const body = await req.json();

    // Basic validation
    const { amount, category, description, date, creditCardId } = body || {};
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

    const expense: Expense = {
      userEmail: user.email,
      amount: Number(amount),
      category,
      description,
      date: new Date(date).toISOString().split("T")[0],
      timestamp: Date.now(),
      createdAt: new Date(),
      creditCardId, // Save the link
    };

    const result = await db.collection("expenses").insertOne(expense as any);

    // return created item with _id
    return NextResponse.json(
      { expense: { ...expense, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/expenses] error:", err);
    const status = err.status || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;
    return NextResponse.json({ error: message }, { status });
  }
}

// Add DELETE route to match Dashboard usage
export async function DELETE(req: Request) {
    try {
        const user = verifyTokenFromReq(req);
        
        // Extract ID from URL (e.g., /api/expenses/123)
        // Wait, the Next.js App Router dynamic route is /[id]/route.ts
        // But the original usage was: fetch(`/api/expenses/${id}` ...)
        // There is NO [id] folder in the file structure I saw!
        // The original code audit showed `app/api/expenses/route.js`.
        // A single route.js CANNOT handle /api/expenses/123 unless it reads pathname manually.
        // Let me check the original file again.
        // The original file (Step 33) did NOT have DELETE.
        // But Dashboard.js (Step 25, line 293) calls fetch(`/api/expenses/${id}`, { method: "DELETE" })
        // This means DELETE IS BROKEN currently or I missed a file.
        // I listed 'app/api/expenses' directory in Step 31 and it had 2 CHILDREN.
        // The children were NOT shown in list_dir output (it just says numChildren).
        // Let me check if there is a [id] folder.
    
        // Temporarily, I will just implement DELETE in this file if I can, OR I'll assume there is a folder.
        // I better check directory structure again because if I write this file, I might miss the dynamic route.
        // I'll skip writing DELETE here for now and verify the directory structure in next step.
        // Just keeping GET and POST for now.
        
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    } catch(err: any) {
         return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
