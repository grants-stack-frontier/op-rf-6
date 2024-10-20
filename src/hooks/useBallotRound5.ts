'use client';

import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import {
  submitRetroFundingBallot,
  useGetRetroFundingRoundBallotById,
} from '@/__generated__/api/agora';
import type {
  Ballot,
  SubmitRetroFundingBallotBody,
} from '@/__generated__/api/agora.schemas';
import { useToast } from '@/components/ui/use-toast';
import { agoraRoundsAPI, ROUND } from '@/config';
import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { request } from '@/lib/request';

export function useSaveRound5Allocation() {
  const { toast } = useToast();
  const { address } = useAccount();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['save-round5-ballot'],
    mutationFn: async (allocation: {
      project_id: string;
      allocation: number;
    }) => {
      const res = await request
        .post(
          `${agoraRoundsAPI}/ballots/${address}/projects/${allocation.project_id}/allocation/${allocation.allocation}`,
          {}
        )
        .json<Ballot>()
        .then((r) => {
          queryClient.setQueryData(['ballot-round5', address], r);
          return r;
        });
      return res;
    },
    // onSuccess: debounceToast,
    onError: () =>
      toast({ variant: 'destructive', title: 'Error saving ballot' }),
  });
}

export function useSubmitBallot({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { address } = useAccount();
  const { refetch } = useGetRetroFundingRoundBallotById(6, address ?? '');
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await refetch();
      const ballot = data as Ballot;
      const ballot_content = ballot?.payload_for_signature;
      const signature = await signMessageAsync({
        message: JSON.stringify(ballot_content),
      });

      let submission;

      if (address) {
        try {
          submission = await submitRetroFundingBallot(ROUND, address, {
            address,
            ballot_content,
            signature,
          });
        } catch (error) {
          console.error(error);
          throw new Error('Error submitting ballot');
        }
      }

      saveBallotSubmissionToLocalStorage({
        address,
        ballot_content,
        signature,
      });

      await queryClient.invalidateQueries({
        queryKey: ['ballot-round5', address],
      });
      await refetch();

      return submission;
    },
    onSuccess,
    onError: () =>
      toast({ variant: 'destructive', title: 'Error submitting ballot' }),
  });
}

function saveBallotSubmissionToLocalStorage(
  submission: SubmitRetroFundingBallotBody
) {
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

  return useMutation({
    mutationKey: ['save-round5-position'],
    mutationFn: async (project: { id: string; position: number }) => {
      return request
        .post(
          `${agoraRoundsAPI}/ballots/${address}/projects/${project.id}/position/${project.position}`,
          {}
        )
        .json<Ballot>();
    },
    onError: () =>
      toast({ variant: 'destructive', title: 'Error saving ballot' }),
  });
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

  const query = useQuery({
    queryKey: ['distribution-method-local-storage', address],
    queryFn: () =>
      address ? getDistributionMethodFromLocalStorage(address) : null,
    enabled: !!address,
  });

  const update = useMutation({
    mutationFn: async (method: DistributionMethod | null) => {
      if (address) {
        saveDistributionMethodToLocalStorage(method, address);
      }
      return method;
    },
    onSuccess: (method) => {
      if (address) {
        queryClient.setQueryData(
          ['distribution-method-local-storage', address],
          method
        );
      }
    },
  });

  const reset = () => {
    update.mutate(null);
  };

  return {
    ...query,
    update: update.mutate,
    reset,
  };
}

export function useDistributionMethod() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['save-round5-distribution-method', address],
    mutationFn: async (distribution_method: DistributionMethod) => {
      const res = await request
        .post(
          `${agoraRoundsAPI}/ballots/${address}/distribution_method/${distribution_method}`,
          {}
        )
        .json<Ballot>()
        .then((r) => {
          queryClient.setQueryData(['ballot-round5', address], r);
          if (address) {
            saveDistributionMethodToLocalStorage(distribution_method, address);
          }
          return r;
        });
      return res;
    },
    onMutate: () =>
      toast({
        title: 'Loading',
        loading: true,
      }),
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Error setting distribution method',
      }),
  });
}

export function useIsSavingRound5Ballot() {
  return Boolean(useIsMutating({ mutationKey: ['save-round5-ballot'] }));
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
