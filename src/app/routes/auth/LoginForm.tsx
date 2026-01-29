import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAxiosInstance } from '@/lib/axios-utils';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import type { LoginCmd } from '@/lib/types';
import { errorLogger, getFormDataByFormEl, isEmailValid, setLocalStorage } from '@/lib/utils';
import { useEffect, useRef, useState, useTransition } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { appInfo } from '@/config/app-config';

export default function LoginForm() {
  const emailField = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const location = useLocation();
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const from = location.state?.from;
  const navigateTo = from ? `${from.pathname}${from.search}${from.hash}` : '/';
  const gridCls = 'grid gap-1';

  useEffect(() => {
    emailField?.current?.focus();
  }, []);

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!turnstileToken) {
      showErrorToast({
        header: 'Captcha not completed',
        description: 'Please complete the captcha to proceed.',
      });
      return;
    }

    const data = getFormDataByFormEl(event.currentTarget);

    const reqObj = {
      username: data.email,
      password: data.password,
      turnstileToken,
    };

    if (isEmailValid(reqObj.username as string) === false) {
      showErrorToast({
        header: 'Email is not valid.',
        description: 'Kindly recheck the email and try again.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const response: LoginCmd = await getAxiosInstance().post('/login', reqObj);

        const { api = '' } = response;

        if (!api) {
          showErrorToast({
            header: 'Something went wrong!',
            description: 'API Key not found.',
          });
          errorLogger('API key not found in login command.');
          return;
        }

        showSuccessToast({
          header: 'Welcome Back!',
          description: 'Login Successful.',
        });

        setLocalStorage('apiKey', api);
        navigate(navigateTo);
      } catch (error) {
        // Failed login - reset Turnstile to generate new token
        turnstileRef.current?.reset();
        setTurnstileToken('');

        errorLogger(error);
      }
    });
  };

  return (
    <div className="grid gap-6">
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-card text-muted-foreground relative z-10 px-2">Login</span>
      </div>

      <form onSubmit={handleOnSubmit} className="grid gap-6">
        <div className={gridCls}>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="mail@example.com" name="email" ref={emailField} required />
        </div>
        <div className={gridCls}>
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" name="password" placeholder="**********" required />
          <NavLink to="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline cursor-pointer">
            Forgot your password?
          </NavLink>
        </div>
        <div className="text-center">
          <Turnstile ref={turnstileRef} siteKey={appInfo.cloudFareKey} onSuccess={(token) => setTurnstileToken(token)} />
        </div>
        <Button type="submit" className="w-full" size={'lg'} loading={isPending}>
          Login
        </Button>
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <NavLink to="/register">
          <span className="underline underline-offset-4">Register</span>
        </NavLink>
      </div>
    </div>
  );
}
