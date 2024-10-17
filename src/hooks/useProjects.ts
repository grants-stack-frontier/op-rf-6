'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  getRetroFundingRoundProjectById,
  type getRetroFundingRoundProjectByIdResponse,
  getRetroFundingRoundProjects,
  type getRetroFundingRoundProjectsResponse,
  updateRetroFundingRoundProjectImpact,
} from '@/__generated__/api/agora';
import {
  GetRetroFundingRoundProjectsParams,
  type GetRetroFundingRoundProjectsCategory,
  type Project,
} from '@/__generated__/api/agora.schemas';
import { toast } from '@/components/ui/use-toast';
import { agoraRoundsAPI, ROUND } from '@/config';
import { request } from '@/lib/request';
import { ImpactScore } from '@/types/project-scoring';
import { ProjectsParams, ProjectsResponse } from '@/types/projects';
import type { CategoryId } from '@/types/various';

export const categoryMap: Record<CategoryId, string> = {
  ETHEREUM_CORE_CONTRIBUTIONS: 'eth_core',
  OP_STACK_RESEARCH_AND_DEVELOPMENT: 'op_rnd',
  OP_STACK_TOOLING: 'op_tooling',
};

export function useProjects(params?: GetRetroFundingRoundProjectsParams) {
  const { limit, offset, category } = params ?? {};
  return useQuery({
    queryKey: ['projects', limit, offset, category],
    queryFn: async () => {
      if (limit !== undefined) {
        const results: getRetroFundingRoundProjectsResponse =
          await getRetroFundingRoundProjects(ROUND, {
            limit,
            offset,
            category: category ?? 'all',
          });
        return results.data?.projects ?? [];
      }

      const allProjects: Project[] = [];
      let currentOffset = offset ?? 0;
      const pageLimit = 100;

      let hasMoreData = true;
      while (hasMoreData) {
        const results: getRetroFundingRoundProjectsResponse =
          await getRetroFundingRoundProjects(ROUND, {
            limit: pageLimit,
            offset: currentOffset,
            category: category ?? 'all',
          });

        const res: ProjectsResponse = results.data;

        if (!res.data || res.data.length === 0) {
          hasMoreData = false;
        } else {
          allProjects.push(...res.data);
          currentOffset += pageLimit;

          if (res.data.length < pageLimit) {
            hasMoreData = false;
          }
        }
      }

      return allProjects;
    },
  });
}

export function useProjectsByCategory(categoryId?: CategoryId) {
  return useQuery({
    queryKey: ['projects-by-category', categoryId],
    queryFn: async () =>
      getRetroFundingRoundProjects(ROUND, {
        limit: 100,
        category: categoryMap[
          categoryId as CategoryId
        ] as GetRetroFundingRoundProjectsCategory,
        //fix type when agora fixes it
      }).then((results: any) => {
        return results.data.data as Project[];
      }),
  });
}

export function useSaveProjectImpact() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['save-project-impact'],
    mutationFn: async ({
      projectId,
      impact,
    }: {
      projectId: string;
      impact: ImpactScore;
    }) => {
      return updateRetroFundingRoundProjectImpact(
        ROUND,
        address as string,
        projectId,
        impact as number
      ).then((r) => {
        queryClient.setQueryData(['ballot-round5', address], r.data);
        return r;
      });
    },
    onSuccess: () =>
      toast({
        title: 'Impact score was saved successfully!',
        variant: 'default',
      }),
    onError: () =>
      toast({
        title: 'Error saving impact score',
        variant: 'destructive',
      }),
  });
}

export function useSaveProjects() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['save-projects'],
    mutationFn: async ({
      projects,
    }: {
      projects: {
        project_id: string;
        allocation: string;
        impact: 0 | 1 | 2 | 3 | 4 | 5 | 999;
      }[];
      action?: 'reset' | 'import';
    }) => {
      await request
        .post(`${agoraRoundsAPI}/ballots/${address}/projects`, {
          json: { projects },
        })
        .json<any>()
        .then((r) => {
          queryClient.setQueryData(['ballot-round5', address], r);
          return r;
        });
    },
    onMutate: () => {
      toast({ title: 'Loading', loading: true });
    },
    onError: (_, { action }) => {
      if (action === 'reset') {
        toast({ variant: 'destructive', title: 'Error resetting ballot' });
      } else if (action === 'import') {
        toast({ variant: 'destructive', title: 'Error importing ballot' });
      } else {
        toast({ variant: 'destructive', title: 'Error saving ballot' });
      }
    },
  });
}

export function useProjectById(projectId: string) {
  return useQuery({
    queryKey: ['projects-by-id', projectId],
    queryFn: async () =>
      getRetroFundingRoundProjectById(ROUND, projectId).then(
        (results: getRetroFundingRoundProjectByIdResponse) => {
          return results.data;
        }
      ),
  });
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
          const results: getRetroFundingRoundProjectsResponse =
            await getRetroFundingRoundProjects(ROUND, {
              limit: pageLimit,
              offset: currentOffset,
              category: category as GetRetroFundingRoundProjectsCategory,
            });

          const res: ProjectsResponse = results.data;

          if (!res.data || res.data.length === 0) {
            hasMoreData = false;
          } else {
            allProjects.push(...res.data);
            currentOffset += pageLimit;

            if (res.data.length < pageLimit) {
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
