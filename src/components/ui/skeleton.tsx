import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
        'bg-[length:400%_100%]',
        'rounded',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
