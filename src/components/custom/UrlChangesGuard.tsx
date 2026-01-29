import { useBlocker } from 'react-router';
import AlertDialog from './AlertDialog';
import { useEffect } from 'react';

const UrlChangesGuard = ({ isDirty, setDirty }: { isDirty: boolean; setDirty: (dirty: boolean) => void }) => {
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  if (blocker.state === 'blocked') {
    return (
      <AlertDialog
        options={{
          open: true,
          text: 'Are you sure you want to leave this page?',
          type: 'CONFIRM',
          onClose: (result: 'CONFIRM' | 'CANCEL') => {
            if (result === 'CONFIRM') {
              blocker?.proceed();
              setDirty(false);
            } else {
              blocker?.reset();
            }
          },
        }}
      />
    );
  }
  return null;
};

export default UrlChangesGuard;
