export type CategoryId =
  // | 'GOV_INFRA'
  // | 'GOV_ANALYTICS'
  // | 'GOV_LEADERSHIP'
  'GOV_INFRA' | 'GOV_ANALYTICS' | 'GOV_LEADERSHIP';

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
