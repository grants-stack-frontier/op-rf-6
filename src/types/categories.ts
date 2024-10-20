import { CategoryId } from './various';

export type Category = {
  id: CategoryId;
  name: string;
  image: any;
  description: string;
  examples: string[];
  eligibility: {
    eligible_projects: string[];
    not_eligible_projects: string[];
  };
};
