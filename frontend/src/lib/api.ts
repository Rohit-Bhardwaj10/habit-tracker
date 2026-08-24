export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  get: (endpoint: string) => request(endpoint, { method: "GET" }),
  post: (endpoint: string, body?: any) => request(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: (endpoint: string, body?: any) => request(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
};

async function request(endpoint: string, options: RequestInit = {}) {
  // Ensure url always begins with /api for the Next.js proxy
  const url = endpoint.startsWith("/api") 
    ? endpoint 
    : `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    // Basic unauthenticated redirect
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
    throw new ApiError(401, "Unauthorized");
  }

  if (res.status === 204) {
    return null; // No content
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || res.statusText || "Unknown error");
  }

  return data;
}
