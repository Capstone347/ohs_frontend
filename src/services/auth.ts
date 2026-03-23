import { api } from "@/services/api";

export const requestOtp = async (email: string) => {
  return api.requestOtp(email);
};
