const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface RequestConfig extends RequestInit {
  data?: unknown;
  headers?: HeadersInit;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = {
  getToken: () => localStorage.getItem("token"),

  setToken: (token: string) => localStorage.setItem("token", token),

  removeToken: () => localStorage.removeItem("token"),

  request: async <T>(
    endpoint: string,
    { data, ...customConfig }: RequestConfig = {},
  ): Promise<T> => {
    const token = apiClient.getToken();
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Only set Content-Type for non-FormData requests
    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestConfig = {
      ...customConfig,
      headers: {
        ...headers,
        ...customConfig.headers,
      },
    };

    if (data) {
      // Don't stringify FormData
      config.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (response.ok) {
        return data;
      }

      throw new ApiError(
        response.status,
        data.message || "Something went wrong",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Network error");
    }
  },

  // Convenience methods
  get: <T>(endpoint: string, config: RequestConfig = {}) => {
    return apiClient.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  },

  post: <T, D = unknown>(endpoint: string, data: D, config: RequestConfig = {}) => {
    return apiClient.request<T>(endpoint, {
      ...config,
      method: "POST",
      data,
    });
  },

  put: <T, D = unknown>(endpoint: string, data: D, config: RequestConfig = {}) => {
    return apiClient.request<T>(endpoint, {
      ...config,
      method: "PUT",
      data,
    });
  },

  delete: <T>(endpoint: string, config: RequestConfig = {}) => {
    return apiClient.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  },
};
