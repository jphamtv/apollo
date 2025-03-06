import { ApiError, ErrorResponse, ValidationErrorResponse } from "../types/error";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface RequestConfig extends RequestInit {
  data?: unknown;
  headers?: HeadersInit;
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
      const responseData = await response.json();

      if (response.ok) {
        return responseData;
      }

      // Determine if we have validation errors or a general error
      const errorData = Array.isArray(responseData.errors) 
        ? responseData as ValidationErrorResponse 
        : responseData as ErrorResponse;

      throw new ApiError(
        response.status,
        errorData.message || "Something went wrong",
        errorData
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