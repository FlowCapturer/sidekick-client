import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Label } from '../ui';

export interface IDropdownItem {
  label: string;
  value: string;
}

interface IDropdownLblProps {
  label?: string;
  selectedRec: IDropdownItem;
  setSelectedRec: (value: IDropdownItem) => void;
  items: IDropdownItem[];
}

export const DropdownLbl = ({ label, selectedRec, setSelectedRec, items }: IDropdownLblProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2">
          {label && <Label className="whitespace-nowrap">{label}</Label>}
          <span className="whitespace-nowrap text-primary flex items-center gap-1 text-sm cursor-pointer">
            {selectedRec.label} <ChevronDown size={15} />
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => setSelectedRec(item)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
