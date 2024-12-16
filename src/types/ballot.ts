import { BallotStatus, Ballot as RFBallot, RetroFundingBallotCategoriesAllocation } from '@/__generated__/api/agora.schemas';

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

export interface Ballot extends RFBallot {
  address: string;
  round_id: number;
  status: BallotStatus;
  category_allocations: RetroFundingBallotCategoriesAllocation[];
  project_allocations: ProjectAllocation[];
  projects_to_be_evaluated: string[];
  total_projects: number;
  submitted_at?: string;
  distribution_method?: string;
}
