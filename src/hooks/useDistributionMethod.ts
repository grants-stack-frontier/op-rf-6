import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  useGetRetroFundingRoundBallotById,
  useUpdateRetroFundingBallotDistributionMethod,
} from '@/__generated__/api/agora';
import { ROUND } from '@/config';

import { DistributionMethod } from './useBallot';

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
