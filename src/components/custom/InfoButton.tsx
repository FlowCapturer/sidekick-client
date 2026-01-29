import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface InfoButtonProps {
  children: ReactNode;
  side: 'right' | 'left' | 'top' | 'bottom';
}

const InfoButton = ({ children, side }: InfoButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="ml-2 align-middle cursor-pointer">
          <Button variant={'link'} className="-ml-5" type="button" tabIndex={-1}>
            <InfoIcon />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side={side}>{children}</TooltipContent>
    </Tooltip>
  );
};

export default InfoButton;
