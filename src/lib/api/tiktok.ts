import axios from "axios";

export const TIKTOK_API_BASE_URL =
  process.env.NEXT_PUBLIC_TIKTOK_API_BASE_URL || "http://localhost:8080";

export type TikTokLinkStatus =
  | "pending"
  | "ready"
  | "completed"
  | "reauth_needed"
  | "expired";

export interface TikTokStartResponse {
  archive_job_id: string;
}

export interface TikTokRedirectResponse {
  status: TikTokLinkStatus;
  redirect_url?: string;
  token?: string;
  app_user_id?: string;
}

// Helper to get or create device ID
let memoryDeviceId: string | null = null;
const getDeviceId = () => {
  if (typeof window === "undefined") return "server-side-id";
  if (!memoryDeviceId) {
    memoryDeviceId = crypto.randomUUID();
  }
  return memoryDeviceId;
};

const apiClient = axios.create({
  timeout: 10000,
  baseURL: TIKTOK_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Platform": "web",
    "X-App-Version": "1.0.0",
    "X-OS-Version": "Unknown",
  },
});

// Request interceptor to add dynamic headers
apiClient.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = getDeviceId();
  return config;
});

export async function startTikTokLink(): Promise<TikTokStartResponse> {
  const response = await apiClient.post("/link/tiktok/start");
  return response.data;
}

export async function pollTikTokRedirect(
  job_id: string,
): Promise<TikTokRedirectResponse> {
  const response = await apiClient.get("/link/tiktok/redirect", {
    params: { job_id },
  });
  return response.data;
}
