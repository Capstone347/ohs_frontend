import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setCodeSent(true);
    toast.success('Code sent! Check your email.');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    
    setIsLoading(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success('Welcome back!');
    navigate('/app/orders');
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

              <button
                type="button"
                onClick={() => setCodeSent(false)}
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
