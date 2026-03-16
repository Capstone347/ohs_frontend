import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { requestOtp } from '@/services/auth';

type LocationState = {
  email?: string;
  requestedAt?: number;
  message?: string;
};

const COOLDOWN_SECONDS = 60;

function formatSeconds(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${safe}s`;
}

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const email = state.email?.trim().toLowerCase() || '';
  const initialRequestedAt = state.requestedAt || Date.now();
  const message =
    state.message || "If the email is valid, you’ll receive a code.";

  const [requestedAt, setRequestedAt] = useState(initialRequestedAt);
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState(message);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - requestedAt) / 1000);
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
      setSecondsLeft(remaining);
    }, 500);

    return () => window.clearInterval(interval);
  }, [requestedAt]);

  const canResend = useMemo(() => secondsLeft === 0, [secondsLeft]);

  async function handleResend() {
    if (!email || !canResend || isResending) return;

    setIsResending(true);

    try {
      await requestOtp(email);
      setFeedback("If the email is valid, you’ll receive a code.");
      setRequestedAt(Date.now());
      setSecondsLeft(COOLDOWN_SECONDS);
    } catch {
      // same generic response
      setFeedback("If the email is valid, you’ll receive a code.");
      setRequestedAt(Date.now());
      setSecondsLeft(COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  }

  function handleVerifyPlaceholder() {
    // Hook this up later to POST /auth/verify-otp
    console.log('Verify OTP:', { email, otp });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Enter code</h1>
        <p className="text-sm text-muted-foreground mb-2">
          We sent a one-time code to:
        </p>
        <p className="text-sm font-medium mb-4 break-all">{email}</p>

        <p className="text-sm text-green-700 mb-6">{feedback}</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-2">
              OTP code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          <button
            type="button"
            onClick={handleVerifyPlaceholder}
            className="w-full rounded-lg px-4 py-2 font-medium border"
          >
            Continue
          </button>

          <div className="text-sm">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="underline disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Resend code'}
              </button>
            ) : (
              <span className="text-muted-foreground">
                Resend available in {formatSeconds(secondsLeft)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm underline"
          >
            Change email
          </button>
        </div>
      </div>
    </div>
  );
}