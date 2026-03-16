import { requestOtp } from '@/services/auth';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { api } from '@/services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 60;
const GENERIC_OTP_MESSAGE = "If the email is valid, you’ll receive a code.";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [requestedAt, setRequestedAt] = useState<number | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const isValidEmail = EMAIL_REGEX.test(normalizedEmail);
  const canResend = codeSent && secondsLeft === 0 && !isResending && !isLoading;

  useEffect(() => {
    if (!requestedAt) return;

    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - requestedAt) / 1000);
      const remaining = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);
      setSecondsLeft(remaining);
    }, 500);

    return () => window.clearInterval(interval);
  }, [requestedAt]);

  const startCooldown = () => {
    const now = Date.now();
    setRequestedAt(now);
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  };

  const requestOtp = async (emailToSend: string) => {
    await requestOtp(emailToSend);;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!isValidEmail) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await requestOtp(normalizedEmail);
    } catch {
      // Intentionally ignore specific backend failure details
      // to avoid revealing whether an email exists.
    } finally {
      setIsLoading(false);
    }

    setCodeSent(true);
    startCooldown();
    toast.success(GENERIC_OTP_MESSAGE);
  };

  const handleResendCode = async () => {
    if (!canResend || !isValidEmail) return;

    setIsResending(true);

    try {
      await requestOtp(normalizedEmail);
    } catch {
      // Keep same UX and message regardless of backend response
    } finally {
      setIsResending(false);
    }

    startCooldown();
    toast.success(GENERIC_OTP_MESSAGE);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      // Replace with actual OTP verification endpoint later
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Welcome back!');
      navigate('/app/orders');
    } catch {
      toast.error('Unable to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    setCodeSent(false);
    setOtp('');
    setRequestedAt(null);
    setSecondsLeft(0);
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          <Link to="/" className="block text-center mb-8">
            <span className="font-heading text-2xl text-text-dark">OHS Remote</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl text-text-dark mb-2">
              Welcome Back
            </h1>
            <p className="text-text-dark-muted">
              {codeSent
                ? 'Enter the code we sent to your email'
                : 'Enter your email to receive a one-time login code'}
            </p>
          </div>

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className="pl-10 h-12 bg-white border-border-light text-text-dark placeholder:text-text-dark-muted focus:border-primary focus:ring-primary"
                  />
                </div>

                {emailTouched && !isValidEmail && email.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Code
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="rounded-xl bg-muted/40 border border-border-light p-4 text-sm text-text-dark">
                <p className="font-medium mb-1">Code sent</p>
                <p className="text-text-dark-muted break-all">{normalizedEmail}</p>
                <p className="mt-2 text-text-dark-muted">{GENERIC_OTP_MESSAGE}</p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value.replace(/\D/g, ''))}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>

              <div className="text-center">
                {secondsLeft > 0 ? (
                  <p className="text-sm text-text-dark-muted">
                    Resend code in {secondsLeft}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {isResending ? 'Resending...' : 'Resend code'}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleUseDifferentEmail}
                className="w-full text-center text-sm text-text-dark-muted hover:text-text-dark transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border-light text-center">
            <p className="text-text-dark-muted text-sm">
              Don't have an order yet?{' '}
              <Link to="/app/step-1" className="text-primary hover:underline font-medium">
                Start Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;