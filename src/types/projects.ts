import {
  PageMetadata,
  GetRetroFundingRoundProjectsCategory,
  Project,
} from '@/__generated__/api/agora.schemas';

export type ProjectsResponse = {
  metadata?: PageMetadata;
  data?: Project[];
};

export interface ProjectsParams {
  limit?: number;
  offset?: number;
  category?: GetRetroFundingRoundProjectsCategory;
}
