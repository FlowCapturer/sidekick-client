import AppContext from '@/store/AppContext';
import { useContext, type JSX } from 'react';

export interface AlertConfigs {
  text: JSX.Element | string;
  onClose?: (result: 'CONFIRM' | 'CANCEL') => void;
  type: 'ALERT' | 'CONFIRM';
}

const useAlertDialog = () => {
  const appLevelContext = useContext(AppContext);

  const showAlertBox = (newOptions: AlertConfigs) => {
    appLevelContext.setAlertDlgOptions({
      ...newOptions,
      open: true,
    });
  };

  const closeAlertBox = () => {
    appLevelContext.setAlertDlgOptions({
      ...appLevelContext.alertDlgOptions,
      open: false,
    });
  };

  const showAlertDlgPromise = async (newOptions: AlertConfigs) => {
    return new Promise((resolve, reject) => {
      showAlertBox({
        ...newOptions,
        async onClose(result) {
          if (result !== 'CONFIRM') {
            reject(result);
            return;
          }
          resolve(result);
        },
      });
    });
  };

  return {
    showAlertBox,
    closeAlertBox,
    showAlertDlgPromise,
  };
};

export default useAlertDialog;
