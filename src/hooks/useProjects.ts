import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  getRetroFundingRoundProjects,
  useGetRetroFundingRoundProjects,
  useUpdateRetroFundingRoundProjects,
} from '@/__generated__/api/agora';
import {
  Project,
  UpdateRetroFundingRoundProjectsBodyProjectsItem,
  type GetRetroFundingRoundProjectsCategory,
} from '@/__generated__/api/agora.schemas';
import { toast } from '@/components/ui/use-toast';
import { ROUND } from '@/config';
import type { CategoryId } from '@/types/various';

export const categoryMap: Record<CategoryId, string> = {
  ETHEREUM_CORE_CONTRIBUTIONS: 'eth_core',
  OP_STACK_RESEARCH_AND_DEVELOPMENT: 'op_rnd',
  OP_STACK_TOOLING: 'op_tooling',
};

type SaveProjectsParams = {
  projects: UpdateRetroFundingRoundProjectsBodyProjectsItem[];
  action?: 'reset' | 'import';
};

export function useProjectsByCategory(categoryId?: CategoryId) {
  return useGetRetroFundingRoundProjects(
    ROUND,
    {
      limit: 100,
      category: categoryMap[
        categoryId as CategoryId
      ] as GetRetroFundingRoundProjectsCategory,
    },
    {
      query: {
        select: (data) => data.projects,
      },
    }
  );
}

export function useAllProjectsByCategory() {
  return useQuery({
    queryKey: ['all-projects-by-category'],
    queryFn: async () => {
      const categories = Object.values(categoryMap);
      const projectsByCategory: Record<string, Project[]> = {};

      for (const category of categories) {
        const allProjects: Project[] = [];
        let currentOffset = 0;
        const pageLimit = 100;

        let hasMoreData = true;
        while (hasMoreData) {
          const res = await getRetroFundingRoundProjects(ROUND, {
            limit: pageLimit,
            offset: currentOffset,
            category: category as GetRetroFundingRoundProjectsCategory,
          });

          if (!res.projects || res.projects.length === 0) {
            hasMoreData = false;
          } else {
            allProjects.push(...res.projects);
            currentOffset += pageLimit;

            if (res.projects.length < pageLimit) {
              hasMoreData = false;
            }
          }
        }

        projectsByCategory[category] = allProjects;
      }

      return projectsByCategory;
    },
  });
}

export function useSaveProjects() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const updateProjects = useUpdateRetroFundingRoundProjects();

  const saveProjects = async ({ projects, action }: SaveProjectsParams) => {
    try {
      toast({ title: 'Loading', loading: true });

      const response = await updateProjects.mutateAsync({
        roundId: ROUND,
        addressOrEnsName: address as string,
        data: {
          projects,
        },
      });

      queryClient.setQueryData(['ballot-round5', address], response);

      toast({
        title:
          action === 'reset'
            ? 'Ballot reset successfully'
            : action === 'import'
              ? 'Ballot imported successfully'
              : 'Projects saved successfully',
        variant: 'default',
      });

      return response;
    } catch (error) {
      toast({
        variant: 'destructive',
        title:
          action === 'reset'
            ? 'Error resetting ballot'
            : action === 'import'
              ? 'Error importing ballot'
              : 'Error saving ballot',
      });
      throw error;
    }
  };

  return saveProjects;
}
