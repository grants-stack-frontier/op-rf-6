import { RetroFundingBallot5ProjectsAllocation } from '@/__generated__/api/agora.schemas';

import type { CategoryId } from './various';

export type Round5Allocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};

export interface ProjectAllocationState
  extends RetroFundingBallot5ProjectsAllocation {
  allocationInput: string;
  positionInput: string;
  description?: string;
}

export type Round5CategoryAllocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};
