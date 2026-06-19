export const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

export function isValidCategory(category) {
  return CATEGORIES.includes(category);
}

export function isValidDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export function isValidAmount(amount) {
  return typeof amount === "number" && amount > 0;
}
