const API =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

function extractArray(json, listKey) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (listKey && Array.isArray(json?.data?.[listKey])) return json.data[listKey];
  if (listKey && Array.isArray(json?.[listKey])) return json[listKey];
  if (Array.isArray(json?.items)) return json.items;

  return [];
}

export async function getList(path, options = {}) {
  try {
    const response = await fetch(`${API.replace(/\/+$/, "")}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const json = await response.json();
    return extractArray(json, options.listKey);
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    return [];
  }
}

export async function getRecord(path, options = {}) {
  try {
    const response = await fetch(`${API.replace(/\/+$/, "")}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const json = await response.json();
    const data = json?.data ?? json;

    if (options.dataKey) {
      return data?.[options.dataKey] ?? json?.[options.dataKey] ?? null;
    }

    return data && typeof data === "object" ? data : null;
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    return null;
  }
}

export function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 2,
  }).format(number);
}