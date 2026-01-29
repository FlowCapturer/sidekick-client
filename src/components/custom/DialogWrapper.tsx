import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { JSX, ReactNode } from 'react';

interface DialogWrapperProps {
  open: boolean;
  setIsOpen: (isOpen: boolean) => void;
  header: string;
  children: ReactNode;
  actionsJSX: JSX.Element;
  disableOutsideClick?: boolean;
  dlgContentClsName?: string;
}

const DialogWrapper = ({ open, setIsOpen, header, children, actionsJSX, disableOutsideClick = false, dlgContentClsName }: DialogWrapperProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => setIsOpen(isOpen === true)}>
      <DialogContent
        aria-describedby={'dialog-content'}
        onPointerDownOutside={(e) => {
          if (disableOutsideClick) {
            e.preventDefault();
          }
        }}
        className={dlgContentClsName}
      >
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter>{actionsJSX}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;
