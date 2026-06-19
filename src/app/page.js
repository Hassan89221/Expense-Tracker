"use client";

import { useState, useEffect, useCallback } from "react";
import { getExpenses, getSummary } from "@/api/client";
import ExpenseForm from "@/components/ExpenseForm";
import CategoryFilter from "@/components/CategoryFilter";
import ExpenseList from "@/components/ExpenseList";
import SummaryPanel from "@/components/SummaryPanel";

const DEFAULT_SUMMARY = {
  month_total: 0,
  by_category: { Food: 0, Transport: 0, Bills: 0, Entertainment: 0, Other: 0 },
};

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async (category) => {
    try {
      const data = await getExpenses(category);
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchExpenses(selectedCategory), fetchSummary()]);
  }, [selectedCategory, fetchExpenses, fetchSummary]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchExpenses(selectedCategory), fetchSummary()]).finally(() =>
      setLoading(false)
    );
  }, [selectedCategory, fetchExpenses, fetchSummary]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleExpenseCreated = async () => {
    setError(null);
    await refreshAll();
  };

  const handleExpenseUpdated = async () => {
    setError(null);
    setEditingExpense(null);
    await refreshAll();
  };

  const handleExpenseDeleted = async () => {
    setError(null);
    await refreshAll();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2" id="expense-form">
            <ExpenseForm
              editingExpense={editingExpense}
              onCreated={handleExpenseCreated}
              onUpdated={handleExpenseUpdated}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onChange={handleCategoryChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Loading expenses...</p>
              </div>
            ) : (
              <ExpenseList
                expenses={expenses}
                onEdit={handleEdit}
                onDelete={handleExpenseDeleted}
              />
            )}
          </div>
          <div>
            <SummaryPanel summary={summary} />
          </div>
        </div>
      </main>
    </div>
  );
}
