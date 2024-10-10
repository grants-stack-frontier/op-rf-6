import { useQuery } from '@tanstack/react-query';

// TODO: Implement this hook with metrics garden api
export function useAttestations({ projectId }: { projectId?: string }) {
  return useQuery({
    queryKey: ['attestations', projectId],
    queryFn: () => {},
  });
}
