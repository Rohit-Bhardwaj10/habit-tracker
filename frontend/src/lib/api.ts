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

async function request(endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const baseUrl = API_URL ? API_URL : "/api";
  const cleanEndpoint = endpoint.startsWith("/api") ? endpoint.replace("/api", "") : endpoint;
  const url = `${baseUrl}${cleanEndpoint.startsWith("/") ? "" : "/"}${cleanEndpoint}`;

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

  try {
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

    // If 5xx error, we might want to retry
    if (res.status >= 500 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return request(endpoint, options, retries - 1);
    }

    const data = await res.json().catch(() => null);

    let errorMessage = data?.error || res.statusText || "Unknown error";
    
    // If it's a 500-level error, don't show the raw backend stack trace to the user
    if (res.status >= 500) {
      errorMessage = "Service temporarily unavailable. Please try again.";
    } else if (errorMessage.length > 200) {
      errorMessage = errorMessage.substring(0, 200) + "...";
    }

    if (!res.ok) {
      throw new ApiError(res.status, errorMessage);
    }

    return data;
  } catch (error: any) {
    // Retry on network errors (fetch throws TypeError on network failure)
    if (retries > 0 && !(error instanceof ApiError)) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return request(endpoint, options, retries - 1);
    }
    throw error;
  }
}
