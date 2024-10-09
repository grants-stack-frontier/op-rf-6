'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  getRetroFundingRoundBallotById,
  updateRetroFundingRoundCategoryAllocation,
  type getRetroFundingRoundBallotByIdResponse,
  type updateRetroFundingRoundCategoryAllocationResponse,
} from '@/__generated__/api/agora';
import type {
  RetroFundingBallotCategoriesAllocation,
  Round5Ballot,
} from '@/__generated__/api/agora.schemas';
import { useToast } from '@/components/ui/use-toast';
import type { Round5Allocation } from '@/types/shared';

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
        (response: getRetroFundingRoundBallotByIdResponse) => {
          const ballot = response.data as Round5Ballot;
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
    mutationFn: async (allocation: Round5Allocation) => {
      if (!address) throw new Error('No address provided');
      return updateRetroFundingRoundCategoryAllocation(
        roundId,
        address,
        allocation
      ).then((response: updateRetroFundingRoundCategoryAllocationResponse) => {
        const updatedBallot = response.data as Round5Ballot;
        // Update the query data with the full structure
        queryClient.setQueryData(
          ['budget', address, roundId],
          (_: unknown) => ({
            budget: updatedBallot.budget,
            allocations: updatedBallot.category_allocations,
          })
        );
        return updatedBallot.category_allocations;
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
