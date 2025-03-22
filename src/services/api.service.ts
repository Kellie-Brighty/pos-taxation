import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { ApiResponse, ErrorResponse } from "../types/api.types";

const AUTH_TOKEN_KEY = "pos_auth_token";

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem(AUTH_TOKEN_KEY);
          window.location.href = "/login";
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError<ErrorResponse>): Error {
    if (error.response?.data) {
      return new Error(error.response.data.message || "An error occurred");
    }
    return new Error(error.message || "Network error occurred");
  }

  // Generic request methods
  public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.api.get(url, { params });
  }

  public async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.api.post(url, data);
  }

  public async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.api.put(url, data);
  }

  public async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.api.delete(url);
  }

  public async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.api.patch(url, data);
  }
}

export const apiService = ApiService.getInstance();
