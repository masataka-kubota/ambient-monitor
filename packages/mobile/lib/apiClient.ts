import { hcWithType } from "backend";

if (!process.env.EXPO_PUBLIC_BACKEND_API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_BACKEND_API_BASE_URL is not set");
}
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_BASE_URL;
export const apiClient = hcWithType(API_BASE_URL);
