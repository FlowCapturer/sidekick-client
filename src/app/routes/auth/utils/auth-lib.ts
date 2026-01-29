import { getAxiosInstance } from '@/lib/axios-utils';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { errorLogger, isEmailValid } from '@/lib/utils';

interface responseInf {
  message: string;
}

export interface sendOTPInf {
  email: string;
}

export const sendOTP = async (path: string, reqObj: sendOTPInf) => {
  if (isEmailValid(reqObj.email) === false) {
    throw showErrorToast({
      header: 'Email is not valid.',
      description: 'Kindly recheck the email and try again.',
    });
  }

  try {
    const response: responseInf = await getAxiosInstance().post('/send-otp/' + path, reqObj);

    showSuccessToast({
      header: response.message || 'OTP has been sent successfully',
      description: 'Kindly enter below details to continue.',
    });
  } catch (error) {
    errorLogger(error);
    throw error;
  }
};
