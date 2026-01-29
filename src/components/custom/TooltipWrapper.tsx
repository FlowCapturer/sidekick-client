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
  // If canShowTooltip is true AND triggerOn is "default", then ShadCN will manage the state internally (undefined).
  // Otherwise, we manage the open state manually.
  const [open, setOpen] = useState<boolean | undefined>(() => {
    if (triggerOn === 'default') {
      return canShowTooltip ? undefined : false;
    }
    return false;
  });

  const triggerComponentRef = useRef<HTMLButtonElement | null>(null);

  const isTooltipTriggerClicked = (event?: Event) => {
    const target = event?.target as HTMLElement;

    return target && triggerComponentRef.current && triggerComponentRef.current?.contains(target);
  };

  const closeTooltip = (event?: Event) => {
    if (triggerOn !== 'click') return;

    // Prevent closing if the click is on the trigger itself
    // The trigger's onClick will handle the toggle
    if (isTooltipTriggerClicked(event)) return;

    setOpen(false);
  };

  return (
    <Tooltip open={open} delayDuration={delayDuration} {...rootProps}>
      <TooltipTrigger
        data-testid="tooltip-trigger"
        asChild
        ref={triggerComponentRef}
        onClick={() => {
          if (triggerOn === 'click') {
            setOpen(canShowTooltip && !open);
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
