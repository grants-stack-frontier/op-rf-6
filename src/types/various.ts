export type CategoryId =
  | 'GOVERNANCE_INFRA_AND_TOOLING'
  | 'GOVERNANCE_ANALYTICS'
  | 'GOVERNANCE_LEADERSHIP';

export type RoundAllocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};

export type FeedbackForm = {
  address: string;
  votingTime: string;
  votingRating: string;
  budgetConfidenceRating: string;
  budgetConfidenceComment?: string;
  scoringUsefulnessRating?: string;
  scoringUsefulnessComment?: string;
  allocationMethodsUsefulnessRating?: string;
  allocationMethodsUsefulnessComment?: string;
  concernRating: string;
  concernComment?: string;
  confidenceRating: string;
  confidenceComment?: string;
};

export enum ReactQueryKeys {
  SIWE_NONCE = 'nonce',
  SIWE_SESSION = 'session',
  ATTESTATIONS = 'attestations',
  BALLOT = 'ballot-round5',
  SAVE_BALLOT = 'save-round5-ballot',
  SAVE_POSITION = 'save-round5-position',
  DISTRIBUTION_METHOD_LOCAL_STORAGE = 'distribution-method-local-storage',
  SAVE_DISTRIBUTION_METHOD = 'save-round5-distribution-method',
  BUDGET = 'budget',
  SAVE_BUDGET = 'save-budget',
  SAVE_IMPACT = 'save-impact',
  PROJECTS = 'projects',
  PROJECTS_BY_CATEGORY = 'projects-by-category',
  PROJECTS_BY_ID = 'projects-by-id',
  ALL_PROJECTS_BY_CATEGORY = 'all-projects-by-category',
  SAVE_PROJECT_IMPACT = 'save-project-impact',
  SAVE_PROJECTS = 'save-projects',
}
