'use client';

import { useQuery } from '@tanstack/react-query';

import { useAccount } from 'wagmi';
import type { Round4Allocation } from './useBallot';
import {
  getImpactMetricsOnRetroFundingRound,
  recordImpactMetricView,
} from '@/__generated__/api/agora';

enum OrderBy {
  name = 'name',
  allocation = 'allocation',
}
enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

type SortFields = { [OrderBy.name]?: string; [OrderBy.allocation]?: number };

export type Metric = {
  metric_id: string;
  name: string;
  url: string;
  description: string;
  comments: [];
  commentsCount: number;
  views: number;
  added_to_ballot: number;
  allocations_per_project?: ProjectAllocation[];
};

export type ProjectAllocation = {
  allocation: number;
  image: string;
  name: string;
  is_os: boolean;
  project_id: string;
  allocations_per_metric?: Round4Allocation[];
};

export function createSortFn(filter: { order: OrderBy; sort: SortOrder }) {
  return function sortFn(a?: SortFields, b?: SortFields) {
    const dir = { asc: 1, desc: -1 }[filter.sort];
    return (a?.[filter.order] ?? 0) > (b?.[filter.order] ?? 0) ? dir : -dir;
  };
}

export function useMetricById(id: string) {
  return useQuery({
    queryKey: ['metrics', id],
    queryFn: async () =>
      getImpactMetricsOnRetroFundingRound(4).then((results) =>
        results.data.find((m) => m['metric_id'] === id)
      ),
  });
}

export function useMetricsByRound(roundId: number | string) {
  return useQuery({
    queryKey: ['metrics', roundId],
    queryFn: async () => getImpactMetricsOnRetroFundingRound(+roundId),
  });
}

export function useMetricIds() {
  // TODO this is hardcoded to round 4, should be dynamic
  return useQuery({
    queryKey: ['metric-ids'],
    queryFn: async () =>
      getImpactMetricsOnRetroFundingRound(4).then(
        (results) => results.data.map((m) => m['metric_id']) ?? []
      ),
  });
}

const viewedMetrics = new Set();

export function useViewMetric(metricId: string) {
  const { address } = useAccount();

  if (!address) throw new Error('User not logged in');

  return useQuery({
    enabled: Boolean(!viewedMetrics.has(metricId) && address),
    queryKey: ['viewed-metrics', metricId],
    queryFn: () =>
      recordImpactMetricView(4, metricId, address).then(() => {
        viewedMetrics.add(metricId);
        return null;
      }),
  });
}
