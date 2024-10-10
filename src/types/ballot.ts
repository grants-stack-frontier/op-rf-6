import { RetroFunding5BallotSubmissionContent } from '@/__generated__/api/agora.schemas';

import type { CategoryId } from './various';

export type Round5Allocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};

export type Round5ProjectAllocation = {
  project_id: string;
  name: string;
  image: string;
  position: number;
  allocation: number;
  impact: number;
};

export type Round5BallotStatus =
  | 'NOT STARTED'
  | 'RANKED'
  | 'PENDING SUBMISSION'
  | 'SUBMITTED';

export type Round5Ballot = {
  address: string;
  round_id: number;
  status: Round5BallotStatus;
  budget?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  submitted_at?: string;
  category_allocations: Round5CategoryAllocation[];
  project_allocations: Round5ProjectAllocation[];
  projects_to_be_evaluated: string[];
  total_projects: number;
  payload_for_signature?: RetroFunding5BallotSubmissionContent;
  distribution_method?: string;
};

export type Round5CategoryAllocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};
