'use client';

import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import { useBallotContext } from '@/components/ballot/provider';
import { useToast } from '@/components/ui/use-toast';
import { agoraRoundsAPI } from '@/config';
import { request } from '@/lib/request';
import { Round4Ballot, Round4Allocation } from '@/types/ballot';

export function useBallot(address?: string) {
  return useQuery({
    enabled: Boolean(address),
    queryKey: ['ballot', address],
    queryFn: async () =>
      request
        .get(`${agoraRoundsAPI}/ballots/${address}`)
        .json<Round4Ballot[]>()
        .then((r) => r?.[0] ?? null),
  });
}

export function useSaveAllocation() {
  const { toast } = useToast();
  const { address } = useAccount();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['save-ballot'],
    mutationFn: async (allocation: Round4Allocation) => {
      return request
        .post(`${agoraRoundsAPI}/ballots/${address}/impactMetrics`, {
          json: { ...allocation, metric_id: allocation['metric_id'] },
        })
        .json<Round4Ballot[]>()
        .then((r) => {
          queryClient.setQueryData(['ballot', address], r?.[0]);
          return r;
        });
    },
    // onSuccess: debounceToast,
    onError: () =>
      toast({ variant: 'destructive', title: 'Error saving ballot' }),
  });
}

export function useRemoveAllocation() {
  const { toast } = useToast();
  const { address } = useAccount();

  const queryClient = useQueryClient();

  const debounceToast = useRef(
    debounce(
      () => toast({ title: 'Your ballot is saved automatically' }),
      2000,
      { leading: true, trailing: false }
    )
  ).current;
  return useMutation({
    mutationKey: ['save-ballot', 'remove'],
    mutationFn: async (id: string) => {
      return request
        .delete(`${agoraRoundsAPI}/ballots/${address}/impactMetrics/${id}`)
        .json()
        .then(() =>
          queryClient.invalidateQueries({ queryKey: ['ballot', address] })
        );
    },
    onSuccess: debounceToast,
    onError: () =>
      toast({ variant: 'destructive', title: 'Error saving ballot' }),
  });
}

export const MAX_MULTIPLIER_VALUE = 3.0;
export function useOsMultiplier() {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const debouncedCall = useRef(
    debounce(
      (amount: number) =>
        request
          .post(
            `${agoraRoundsAPI}/ballots/${address}/osMultiplier/${amount}`,
            {}
          )
          .json<Round4Ballot[]>()
          .then(([ballot]) =>
            queryClient.setQueryData(['ballot', address], ballot)
          ),

      2000,
      { leading: false, trailing: true }
    )
  ).current;
  return useMutation({
    mutationFn: async (amount: number) => debouncedCall(amount),
    onError: () =>
      toast({ variant: 'destructive', title: 'Error updating multiplier' }),
  });
}

export function useSubmitBallot({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { address } = useAccount();
  const { refetch } = useBallot(address);
  const { signMessageAsync } = useSignMessage();
  return useMutation({
    mutationFn: async () => {
      const { data: ballot } = await refetch();
      const allocations = ballot?.allocations.map((alloc) => ({
        [alloc.metric_id]: alloc.allocation,
      }));
      const ballot_content = {
        allocations,
        os_only: ballot?.os_only,
        os_multiplier: ballot?.os_multiplier,
      };
      const signature = await signMessageAsync({
        message: JSON.stringify(ballot_content),
      });

      return request
        .post(`${agoraRoundsAPI}/ballots/${address}/submit`, {
          json: {
            address,
            ballot_content,
            signature,
          },
        })
        .json();
    },
    onSuccess,
    onError: () =>
      toast({ variant: 'destructive', title: 'Error publishing ballot' }),
  });
}

export function useIsSavingBallot() {
  return Boolean(useIsMutating({ mutationKey: ['save-ballot'] }));
}

export function useBallotWeightSum() {
  const { ballot } = useBallotContext();
  return Math.round(
    ballot?.allocations.reduce(
      (sum: number, x: { allocation: number }) => sum + Number(x.allocation),
      0
    ) ?? 0
  );
}
