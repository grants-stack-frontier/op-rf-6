'use client';

import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import {
  useGetRetroFundingRoundBallotById,
  useUpdateRetroFundingRoundProjectAllocation,
  useSubmitRetroFundingBallot,
  useUpdateRetroFundingRoundProjectPosition,
  useUpdateRetroFundingBallotDistributionMethod,
} from '@/__generated__/api/agora';
import { Ballot } from '@/__generated__/api/agora.schemas';
import { useToast } from '@/components/ui/use-toast';
import { ROUND } from '@/config';
import { useBallotRound5Context } from '@/contexts/BallotRound5Context';

export function useSaveRound5Allocation() {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { mutate: updateAllocation, ...updateAllocationMutation } =
    useUpdateRetroFundingRoundProjectAllocation({
      mutation: {
        onError: () =>
          toast({ variant: 'destructive', title: 'Error saving ballot' }),
        onSuccess: (data) => {
          queryClient.setQueryData(['ballot-round6', address], data);
        },
      },
    });

  return {
    ...updateAllocationMutation,
    mutate: (allocation: { project_id: string; allocation: number }) => {
      if (address) {
        updateAllocation({
          roundId: ROUND,
          addressOrEnsName: address,
          projectId: allocation.project_id,
          allocation: allocation.allocation.toString(),
        });
      }
    },
  };
}

export function useSubmitBallot({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { address } = useAccount();
  const { refetch } = useGetRetroFundingRoundBallotById(ROUND, address ?? '');
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const { mutateAsync: submitBallot, ...submitBallotMutation } =
    useSubmitRetroFundingBallot({
      mutation: {
        onSuccess,
        onError: () =>
          toast({ variant: 'destructive', title: 'Error submitting ballot' }),
      },
    });

  const submit = async () => {
    if (!address) return;

    const { data } = await refetch();
    const ballot = data as Ballot;
    const ballot_content = ballot?.payload_for_signature;
    const signature = await signMessageAsync({
      message: JSON.stringify(ballot_content),
    });

    await submitBallot({
      roundId: ROUND,
      addressOrEnsName: address,
      data: {
        address,
        ballot_content,
        signature,
      },
    });

    saveBallotSubmissionToLocalStorage({
      address,
      ballot_content,
      signature,
    });

    await queryClient.invalidateQueries({
      queryKey: ['ballot-round6', address],
    });
    await refetch();
  };

  return {
    ...submitBallotMutation,
    mutateAsync: submit,
  };
}

function saveBallotSubmissionToLocalStorage(submission: {
  address?: string;
  ballot_content: any;
  signature: string;
}) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'ballot-submission',
      JSON.stringify({
        submission,
        timestamp: Date.now(),
      })
    );
  }
}

export function useSaveRound5Position() {
  const { toast } = useToast();
  const { address } = useAccount();

  const { mutateAsync: updatePosition, ...updatePositionMutation } =
    useUpdateRetroFundingRoundProjectPosition({
      mutation: {
        onError: () =>
          toast({ variant: 'destructive', title: 'Error saving ballot' }),
      },
    });

  const mutateAsync = async (project: {
    project_id: string;
    position: number;
  }) => {
    if (!address) {
      throw new Error('No address available');
    }

    return updatePosition({
      roundId: ROUND,
      addressOrEnsName: address,
      projectId: project.project_id,
      position: project.position,
    });
  };

  return {
    ...updatePositionMutation,
    mutateAsync,
  };
}

export enum DistributionMethod {
  TOP_TO_BOTTOM = 'TOP_TO_BOTTOM',
  IMPACT_GROUPS = 'IMPACT_GROUPS',
  TOP_WEIGHTED = 'TOP_WEIGHTED',
  CUSTOM = 'CUSTOM',
}

export function saveDistributionMethodToLocalStorage(
  method: DistributionMethod | null,
  address?: string
) {
  if (typeof window !== 'undefined' && address) {
    const storageKey = `distributionMethod_${address.toLowerCase()}`;
    if (method === null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, method);
    }
  }
}

export function getDistributionMethodFromLocalStorage(
  address: string
): DistributionMethod | null {
  if (typeof window !== 'undefined') {
    const storageKey = `distributionMethod_${address.toLowerCase()}`;
    const savedMethod = localStorage.getItem(storageKey);
    return savedMethod as DistributionMethod | null;
  }
  return null;
}

export function useDistributionMethodFromLocalStorage() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const query = useGetRetroFundingRoundBallotById(ROUND, address ?? '', {
    query: {
      select: () => getDistributionMethodFromLocalStorage(address ?? ''),
      enabled: !!address,
    },
  });

  const { mutate: updateDistributionMethod } =
    useUpdateRetroFundingBallotDistributionMethod();

  const update = (method: DistributionMethod | null) => {
    if (address && method) {
      updateDistributionMethod({
        roundId: ROUND,
        addressOrEnsName: address,
        distributionMethod: method as 'IMPACT_GROUPS' | 'TOP_TO_BOTTOM',
      });
      saveDistributionMethodToLocalStorage(method, address);
      queryClient.setQueryData(['ballot-round6', address], (oldData: any) => ({
        ...oldData,
        distribution_method: method,
      }));
    }
  };

  const reset = () => {
    update(null);
  };

  return {
    ...query,
    update,
    reset,
  };
}

export function useDistributionMethod() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    mutate: updateDistributionMethod,
    ...updateDistributionMethodMutation
  } = useUpdateRetroFundingBallotDistributionMethod({
    mutation: {
      onMutate: () => toast({ title: 'Loading', loading: true }),
      onError: () =>
        toast({
          variant: 'destructive',
          title: 'Error setting distribution method',
        }),
      onSuccess: (data) => {
        queryClient.setQueryData(['ballot-round6', address], data);
        if (address) {
          const method = getDistributionMethodFromLocalStorage(address);
          if (method) {
            saveDistributionMethodToLocalStorage(method, address);
          }
        }
      },
    },
  });

  return {
    ...updateDistributionMethodMutation,
    mutate: (distribution_method: DistributionMethod) => {
      if (address) {
        updateDistributionMethod({
          roundId: ROUND,
          addressOrEnsName: address,
          distributionMethod: distribution_method as
            | 'IMPACT_GROUPS'
            | 'TOP_TO_BOTTOM',
        });
      }
    },
  };
}

export function useIsSavingRound5Ballot() {
  return Boolean(useIsMutating({ mutationKey: ['save-round6-ballot'] }));
}

export function useRound5BallotWeightSum() {
  const { ballot } = useBallotRound5Context();

  const allocationSum = useMemo(() => {
    if (!ballot || !ballot.projects_allocations) return 0;

    let sum = 0;
    for (let i = 0; i < ballot.projects_allocations.length; i++) {
      const allocation = ballot.projects_allocations[i].allocation ?? 0;
      sum += Math.round(allocation * 100);
    }
    return sum / 100;
  }, [ballot]);

  return allocationSum;
}
