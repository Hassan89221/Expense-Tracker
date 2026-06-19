"use client";

const CATEGORY_BAR_COLORS = {
  Food: "bg-orange-500",
  Transport: "bg-blue-500",
  Bills: "bg-red-500",
  Entertainment: "bg-purple-500",
  Other: "bg-gray-500",
};

function SummaryPanel({ summary }) {
  const { month_total, by_category } = summary;
  const maxAmount = Math.max(...Object.values(by_category), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Monthly Summary
      </h2>

      <div className="mb-6 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">This Month's Total</p>
        <p className="text-3xl font-bold text-gray-800">
          ${month_total.toFixed(2)}
        </p>
      </div>

      <h3 className="text-sm font-medium text-gray-600 mb-3">By Category</h3>
      <div className="space-y-3">
        {Object.entries(by_category).map(([category, amount]) => {
          const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
          const barColor = CATEGORY_BAR_COLORS[category] || "bg-gray-500";

          return (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">{category}</span>
                <span className="text-gray-600">${amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SummaryPanel;
