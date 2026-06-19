"use client";

import { useState } from "react";
import { deleteExpense } from "@/api/client";

const CATEGORY_COLORS = {
  Food: "bg-orange-100 text-orange-700",
  Transport: "bg-blue-100 text-blue-700",
  Bills: "bg-red-100 text-red-700",
  Entertainment: "bg-purple-100 text-purple-700",
  Other: "bg-gray-100 text-gray-700",
};

function ExpenseItem({ expense, onEdit, onDelete }) {
  const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteExpense(expense.id);
      onDelete();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirming(false);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:shadow-sm transition">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorClass}`}
        >
          {expense.category}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {expense.note || "No note"}
          </p>
          <p className="text-xs text-gray-500">{expense.date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4 shrink-0">
        <span className="text-lg font-semibold text-gray-800">
          ${expense.amount.toFixed(2)}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            title="Edit"
            onClick={() => onEdit(expense)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
              >
                {deleting ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              title="Delete"
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseItem;
