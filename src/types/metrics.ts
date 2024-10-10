import { RetroFundingBallot4ProjectsAllocation } from '@/__generated__/api/agora.schemas';

export type Metric = {
  metric_id: string;
  name: string;
  url: string;
  description: string;
  comments: [];
  commentsCount: number;
  views: number;
  added_to_ballot: number;
  allocations_per_project?: RetroFundingBallot4ProjectsAllocation[];
};
