export type CategoryId =
  // | 'GOVERNANCE_INFRA_AND_TOOLING'
  // | 'GOVERNANCE_ANALYTICS'
  // | 'GOVERNANCE_LEADERSHIP'
  | 'GOVERNANCE_INFRA_AND_TOOLING'
  | 'GOVERNANCE_ANALYTICS'
  | 'GOVERNANCE_LEADERSHIP';

export type FeedbackForm = {
  address: string;
  votingTime: string;
  votingRating: string;
  concernRating: string;
  concernComment?: string;
  confidenceRating: string;
  confidenceComment?: string;
  influenceRating: string;
  influenceComment?: string;
};
