'use client';

import { type ComponentProps } from 'react';
import { useAccount } from 'wagmi';

import {
  DistributionMethod,
  useDistributionMethodFromLocalStorage,
  useDistributionMethod,
  saveDistributionMethodToLocalStorage,
} from '@/hooks/useBallotRound5';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function ChangeAllocationMethodDialog({
  isOpen,
  onOpenChange,
  distributionMethod,
}: ComponentProps<typeof Dialog> & {
  isOpen: boolean;
  distributionMethod: DistributionMethod;
}) {
  const { address } = useAccount();
  const { mutate: saveDistributionMethod } = useDistributionMethod();
  const { refetch } = useDistributionMethodFromLocalStorage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[458px]">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to select this allocation method?
          </DialogTitle>
          <DialogDescription>
            You&apos;ll lose any customizations you&apos;ve made.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              saveDistributionMethodToLocalStorage(distributionMethod, address);
              if (
                distributionMethod === DistributionMethod.IMPACT_GROUPS ||
                distributionMethod === DistributionMethod.TOP_TO_BOTTOM ||
                distributionMethod === DistributionMethod.TOP_WEIGHTED
              ) {
                saveDistributionMethod(distributionMethod);
              }
              refetch();
              onOpenChange?.(false);
            }}
          >
            Select allocation method
          </Button>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
