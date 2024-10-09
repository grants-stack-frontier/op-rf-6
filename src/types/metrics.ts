import { Round4Allocation } from './ballot';

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

export type Round4Ballot = {
  address: string;
  allocations: Round4Allocation[];
  project_allocations: ProjectAllocation[];
  updated_at: string;
  published_at: string;
  os_multiplier: number;
  os_only: boolean;
  status: 'SUBMITTED';
};
