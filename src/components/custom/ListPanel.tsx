import type { JSX } from 'react';
import { Label } from '../ui/label';

interface ListPanelInf {
  title: string;
  description: string;
  control?: JSX.Element;
  labelCls?: string;
  className?: string;
}

const ListPanel = ({ title, description, control, labelCls = '', className = '' }: ListPanelInf) => {
  return (
    <div className={`flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm ${className}`}>
      <div className="flex-1 space-y-2">
        <Label className={`cursor-pointer ${labelCls}`}>{title}</Label>
        <Label className={`font-normal text-gray-500 cursor-pointer ${labelCls}`}>{description}</Label>
      </div>
      <div>{control}</div>
    </div>
  );
};

export default ListPanel;
