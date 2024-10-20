export type CategoryId =
  | 'ETHEREUM_CORE_CONTRIBUTIONS'
  | 'OP_STACK_RESEARCH_AND_DEVELOPMENT'
  | 'OP_STACK_TOOLING';

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
