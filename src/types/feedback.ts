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

export type FeedbackFormKeyName = keyof FeedbackForm;

export interface FeedbackFormField {
  id: string;
  keyName: FeedbackFormKeyName;
  title: string;
  description?: string;
  placeholder?: string;
  type: 'number' | 'select' | 'text' | 'hidden';
  skippable?: boolean;
  options?: {
    label: string;
    value: string;
  }[];
  comment?: {
    id: string;
    keyName: FeedbackFormKeyName;
    placeholder?: string;
  }
}

export interface FeedbackFormConfig {
  formId: string;
  formFields: FeedbackFormField[];
}