const BASE_URL = "/api";

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json();
}

export async function getExpenses(category) {
  const url =
    category && category !== "All"
      ? `${BASE_URL}/expenses?category=${encodeURIComponent(category)}`
      : `${BASE_URL}/expenses`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function createExpense(data) {
  const res = await fetch(`${BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateExpense(id, data) {
  const res = await fetch(`${BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function getSummary() {
  const res = await fetch(`${BASE_URL}/expenses/summary`);
  return handleResponse(res);
}
