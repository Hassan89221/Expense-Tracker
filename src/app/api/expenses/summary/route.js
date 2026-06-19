import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET /api/expenses/summary — monthly total + per-category breakdown
export async function GET() {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Fetch all expenses for the current month
  const expenses = await prisma.expense.findMany({
    where: {
      date: { startsWith: monthPrefix },
    },
  });

  // Build per-category totals
  const byCategory = {};
  for (const cat of CATEGORIES) {
    byCategory[cat] = 0;
  }

  let monthTotal = 0;
  for (const expense of expenses) {
    const amount = expense.amount;
    monthTotal += amount;
    if (byCategory[expense.category] !== undefined) {
      byCategory[expense.category] += amount;
    }
  }

  // Round all values to 2 decimal places
  monthTotal = Math.round(monthTotal * 100) / 100;
  for (const cat of CATEGORIES) {
    byCategory[cat] = Math.round(byCategory[cat] * 100) / 100;
  }

  return NextResponse.json({
    month_total: monthTotal,
    by_category: byCategory,
  });
}
