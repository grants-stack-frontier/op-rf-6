import { RetroFunding5BallotSubmissionContent } from '@/__generated__/api/agora.schemas';

import type { CategoryId } from './various';

export type RoundAllocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};

export interface ProjectAllocationState extends ProjectAllocation {
  allocationInput: string;
  positionInput: string;
  description?: string;
}

export type ProjectAllocation = {
  project_id: string;
  name: string;
  image: string;
  position: number;
  allocation: number;
  impact: number;
};

export type BallotStatus =
  | 'NOT STARTED'
  | 'RANKED'
  | 'PENDING SUBMISSION'
  | 'SUBMITTED';

export type Ballot = {
  address: string;
  round_id: number;
  status: BallotStatus;
  budget?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  submitted_at?: string;
  category_allocations: CategoryAllocation[];
  project_allocations: ProjectAllocation[];
  projects_to_be_evaluated: string[];
  total_projects: number;
  payload_for_signature?: RetroFunding5BallotSubmissionContent;
  distribution_method?: string;
};

export type CategoryAllocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};
