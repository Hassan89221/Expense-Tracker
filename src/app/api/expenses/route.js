import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { CATEGORIES, isValidCategory, isValidAmount, isValidDate } from "@/lib/constants";

// GET /api/expenses — list expenses with optional category filter
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (category && !isValidCategory(category)) {
    return NextResponse.json(
      { detail: `Invalid category '${category}'. Must be one of: ${CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  const where = category ? { category } : {};

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(expenses);
}

// POST /api/expenses — create a new expense
export async function POST(request) {
  const body = await request.json();
  const { amount, category, note, date } = body;

  // Validation
  if (!isValidAmount(amount)) {
    return NextResponse.json(
      { detail: "Amount must be a positive number." },
      { status: 400 }
    );
  }

  if (!isValidCategory(category)) {
    return NextResponse.json(
      { detail: `Invalid category. Must be one of: ${CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!isValidDate(date)) {
    return NextResponse.json(
      { detail: "Invalid date format. Must be YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const createdAt = new Date().toISOString();

  const expense = await prisma.expense.create({
    data: {
      amount,
      category,
      note: note?.trim() || null,
      date,
      createdAt,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
