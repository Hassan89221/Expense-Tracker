import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { CATEGORIES, isValidCategory, isValidAmount, isValidDate } from "@/lib/constants";

export const dynamic = "force-dynamic";

// PUT /api/expenses/[id] — update an expense
export async function PUT(request, { params }) {
  const { id } = await params;
  const expenseId = parseInt(id, 10);

  const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!existing) {
    return NextResponse.json({ detail: "Expense not found" }, { status: 404 });
  }

  const body = await request.json();
  const { amount, category, note, date } = body;

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

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      amount,
      category,
      note: note?.trim() || null,
      date,
      // createdAt is preserved — not updated
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/expenses/[id] — delete an expense
export async function DELETE(request, { params }) {
  const { id } = await params;
  const expenseId = parseInt(id, 10);

  const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!existing) {
    return NextResponse.json({ detail: "Expense not found" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id: expenseId } });

  return NextResponse.json({ message: "Expense deleted", id: expenseId });
}
