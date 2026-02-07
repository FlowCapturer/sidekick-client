import { useRef, useState } from 'react';
import { TooltipContent, TooltipTrigger, Tooltip } from '../ui/tooltip';

export interface ITooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  triggerOn?: 'default' | 'click';
  delayDuration?: number;
  canShowTooltip?: boolean;
  contentProps?: React.ComponentProps<typeof TooltipContent>;
  rootProps?: React.ComponentProps<typeof Tooltip>;
  triggerProps?: React.ComponentProps<typeof TooltipTrigger>;
}

export const TooltipWrapper = ({
  content,
  side = 'bottom',
  rootProps,
  contentProps,
  triggerProps,
  children,
  canShowTooltip = true,
  delayDuration = 100,
  triggerOn = 'default',
}: ITooltipProps) => {
  const [isOpen, setIsOpen] = useState<boolean | undefined>(() => {
    if (triggerOn === 'default') {
      return canShowTooltip ? undefined : false;
    }
    return false;
  });

  const triggerCmpRef = useRef<HTMLButtonElement | null>(null);

  const isTooltipTriggerClicked = (event?: Event) => {
    const target = event?.target as HTMLElement;

    return target && triggerCmpRef.current && triggerCmpRef.current?.contains(target);
  };

  const closeTooltip = (event?: Event) => {
    if (triggerOn !== 'click') return;

    if (isTooltipTriggerClicked(event)) return;

    setIsOpen(false);
  };

  return (
    <Tooltip open={isOpen} delayDuration={delayDuration} {...rootProps}>
      <TooltipTrigger
        data-testid="tooltip-trigger"
        asChild
        ref={triggerCmpRef}
        onClick={() => {
          if (triggerOn === 'click') {
            setIsOpen(canShowTooltip && !isOpen);
          }
        }}
        {...triggerProps}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} data-testid="tooltip-content" onPointerDownOutside={closeTooltip} onEscapeKeyDown={closeTooltip} {...contentProps}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
};
