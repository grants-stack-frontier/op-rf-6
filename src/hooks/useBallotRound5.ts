'use client';

import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import { submitRetroFundingBallot } from '@/__generated__/api/agora';
import type {
  RetroFunding5BallotSubmissionContent,
  SubmitRetroFundingBallotBody,
} from '@/__generated__/api/agora.schemas';
import { useBallotRound5Context } from '@/components/ballot/provider5';
import { useToast } from '@/components/ui/use-toast';
import { agoraRoundsAPI } from '@/config';
import { request } from '@/lib/request';
import type { CategoryId } from '@/types/shared';

export type Round5CategoryAllocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};

export type Round5ProjectAllocation = {
  project_id: string;
  name: string;
  image: string;
  position: number;
  allocation: number;
  impact: number;
};

export type Round5BallotStatus =
  | 'NOT STARTED'
  | 'RANKED'
  | 'PENDING SUBMISSION'
  | 'SUBMITTED';

export type Round5Ballot = {
  address: string;
  round_id: number;
  status: Round5BallotStatus;
  budget?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  submitted_at?: string;
  category_allocations: Round5CategoryAllocation[];
  project_allocations: Round5ProjectAllocation[];
  projects_to_be_evaluated: string[];
  total_projects: number;
  payload_for_signature?: RetroFunding5BallotSubmissionContent;
  distribution_method?: string;
};

export function useRound5Ballot(address?: string) {
  return useQuery({
    enabled: Boolean(address),
    queryKey: ['ballot-round5', address],
    queryFn: async () =>
      request
        .get(`${agoraRoundsAPI}/ballots/${address}`)
        .json<Round5Ballot>()
        .then((r) => r ?? null),
  });
}

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
        .json<Round5Ballot>()
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
  const { refetch } = useRound5Ballot(address);
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: ballot } = await refetch();
      const ballot_content = ballot?.payload_for_signature;
      const signature = await signMessageAsync({
        message: JSON.stringify(ballot_content),
      });

      let submission;

      if (address) {
        try {
          submission = await submitRetroFundingBallot(5, address, {
            address,
            ballot_content,
            signature,
          });
          if (submission.status !== 200) {
            throw new Error('Failed submitting ballot', {
              cause: submission.status,
            });
          }
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
        .json<Round5Ballot>();
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
        .json<Round5Ballot>()
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
    if (!ballot || !ballot.project_allocations) return 0;

    let sum = 0;
    for (let i = 0; i < ballot.project_allocations.length; i++) {
      const allocation = ballot.project_allocations[i].allocation;
      sum += Math.round(allocation * 100);
    }
    return sum / 100;
  }, [ballot]);

  return allocationSum;
}
