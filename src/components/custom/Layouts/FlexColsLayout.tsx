import type { HTMLAttributes } from 'react';
import LoadingMask from '../LoadingMask';

interface FlexColsLayoutProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  layout?: 'horizontal' | 'vertical';
  loading?: boolean;
  doNotAppendFlex1?: boolean;
  responsive?: boolean;
}

const FlexColsLayout = ({ className, layout = 'vertical', loading, doNotAppendFlex1 = false, responsive = false, ...props }: FlexColsLayoutProps) => {
  const layoutCls = layout === 'horizontal' ? (responsive === true ? 'sm:flex-row flex-col' : 'flex-row') : 'flex-col';
  const flex1 = doNotAppendFlex1 ? '' : 'flex-1';

  const container = (cls?: string) => (
    <div className={`${flex1} flex ${layoutCls} items-stretch overflow-auto ${cls || ''} ${className}`} {...props} />
  );

  if (!loading) {
    return container();
  }

  const loadingCls = loading ? 'pointer-events-none opacity-50' : '';
  return (
    <div className="relative flex-1">
      {loading && <LoadingMask />}
      {container(loadingCls)}
    </div>
  );
};

export default FlexColsLayout;
