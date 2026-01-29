import { mapIncrementBy2 } from '@/lib/utils';
import type { JSX } from 'react';

interface ITabularLayout {
  child: JSX.Element[];
  className?: string;
  rowCls?: string;
  leftCls?: string;
  rightCls?: string;
}

const TabularLayout = ({ child, className, rowCls, leftCls, rightCls }: ITabularLayout) => {
  return (
    <div className={`w-full ${className || ''}`}>
      {mapIncrementBy2(child, (firstEl, secondEl, index) => (
        <div key={index + 'tabularLayout'} className={`flex w-full ${rowCls || ''}`}>
          <div className={`flex-shrink-0 ${leftCls || ''}`}>{firstEl}</div>
          <div className={`flex-1 min-w-0 ${rightCls || ''}`}>{secondEl}</div>
        </div>
      ))}
    </div>
  );
};

export default TabularLayout;
