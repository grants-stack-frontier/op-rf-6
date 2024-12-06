import { useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { useToast } from '@/components/ui/use-toast';
import { agoraRoundsAPI } from '@/config';
import { request } from '@/lib/request';
import { ImpactScore } from '@/types/project-scoring';
import { ReactQueryKeys } from '@/types/various';

export function useSaveProjectImpact() {
  const { toast } = useToast();
  const { address } = useAccount();

  return useMutation({
    mutationKey: [ReactQueryKeys.SAVE_IMPACT],
    mutationFn: async ({
      projectId,
      impact,
    }: {
      projectId: string;
      impact: ImpactScore;
    }) => {
      return request
        .post(
          `${agoraRoundsAPI}/ballots/${address}/projects/${projectId}/impact/${impact}`,
          {}
        )
        .json<any>();
    },
    // onSuccess: debounceToast,
    onError: () =>
      toast({ variant: 'destructive', title: 'Error saving ballot' }),
  });
}
