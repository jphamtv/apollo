const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface RequestConfig extends RequestInit {
  data?: any;
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

  request: async (
    endpoint: string,
    { data, ...customConfig }: RequestConfig = {},
  ) => {
    const token = apiClient.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestConfig = {
      ...customConfig,
      headers: {
        ...headers,
        ...customConfig.headers,
      },
    };

    if (data) {
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
    return apiClient.request(endpoint, {
      ...config,
      method: "GET",
    }) as Promise<T>;
  },

  post: <T>(endpoint: string, data: any, config: RequestConfig = {}) => {
    return apiClient.request(endpoint, {
      ...config,
      method: "POST",
      data,
    }) as Promise<T>;
  },

  put: <T>(endpoint: string, data: any, config: RequestConfig = {}) => {
    return apiClient.request(endpoint, {
      ...config,
      method: "PUT",
      data,
    }) as Promise<T>;
  },

  delete: <T>(endpoint: string, config: RequestConfig = {}) => {
    return apiClient.request(endpoint, {
      ...config,
      method: "DELETE",
    }) as Promise<T>;
  },
};
