import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appInfo } from '@/config/app-config';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { errorLogger, getFormDataByFormEl, validatePassword } from '@/lib/utils';
import { useEffect, useRef, useState, useTransition } from 'react';
import { NavLink, useNavigate } from 'react-router';
import PasswordPolicyIBtn from './components/PasswordPolicyIBtn';
import SendOTP from './components/SendOTP';
import InputOTPField from './components/InputOTPField';
import { getAxiosInstance } from '@/lib/axios-utils';

export default function RegistrationForm() {
  const sendOTPCmp = useRef<HTMLInputElement>(null);
  const gridCls = 'grid gap-1';
  const inputOTPFieldRef = useRef<HTMLInputElement>(null);
  const [isOTPGenerated, setIsOTPGenerated] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otp) {
      showErrorToast({
        header: 'OTP Required!',
        description: 'Please enter your OTP and try again.',
      });
      inputOTPFieldRef.current?.focus();
      return;
    }

    const reqObj = getFormDataByFormEl(event.currentTarget);
    reqObj.otp = otp;
    reqObj.user_email = email;

    const isValid = validatePassword(reqObj.user_password as string);

    if (isValid.valid === false) {
      showErrorToast({
        header: 'Password Policy',
        description: isValid.message,
      });
      return;
    }

    startTransition(async () => {
      try {
        await getAxiosInstance().post('user-registration', reqObj);

        showSuccessToast({
          header: `Welcome to ${appInfo.appName}`,
          description: 'Registration successful! Please log in to continue.',
        });

        navigate('/login');
      } catch (error) {
        errorLogger(error);
      }
    });
  };

  useEffect(() => {
    if (isOTPGenerated) {
      inputOTPFieldRef.current?.focus();
    } else {
      sendOTPCmp?.current?.focus();
    }
  }, [isOTPGenerated]);

  const reSendOTP = () => {
    setIsOTPGenerated(false);
  };

  return (
    <div className="grid gap-5">
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-card text-muted-foreground relative z-10 px-2">User Registration</span>
      </div>

      <SendOTP
        ref={sendOTPCmp}
        handleOnOTPSent={(reqObj) => {
          setIsOTPGenerated(true);
          setEmail(reqObj.email);
        }}
        gridCls={gridCls}
        hidden={isOTPGenerated}
        path="new-registration"
      />

      {isOTPGenerated && (
        <form onSubmit={handleOnSubmit} className={`grid gap-5`}>
          <div className={gridCls}>
            <Label htmlFor="emailOTPGenerated">Email *</Label>
            <Input id="emailOTPGenerated" type="email" name="email" placeholder="mail@example.com" value={email} disabled required />
            <span className="ml-auto text-xs underline-offset-4 hover:underline cursor-pointer italic" onClick={reSendOTP}>
              Change Email
            </span>
          </div>

          <InputOTPField className={gridCls} inputOTPField={inputOTPFieldRef} otp={otp} setOtp={setOtp} onChangeEmailClick={reSendOTP} />

          <div className="flex gap-4">
            <div className={gridCls + ' flex-1'}>
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="user_fname" type="text" required />
            </div>
            <div className={gridCls + ' flex-1'}>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="user_lname" type="text" required />
            </div>
          </div>
          <div className={gridCls}>
            <Label htmlFor="mobile">Mobile No</Label>
            <Input id="mobile" type="number" name="user_mobile_no" placeholder="98******88" />
          </div>
          <div className={gridCls}>
            <Label htmlFor="password">
              Set Password * <PasswordPolicyIBtn />
            </Label>
            <Input id="password" name="user_password" type="password" placeholder="**********" required />
          </div>
          <Button type="submit" className="w-full" size={'lg'} loading={isPending}>
            Create account
          </Button>
        </form>
      )}

      <div className="text-center text-sm">
        Already have an account?{' '}
        <NavLink to="/login">
          <span className="underline underline-offset-4">Login</span>
        </NavLink>
      </div>
    </div>
  );
}
