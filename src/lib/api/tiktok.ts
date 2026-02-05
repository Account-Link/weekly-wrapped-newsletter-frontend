import axios, { AxiosRequestConfig } from "axios";

// --- Configuration ---
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TIKTOK_API_BASE_URL || "http://localhost:8000";

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
      const errorData = error.response.data as any; // eslint-disable-line @typescript-eslint/no-explicit-any

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

      // Extract error message
      const message =
        errorData.message || errorData.error || "Unknown error occurred";
      const code = errorData.error || "server_error";

      throw new ApiRequestError(message, status, code);
    }

    // Unknown error
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new ApiRequestError(message, 0, "unknown_error");
  },
);

// --- Types ---

export class ApiRequestError extends Error {
  status: number;
  code: string;
  isNetworkError: boolean;
  isServerError: boolean;

  constructor(
    message: string,
    status: number,
    code: string = "unknown_error",
    isNetworkError = false,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
    this.isServerError = status >= 500 && status < 600;
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
  const response = await apiClient.post("/link/tiktok/start", {}, {
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
