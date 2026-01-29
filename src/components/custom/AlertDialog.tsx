import { DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DialogWrapper from './DialogWrapper';
import useAlertDialog from '@/hooks/useAlertDialog';
import type { JSX } from 'react';

export interface AlertDialogOptionsProps {
  open: boolean;
  text: JSX.Element | string;
  onClose?: (result: 'CONFIRM' | 'CANCEL') => void;
  type: 'ALERT' | 'CONFIRM';
}

interface AlertDialogProps {
  options: AlertDialogOptionsProps;
}

const AlertDialog = ({ options }: AlertDialogProps) => {
  const dlg = useAlertDialog();

  const closeDlg = () => {
    dlg.closeAlertBox();
    if (options.onClose) options.onClose('CANCEL');
  };

  const confirmDlg = () => {
    dlg.closeAlertBox();
    if (options.onClose) options.onClose('CONFIRM');
  };

  return (
    <DialogWrapper
      open={options.open}
      setIsOpen={closeDlg}
      header={options.type === 'ALERT' ? 'Alert' : 'Confirmation'}
      actionsJSX={
        <>
          <Button onClick={closeDlg} variant={'ghost'}>
            Cancel
          </Button>
          {options.type === 'CONFIRM' && <Button onClick={confirmDlg}>Confirm</Button>}
        </>
      }
    >
      <DialogDescription className="mt-3">{options.text}</DialogDescription>
    </DialogWrapper>
  );
};

export default AlertDialog;
