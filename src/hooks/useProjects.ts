'use client';

import { getProjectsResponse, getRetroFundingRoundProjects } from '@/__generated__/api/agora';
import { PageMetadata, Project } from '@/__generated__/api/agora.schemas';
import { useQuery } from '@tanstack/react-query';

export type ProjectsResponse = {
	metadata?: PageMetadata;
	data?: Project[];
};

export function useProjects() {
	return useQuery({
		queryKey: ['projects'],
		queryFn: async () => getRetroFundingRoundProjects(5),
	});
}

export function useProjectsByCategory(categoryId: string) {
	return useQuery({
		queryKey: ['projects-by-category', categoryId],
		queryFn: async () =>
			getRetroFundingRoundProjects(5).then((results: getProjectsResponse) => {
				const res: ProjectsResponse = results.data;
				const filtered = res.data?.filter((p) => p.category === categoryId);
				return filtered;
			}),
	});
}

export function useProjectById(projectId: string) {
	return useQuery({
		queryKey: ['projects-by-id', projectId],
		queryFn: async () =>
			getRetroFundingRoundProjects(5).then((results: getProjectsResponse) => {
				const res: ProjectsResponse = results.data;
				const filtered = res.data?.filter((p) => p.id === projectId);
				return filtered?.[0];
			}),
	});
}
