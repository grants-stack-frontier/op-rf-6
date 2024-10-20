import { RetroFundingBallot5ProjectsAllocation } from '@/__generated__/api/agora.schemas';

export interface ProjectAllocationState
  extends RetroFundingBallot5ProjectsAllocation {
  allocationInput: string;
  positionInput: string;
  description?: string;
}
