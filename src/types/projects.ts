import { GetRetroFundingRoundProjectsCategory } from '@/__generated__/api/agora.schemas';

export interface ProjectsParams {
  limit?: number;
  offset?: number;
  category?: GetRetroFundingRoundProjectsCategory;
}
