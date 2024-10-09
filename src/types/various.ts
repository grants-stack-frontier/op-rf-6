export type CategoryId =
  | 'ETHEREUM_CORE_CONTRIBUTIONS'
  | 'OP_STACK_RESEARCH_AND_DEVELOPMENT'
  | 'OP_STACK_TOOLING';

export type Round5Allocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};

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
