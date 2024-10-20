'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  getRetroFundingRoundBallotById,
  updateRetroFundingRoundCategoryAllocation,
} from '@/__generated__/api/agora';
import type {
  RetroFundingBallotCategoriesAllocation,
  Ballot,
  UpdateRetroFundingRoundCategoryAllocationBody,
} from '@/__generated__/api/agora.schemas';
import { useToast } from '@/components/ui/use-toast';

export function useBudget(roundId: number) {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const getBudget = useQuery({
    enabled: Boolean(address),
    queryKey: ['budget', address, roundId],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      return getRetroFundingRoundBallotById(roundId, address).then(
        (response) => {
          const ballot = response as Ballot;
          return {
            budget: ballot.budget,
            allocations:
              ballot.category_allocations as RetroFundingBallotCategoriesAllocation[],
          };
        }
      );
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const saveAllocation = useMutation({
    mutationKey: ['save-budget', roundId],
    mutationFn: async (
      allocation: UpdateRetroFundingRoundCategoryAllocationBody
    ) => {
      if (!address) throw new Error('No address provided');
      return updateRetroFundingRoundCategoryAllocation(
        roundId,
        address,
        allocation
      ).then((ballot) => {
        queryClient.setQueryData(
          ['budget', address, roundId],
          (_: unknown) => ({
            budget: ballot.budget,
            allocations: ballot.category_allocations,
          })
        );
        return ballot.category_allocations;
      });
    },
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Error saving budget allocation',
      }),
  });

  return {
    getBudget,
    saveAllocation,
  };
}
