import axios, { AxiosRequestConfig } from "axios";

// --- Configuration ---
const BACKEND_URL =
  process.env.NEXT_PUBLIC_REPORT_API_BASE_URL || "http://localhost:8000";

// --- Helpers ---
const getUserTimezone = () => {
  if (typeof window === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return "UTC";
  }
};

const getDeviceId = () => {
  if (typeof window === "undefined") return "server-side-id";

  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
};

// --- API Client ---
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // 重要逻辑：所有后端接口统一携带固定 Authorization
    Authorization: "Bearer 11ce3f87b326b0aa",
  },
});

// Custom config interface for Axios
interface CustomConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  includeDevice?: boolean;
}

// Request Interceptor: Add dynamic headers (Device ID, etc.)
apiClient.interceptors.request.use((config) => {
  const customConfig = config as CustomConfig;
  const includeDevice = customConfig.includeDevice !== false; // Default to true

  if (includeDevice) {
    const deviceId = getDeviceId();
    config.headers["X-Device-Id"] = deviceId;
    config.headers["X-Platform"] = "web";
    config.headers["X-App-Version"] = "1.0.0";
    if (typeof navigator !== "undefined") {
      config.headers["X-OS-Version"] = navigator.userAgent;
    }
  }

  return config;
});

// Response Interceptor: Handle errors and 410 status
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    console.error("API Error:", error);
    if (axios.isAxiosError(error)) {
      // Network error (no response)
      if (!error.response) {
        const isTimeout = error.code === "ECONNABORTED";
        const message = isTimeout ? "Request timed out" : "Network error";
        throw new ApiRequestError(
          message,
          0,
          isTimeout ? "timeout_error" : "network_error",
          true,
        );
      }

      // HTTP error response
      const status = error.response.status;
      const errorData = error.response.data as ApiError; // eslint-disable-line @typescript-eslint/no-explicit-any

      // Handle 410 expired status: if response contains status field, treat as valid response
      if (
        status === 410 &&
        errorData &&
        typeof errorData === "object" &&
        "status" in errorData
      ) {
        return {
          ...error.response,
          data: errorData,
          status: 200, // Treat as success
          statusText: "OK",
        };
      }

      let code: ErrorCode = "unknown_error";
      if (status === 401) {
        code =
          errorData.error === "invalid_device"
            ? "invalid_device"
            : "auth_failed";
      } else if (status === 404) {
        code = "job_not_found";
      } else if (status === 409) {
        code = "email_duplicate";
      } else if (status === 410) {
        code = "job_expired";
      } else if (status === 422) {
        code = "validation_error";
      } else if (status === 429 || errorData.error === "queue_limit_reached") {
        code =
          errorData.error === "queue_limit_reached"
            ? "queue_limit_reached"
            : "rate_limit";
      } else if (status >= 500 && status < 600) {
        code = "server_error";
      }

      if (errorData.error) {
        const errorCodeMap: Record<string, ErrorCode> = {
          job_not_found: "job_not_found",
          invalid_device: "invalid_device",
          queue_limit_reached: "queue_limit_reached",
          rate_limit: "rate_limit",
          expired: "job_expired",
          email_duplicate: "email_duplicate",
          invalid_email: "invalid_email",
          user_not_found: "user_not_found",
        };
        if (errorCodeMap[errorData.error]) {
          code = errorCodeMap[errorData.error];
        }
      }
      const message =
        errorData.message || errorData.error || "Unknown error occurred";

      throw new ApiRequestError(message, status, code);
    }

    // Unknown error
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new ApiRequestError(message, 0, "unknown_error");
  },
);

// --- Types ---

type ErrorCode =
  | "network_error"
  | "timeout_error"
  | "server_error"
  | "job_not_found"
  | "job_expired"
  | "invalid_device"
  | "rate_limit"
  | "queue_limit_reached"
  | "auth_failed"
  | "email_duplicate"
  | "invalid_email"
  | "user_not_found"
  | "validation_error"
  | "unknown_error";

type ApiError = {
  error?: string;
  message?: string;
};

export class ApiRequestError extends Error {
  status: number;
  code: ErrorCode;
  isNetworkError: boolean;
  isServerError: boolean;
  isRetryable: boolean;

  constructor(
    message: string,
    status: number,
    code: ErrorCode = "unknown_error",
    isNetworkError = false,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
    this.isServerError = status >= 500 && status < 600;
    this.isRetryable =
      isNetworkError ||
      this.isServerError ||
      code === "rate_limit" ||
      code === "queue_limit_reached";
  }
}

export interface TikTokRedirectResponse {
  status:
    | "pending"
    | "ready"
    | "completed"
    | "error"
    | "expired"
    | "reauth_needed";
  redirect_url?: string;
  token?: string;
  app_user_id?: string;
  error?: string;
}

// --- Endpoints ---

export async function startTikTokLink(): Promise<{ archive_job_id: string }> {
  const response = await apiClient.post("/link/tiktok/start", undefined, {
    skipAuth: true,
  } as CustomConfig);
  return response.data;
}

export async function pollTikTokRedirect(
  job_id: string,
): Promise<TikTokRedirectResponse> {
  const timeZone = getUserTimezone();
  const response = await apiClient.get("/link/tiktok/redirect", {
    params: {
      job_id,
      time_zone: timeZone,
    },
    skipAuth: true,
    includeDevice: true,
  } as CustomConfig);
  return response.data;
}

export async function registerEmail(email: string): Promise<ApiError> {
  const response = await apiClient.post("/register-email", { email }, {
    skipAuth: true,
    includeDevice: true,
  } as CustomConfig);
  return response.data;
}

export async function disconnectTikTokLink(
  appUserId: string,
): Promise<{ result: string }> {
  const response = await apiClient.delete("/link/tiktok/disconnect", {
    params: { app_user_id: appUserId },
  });
  return response.data;
}
