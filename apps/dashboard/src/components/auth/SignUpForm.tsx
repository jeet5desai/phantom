import { useState } from 'react';
import { useSignUp, useClerk } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function SignUpForm() {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const navigate = useNavigate();
  const signUpLoaded = !!signUp;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!signUpLoaded || !signUp) return;
    setIsGoogleLoading(true);
    setError('');
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      let msg = 'Failed to authenticate with Google';
      if (err instanceof Error) msg = err.message;
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = (err as { errors: Array<{ message: string }> }).errors;
        if (errors?.[0]?.message) msg = errors[0].message;
      }
      setError(msg);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded || !signUp) return;

    setIsSubmitLoading(true);
    setError('');

    try {
      const [firstName, ...lastNames] = name.trim().split(' ');
      const lastName = lastNames.join(' ');

      await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || '',
        lastName: lastName || '',
      });

      // Send the email verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setPendingVerification(true);
    } catch (err: unknown) {
      let msg = 'Something went wrong during sign up';
      if (err instanceof Error) msg = err.message;
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = (err as { errors: Array<{ message: string }> }).errors;
        if (errors?.[0]?.message) msg = errors[0].message;
      }
      setError(msg);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded || !signUp) return;

    setIsVerifyLoading(true);
    setError('');

    try {
      const verifyResult = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (verifyResult.status === 'complete') {
        await setActive({
          session: verifyResult.createdSessionId,
          beforeEmit: () => navigate('/'),
        });
      } else {
        setError('Verification failed.');
        setIsVerifyLoading(false);
      }
    } catch (err: unknown) {
      let msg = 'Invalid verification code';
      if (err instanceof Error) msg = err.message;
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = (err as { errors: Array<{ message: string }> }).errors;
        if (errors?.[0]?.message) msg = errors[0].message;
      }
      setError(msg);
      setIsVerifyLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md min-w-[400px] sm:min-w-[500px] p-8 glass rounded-xl border border-border flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold mb-2 text-text-primary">Create Account</h1>
          <p className="text-text-secondary text-sm">Join AgentKey today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-warning-bg text-warning text-sm font-medium border border-warning/20">
            {error}
          </div>
        )}

        <div id="clerk-captcha" key="clerk-captcha"></div>

        {!pendingVerification ? (
          <>
            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={isGoogleLoading || isSubmitLoading}
              className="mb-4 w-full flex items-center justify-center gap-3 bg-surface border border-border hover:bg-surface-hover text-text-primary font-bold py-2.5 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}
            </button>

            <div className="relative flex items-center py-2 mb-4">
              <div className="grow border-t border-border"></div>
              <span className="shrink-0 mx-4 text-text-tertiary text-xs font-bold uppercase tracking-wider">
                or continue with
              </span>
              <div className="grow border-t border-border"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-text-primary">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent-primary transition-colors text-text-primary"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-text-primary">Email</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent-primary transition-colors text-text-primary"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-text-primary">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent-primary transition-colors text-text-primary"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitLoading || isGoogleLoading}
                className="mt-2 w-full flex justify-center items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-2.5 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4 w-full">
            <p className="text-sm text-text-primary mb-2 text-center">
              We sent a verification code to <span className="font-bold">{email}</span>.
            </p>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-text-primary">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 outline-none focus:border-accent-primary transition-colors text-text-primary text-center tracking-widest text-lg"
                placeholder="123456"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyLoading}
              className="mt-2 w-full flex justify-center items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-2.5 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isVerifyLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {!pendingVerification && (
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-accent-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
