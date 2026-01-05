import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { verifyTokenFromReq } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyTokenFromReq(req);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const db = await connectDB();
    
    // valid Mongo ID?
    let query: any = { _id: id, userEmail: user.email };
    if (ObjectId.isValid(id)) {
        query = {
             $or: [
                 { _id: new ObjectId(id), userEmail: user.email },
                 { id: id, userEmail: user.email } // handle string UUIDs if legacy
             ]
        }
    } else {
        // legacy id support if string
        query = { id: id, userEmail: user.email };
    }

    const result = await db.collection("expenses").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Expense not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE /api/expenses/[id]] error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: err.status || 500 }
    );
  }
}
