import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/services/api';

const RESEND_COOLDOWN = 60;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard/orders';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.requestOtp(email);
      setCodeSent(true);
      setResendCooldown(RESEND_COOLDOWN);
      toast.success("If your email is registered, you'll receive a code.");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await api.requestOtp(email);
      setResendCooldown(RESEND_COOLDOWN);
      toast.success("If your email is registered, you'll receive a code.");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, otp);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.error('Invalid or expired code. Please try again.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setCodeSent(false);
    setOtp('');
    setResendCooldown(0);
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          {/* Logo */}
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
                    className="pl-10 h-12 bg-white border-border-light text-text-dark placeholder:text-text-dark-muted focus:border-primary focus:ring-primary"
                  />
                </div>
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
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg text-text-dark" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg text-text-dark" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg text-text-dark" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg text-text-dark" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-lg text-text-dark" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-lg text-text-dark" />
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

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-primary hover:underline disabled:text-text-dark-muted disabled:no-underline disabled:cursor-default transition-colors"
                >
                  {resendCooldown > 0
                    ? `Resend code (${resendCooldown}s)`
                    : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-sm text-text-dark-muted hover:text-text-dark transition-colors"
                >
                  Use a different email
                </button>
              </div>
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
