import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyTokenFromReq } from "@/lib/auth";
import { CreditCard } from "@/types";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const user = verifyTokenFromReq(req);
    const db = await connectDB();
    const cards = await db
      .collection<CreditCard>("credit_cards")
      .find({ userEmail: user.email })
      .toArray();
      
    // Transform _id to id for frontend consistency if needed
    const cardsWithId = cards.map(c => ({
        ...c,
        id: c._id?.toString()
    }));

    return NextResponse.json({ cards: cardsWithId });
  } catch (err: any) {
    console.error("[GET /api/credit-cards] error:", err);
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = verifyTokenFromReq(req);
    const body = await req.json();
    const { name, lastFourDigits, type } = body || {};

    if (!name || !lastFourDigits || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await connectDB();
    const newCard: CreditCard = {
      userEmail: user.email,
      name,
      lastFourDigits,
      type,
      createdAt: new Date()
    };

    const result = await db.collection("credit_cards").insertOne(newCard as any);
    
    return NextResponse.json(
      { card: { ...newCard, id: result.insertedId.toString(), _id: result.insertedId } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/credit-cards] error:", err);
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function DELETE(req: Request) {
    try {
        const user = verifyTokenFromReq(req);
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing card ID" }, { status: 400 });
        }

        const db = await connectDB();
        const result = await db.collection("credit_cards").deleteOne({
            _id: new ObjectId(id),
            userEmail: user.email
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Card not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[DELETE /api/credit-cards] error:", err);
        return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
}
