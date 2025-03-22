import { API_ENDPOINTS } from "../config/api.endpoints";
import { apiService } from "./api.service";
// import axios from "axios";

const AUTH_TOKEN_KEY = "pos_auth_token";

export interface RegistrationData {
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  registrationNumber: string;
  businessAddress: string;
  userType: string;
}

// interface OTPVerificationData {
//   email: string;
//   otp: string;
// }

interface ResendOTPData {
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code: number;
}

// interface ValidationError {
//   [key: string]: string[];
// }

// interface ErrorResponse {
//   message: string;
//   errors?: ValidationError;
// }

interface RegistrationResponse {
  userId: string;
}

// interface OTPVerificationResponse {
//   token: string;
//   user: {
//     id: string;
//     fullName: string;
//     email: string;
//     userType: string;
//     businessName: string;
//   };
// }

export interface BankRegistrationData {
  fullName: string;
  email: string;
  phoneNumber: string;
  bankName: string;
  registrationNumber: string;
  headOfficeAddress: string;
  numAgents: number;
  userType: string;
}

interface BankRegistrationResponse {
  userId: string;
}

interface LoginData {
  email: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    userType: string;
    fullName: string;
  };
}

class AuthService {
  async register(
    data: RegistrationData
  ): Promise<ApiResponse<RegistrationResponse>> {
    try {
      const response = await apiService.post<ApiResponse<RegistrationResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      return (
        response.data || {
          success: false,
          message: "No response received from server",
          status_code: 500,
        }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async verifyOTP(data: {
    email: string;
    otp: string;
  }): Promise<ApiResponse<LoginResponse | { userId: string }>> {
    try {
      const response = await apiService.post<
        ApiResponse<LoginResponse | { userId: string }>
      >(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
      return (
        response.data || {
          success: false,
          message: "No response received from server",
          status_code: 500,
        }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async resendOTP(
    data: ResendOTPData
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiService.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.RESEND_OTP,
        data
      );
      return (
        response.data || {
          success: false,
          message: "No response received from server",
          status_code: 500,
        }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async registerBank(
    data: BankRegistrationData
  ): Promise<ApiResponse<BankRegistrationResponse>> {
    try {
      const response = await apiService.post<
        ApiResponse<BankRegistrationResponse>
      >(API_ENDPOINTS.AUTH.REGISTER, data);
      return (
        response.data || {
          success: false,
          message: "No response received from server",
          status_code: 500,
        }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async requestLoginOTP(
    data: LoginData
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiService.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );
      return (
        response.data || {
          success: false,
          message: "No response received from server",
          status_code: 500,
        }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error("An unexpected error occurred. Please try again.");
  }

  getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("pos_user");
    window.location.href = "/login";
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const authService = new AuthService();
