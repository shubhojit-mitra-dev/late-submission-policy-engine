const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    // some endpoints might not return JSON (e.g. 204 No Content)
  }

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText;
    throw new Error(errorMsg);
  }

  // The backend wraps responses in a { success, message, data, timestamp } envelope
  // but let's assume some might be direct arrays or have `data` fields
  if (data && typeof data === "object" && "data" in data && "success" in data) {
      if (!data.success) {
          throw new Error(data.message || "API request failed");
      }
      return data.data as T;
  }

  return data as T;
}
