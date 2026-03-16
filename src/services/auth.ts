const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function requestOtp(email: string) {
  await fetch('/auth/request-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
}