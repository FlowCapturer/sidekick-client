import { useImperativeHandle, useRef, useTransition, type Ref } from 'react';
import { sendOTP, type sendOTPInf } from '../utils/auth-lib';
import { errorLogger, getFormDataByFormEl } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SendOTPProps {
  handleOnOTPSent: (reqObj: { email: string }) => void;
  ref: Ref<any>;
  gridCls: string;
  hidden: boolean;
  path: string;
}

const SendOTP = ({ handleOnOTPSent, ref, gridCls, hidden, path }: SendOTPProps) => {
  const emailField = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  useImperativeHandle(
    ref,
    () => {
      return {
        focus() {
          emailField.current?.focus();
        },
      };
    },
    [],
  );

  const handleOnEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data: Record<string, FormDataEntryValue> = getFormDataByFormEl(event.currentTarget);

    const reqObj: sendOTPInf = {
      email: (data.email as string) || '',
    };

    startTransition(async () => {
      try {
        await sendOTP(path, reqObj);

        handleOnOTPSent(reqObj);
      } catch (error) {
        errorLogger(error);
      }
    });
  };

  return (
    <form onSubmit={handleOnEmailSubmit} className={`grid gap-5 ${hidden && 'hidden'}`}>
      <div className={gridCls}>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" name="email" placeholder="mail@example.com" ref={emailField} required />
      </div>
      <Button type="submit" className="w-full" loading={isPending}>
        Generate OTP
      </Button>
    </form>
  );
};

export default SendOTP;
