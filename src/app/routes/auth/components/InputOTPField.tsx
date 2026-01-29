import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { useCountdown } from '@/hooks/useCountDown';
import type { Ref } from 'react';

interface InputOTPFieldProps {
  className: string;
  inputOTPField: Ref<any>;
  otp: string;
  setOtp: (otp: string) => void;
  onChangeEmailClick: () => void;
}

const InputOTPField = ({ className, inputOTPField, otp, setOtp, onChangeEmailClick }: InputOTPFieldProps) => {
  const secondLeft = useCountdown();
  return (
    <div className={className}>
      <Label htmlFor="otp">Enter OTP *</Label>

      <InputOTP maxLength={4} name="otp" id="otp" ref={inputOTPField} value={otp} onChange={setOtp}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <span className="text-xs underline-offset-4 italic">
        {secondLeft > 0 ? (
          <span className="muted-foreground">You can resend the OTP in {secondLeft} seconds.</span>
        ) : (
          <span className="hover:underline cursor-pointer" onClick={() => onChangeEmailClick()}>
            Didn't receive the OTP? Send again.
          </span>
        )}
      </span>
    </div>
  );
};

export default InputOTPField;
