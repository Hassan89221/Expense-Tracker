"use client";

import { useState, useEffect, useRef } from "react";
import { createExpense, updateExpense } from "@/api/client";

const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function ExpenseForm({ editingExpense, onCreated, onUpdated, onCancelEdit }) {
  const isEditing = !!editingExpense;
  const formRef = useRef(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (editingExpense) {
      setAmount(String(editingExpense.amount));
      setCategory(editingExpense.category);
      setNote(editingExpense.note || "");
      setDate(editingExpense.date);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editingExpense]);

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setNote("");
    setDate(getTodayDate());
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setFormError("Amount must be a positive number.");
      return;
    }
    if (!category) {
      setFormError("Please select a category.");
      return;
    }
    if (!date) {
      setFormError("Please select a date.");
      return;
    }

    const payload = {
      amount: parsedAmount,
      category,
      note: note.trim() || null,
      date,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateExpense(editingExpense.id, payload);
        resetForm();
        onUpdated();
      } else {
        await createExpense(payload);
        resetForm();
        onCreated();
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  return (
    <div ref={formRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {isEditing ? "Edit Expense" : "Add Expense"}
      </h2>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            maxLength={255}
            placeholder="e.g., Lunch with team"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {submitting
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
              ? "Update Expense"
              : "Add Expense"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;
