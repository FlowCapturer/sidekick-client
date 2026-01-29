import React, { useState } from 'react';
import DialogWrapper from './DialogWrapper';
import { Button } from '../ui';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface ToolbarProps {
  leftItems?: React.ReactNode[];
  centerItems?: React.ReactNode[];
  rightItems?: React.ReactNode[];
  className?: string;
  style?: React.CSSProperties;
  menuProps?: object;
}

export const Toolbar: React.FC<ToolbarProps> = ({ leftItems = [], centerItems = [], rightItems = [], className = '', style = {} }) => {
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Combine all items for menu in mobile
  const allMenuItems = [...leftItems, ...centerItems, ...rightItems];

  return (
    <div className={`flex items-center w-full ${className}`} style={{ minHeight: 48, ...style }}>
      {isMobile ? (
        <div className="flex w-full justify-end items-center">
          <Button type="button" onClick={() => setDialogOpen(true)}>
            <Menu />
          </Button>
          <DialogWrapper open={dialogOpen} setIsOpen={setDialogOpen} header={'Menu'} actionsJSX={<></>} disableOutsideClick={false}>
            <div className="flex flex-col gap-5 mt-2">
              {allMenuItems.map((item, idx) => (
                <div key={idx}>{item}</div>
              ))}
            </div>
          </DialogWrapper>
        </div>
      ) : (
        <>
          {leftItems.length > 0 && <div className="flex flex-1 items-center gap-2 justify-start px-1">{leftItems}</div>}
          {centerItems.length > 0 && <div className="flex flex-1 items-center gap-2 justify-center px-1">{centerItems}</div>}
          {rightItems.length > 0 && <div className="flex flex-1 items-center gap-2 justify-end px-1">{rightItems}</div>}
        </>
      )}
    </div>
  );
};
