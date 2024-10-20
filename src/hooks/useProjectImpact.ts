'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { useUpdateRetroFundingRoundProjectImpact } from '@/__generated__/api/agora';
import { useToast } from '@/components/ui/use-toast';
import { ROUND } from '@/config';
import { ImpactScore } from '@/types/project-scoring';

export function useSaveProjectImpact() {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { mutate: updateImpact, ...updateImpactMutation } =
    useUpdateRetroFundingRoundProjectImpact({
      mutation: {
        onSuccess: (ballot) => {
          queryClient.setQueryData(['ballot-round6', address], ballot);
          toast({
            title: 'Impact score was saved successfully!',
            variant: 'default',
          });
        },
        onError: () => {
          toast({
            title: 'Error saving impact score',
            variant: 'destructive',
          });
        },
      },
    });

  return {
    ...updateImpactMutation,
    mutateAsync: ({
      projectId,
      impact,
    }: {
      projectId: string;
      impact: ImpactScore;
    }) => {
      if (address) {
        updateImpact({
          roundId: ROUND,
          addressOrEnsName: address,
          projectId,
          impact: impact as number,
        });
      }
    },
  };
}
