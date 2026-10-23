const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getList(path) {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.items)) return json.items;
    return [];
  } catch {
    return [];
  }
}