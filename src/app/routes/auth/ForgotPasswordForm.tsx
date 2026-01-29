import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { errorLogger, getFormDataByFormEl, validatePassword } from '@/lib/utils';
import { useEffect, useImperativeHandle, useRef, useState, useTransition, type Ref } from 'react';
import { NavLink, useNavigate } from 'react-router';
import PasswordPolicyIBtn from './components/PasswordPolicyIBtn';
import { getAxiosInstance } from '@/lib/axios-utils';
import SendOTP from './components/SendOTP';
import InputOTPField from './components/InputOTPField';

interface ResetFormProps {
  ref: Ref<{}>;
  gridCls: string;
  onChangeEmailClick: () => void;
  email: string;
}

const ResentForm = ({ ref, gridCls, onChangeEmailClick, email }: ResetFormProps) => {
  const [otp, setOtp] = useState('');
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const inputOTPFieldRef = useRef<HTMLInputElement>(null);

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    const isValid = validatePassword(reqObj.password as string);

    if (isValid.valid === false) {
      showErrorToast({
        header: 'Password Policy',
        description: isValid.message,
      });
      return;
    }

    if (reqObj.password !== reqObj.user_password) {
      showErrorToast({
        header: 'Password and Confirm Password fields contain different passwords.',
        description: '',
      });
      return;
    }

    startTransition(async () => {
      try {
        delete reqObj.password;

        await getAxiosInstance().put('/reset-password', reqObj);

        showSuccessToast({
          header: 'Your password has been reset successfully!',
          description: 'Please log in using your new password.',
        });

        navigate('/login');
      } catch (error) {
        errorLogger(error);
      }
    });
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        focus() {
          inputOTPFieldRef.current?.focus();
        },
      };
    },
    [],
  );

  return (
    <form onSubmit={handleOnSubmit} className="grid gap-6">
      <div className={gridCls}>
        <Label htmlFor="emailOTPGenerated">Email *</Label>
        <Input id="emailOTPGenerated" type="email" name="user_email" placeholder="mail@example.com" value={email} disabled required />
        <span className="ml-auto text-xs underline-offset-4 hover:underline cursor-pointer italic" onClick={() => onChangeEmailClick()}>
          Change Email
        </span>
      </div>

      <InputOTPField className={gridCls} inputOTPField={inputOTPFieldRef} otp={otp} setOtp={setOtp} onChangeEmailClick={onChangeEmailClick} />

      <div className={gridCls}>
        <Label htmlFor="password">
          New Password * <PasswordPolicyIBtn />
        </Label>
        <Input id="password" type="password" name="password" placeholder="**********" required />
      </div>
      <div className={gridCls}>
        <Label htmlFor="cnf-password">Confirm Password *</Label>
        <Input id="cnf-password" type="password" name="user_password" placeholder="**********" required />
      </div>
      <Button type="submit" className="w-full" size={'lg'} loading={isPending}>
        Reset Password
      </Button>
    </form>
  );
};

export default function ForgotPasswordForm() {
  const sendOTPCmp = useRef<HTMLInputElement>(null);
  const resetFormCmp = useRef<HTMLInputElement>(null);
  const [isOTPGenerated, setIsOTPGenerated] = useState(false);
  const [email, setEmail] = useState('');
  const gridCls = 'grid gap-1';

  useEffect(() => {
    if (isOTPGenerated) {
      resetFormCmp.current?.focus();
    } else {
      sendOTPCmp?.current?.focus();
    }
  }, [isOTPGenerated]);

  return (
    <div className="grid gap-6">
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-card text-muted-foreground relative z-10 px-2">Forgot Password</span>
      </div>

      <SendOTP
        ref={sendOTPCmp}
        handleOnOTPSent={(reqObj) => {
          setIsOTPGenerated(true);
          setEmail(reqObj.email);
        }}
        gridCls={gridCls}
        hidden={isOTPGenerated}
        path="forgot-password"
      />

      {isOTPGenerated && <ResentForm ref={resetFormCmp} gridCls={gridCls} onChangeEmailClick={() => setIsOTPGenerated(false)} email={email} />}

      <div className="text-center text-sm">
        Already have an account?{' '}
        <NavLink to="/login">
          <span className="underline underline-offset-4">Login</span>
        </NavLink>
      </div>
    </div>
  );
}
