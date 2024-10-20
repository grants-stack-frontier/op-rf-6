import { RetroFundingBallotCategoriesAllocationCategorySlug } from '@/__generated__/api/agora.schemas';
import { Category } from '@/types/categories';

import ethCore from '../../public/eth_core.svg';
import opRnd from '../../public/op_rnd.svg';
import opTooling from '../../public/op_tooling.svg';

export const categoryNames: Record<string, string> = {
  GOV_INFRA: 'Governance Infrastructure & Tooling',
  GOV_ANALYTICS: 'Governance Analytics',
  GOV_LEADERSHIP: 'Governance Leadership',
};

export const categories: Category[] = [
  {
    id: RetroFundingBallotCategoriesAllocationCategorySlug.GOV_INFRA,
    name: 'Governance Infrastructure & Tooling',
    image: ethCore.src,
    description:
      'Infrastructure and tooling that powered governance or that made the usage of governance infrastructure more accessible.',
    examples: [
      'Work on Optimism Governor contracts',
      'Optimism Governance voting clients and interfaces',
      'work on Optimism identity and reputation infrastructure',
      'Retro Funding voting clients and sign up.',
    ],
    eligibility: {
      eligible_projects: [
        'Governance Infrastructure: Technical infrastructure that powers the voting process within Optimism Governance',
        'Governance Tooling: Tools that are used by Delegates or Citizens to participate in Optimism Governance',
        'Grants Tooling: Tools that support the Token House grants process, including the operation of the Grants Council. Tools which power or support the Retro Funding process.',
      ],
      not_eligible_projects: [
        'Non-Optimism related governance tooling: Tools that have not been used in Optimism Governance',
        'Resources for Governance Onboarding: Documentation, educational videos or other resources that are dedicated to explaining Optimism Governance',
      ],
    },
  },
  {
    id: RetroFundingBallotCategoriesAllocationCategorySlug.GOV_ANALYTICS,
    name: 'Governance Analytics',
    image: opRnd.src,
    description:
      'Analytics that enabled accountability, provided transparency into Collective operations, promoted improved performance, or aided in the design of the Collective.',
    examples: [
      'Governance performance reports',
      'Finance and Grant related analytics & reports',
      'Delegate/Citizen voting power and activity analytics.',
    ],
    eligibility: {
      eligible_projects: [
        'Optimism Governance related Analytics: Analyses of the performance of Optimism governance, including governance participation, grant allocation and more',
      ],
      not_eligible_projects: [
        'Analytics infrastructure or reports which are not related to Optimism Governance',
      ],
    },
  },
  {
    id: RetroFundingBallotCategoriesAllocationCategorySlug.GOV_LEADERSHIP,
    name: 'Governance Leadership',
    image: opTooling.src,
    description:
      'DDemonstrated leadership in the Collective, including but not limited to, hosting community calls and/or participation in councils, boards and commissions beyond executing on basic responsibilities outlined in Token House Charters.',
    examples: [
      'Various Optimism Governance Councils',
      'Commissions and Boards',
      'governance process facilitation',
    ],
    eligibility: {
      eligible_projects: [
        'Councils, Commissions and Advisory Boards; NERD programs focused exclusively on core governance responsibilities (GovNERDs). This includes Security Council, Grants Council, Developer Advisory Board, Code of Conduct Council, Anticapture Commission, Collective Feedback Commissions and GovNERDs.',
        'Governance facilitation of critical governance processes and/or experiments such as community calls, proposal creation or review sessions, deliberations or similar',
      ],
      not_eligible_projects: [
        'Governance onboarding and promotion initiatives.',
        'Delegate or Citizen governance participation, including forum engagement, participation in calls & workshops, participation in survey and other activities which are part of the responsibilities of citizens and delegates. These activities are rewarded separately as part of the Retro Governance Participation Rewards 10',
        'Each of the above mentioned Councils, Commissions, Advisory Boards and NERD programs are required to submit one application as a group, individual participation within one of the groups is not eligible. The allocation of rewards among group members should be proposed by the team Lead and is subject to the consensus mechanism of that group outlined in their internal operating procedures',
        'Governance Leadership within Governance Season 4 is not considered within this round, as it was already rewarded in Retro Funding 3.',
      ],
    },
  },
];
