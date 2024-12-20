'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface DisabledTooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  isDisabled: boolean;
}

const DisabledTooltip: React.FC<DisabledTooltipProps> = ({
  children,
  content,
  isDisabled,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    if (isDisabled) {
      setOpen(true);
    }
  }, [isDisabled]);

  const handleMouseLeave = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip open={isDisabled && open}>
        <TooltipTrigger asChild>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ display: 'inline-block' }}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  DisabledTooltip,
};
