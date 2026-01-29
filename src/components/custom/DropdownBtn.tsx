import type React from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui';
import { ChevronDown } from 'lucide-react';

interface IDropdownItem {
  label: string | React.ReactNode;
  value: string;
}

interface IDropdownBtnProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  items: IDropdownItem[];
  onItemSelect?: (item: IDropdownItem) => void;
  disabled?: boolean;
}

export const DropdownBtn = ({ label, children, items, onItemSelect, disabled }: IDropdownBtnProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {children ? (
          children
        ) : (
          <Button className="flex items-center gap-1">
            {label} <ChevronDown size={15} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => onItemSelect?.(item)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
