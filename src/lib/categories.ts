import { RetroFundingBallotCategoriesAllocationCategorySlug } from '@/__generated__/api/agora.schemas';
import { Category } from '@/types/categories';

import govAnalytics from '../../public/govAnalytics.svg';
import govInfra from '../../public/govInfra.svg';
import govLeadership from '../../public/govLeadership.svg';
import { ROUND_NAME } from '@/config';

export const categoryNames: Record<string, string> = {
  GOVERNANCE_INFRA_AND_TOOLING: 'Governance Infrastructure & Tooling',
  GOVERNANCE_ANALYTICS: 'Governance Analytics',
  GOVERNANCE_LEADERSHIP: 'Governance Leadership',
};

export const categories: Category[] = [
  {
    id: RetroFundingBallotCategoriesAllocationCategorySlug.GOVERNANCE_INFRA_AND_TOOLING,
    name: 'Governance Infrastructure & Tooling',
    image: govInfra.src,
    description:
      'Infrastructure and tooling that powered governance or that made the usage of governance infrastructure more accessible.',
    examples: [
      'Work on Optimism Governor contracts',
      `${ROUND_NAME} voting clients and interfaces`,
      'work on Optimism identity and reputation infrastructure',
      'Retro Funding voting clients and sign up.',
    ],
    eligibility: {
      eligible_projects: [
        `Governance Infrastructure: Technical infrastructure that powers the voting process within ${ROUND_NAME}`,
        `Governance Tooling: Tools that are used by Delegates or Citizens to participate in ${ROUND_NAME}`,
        'Grants Tooling: Tools that support the Token House grants process, including the operation of the Grants Council. Tools which power or support the Retro Funding process.',
      ],
      not_eligible_projects: [
        `Non-Optimism related governance tooling: Tools that have not been used in ${ROUND_NAME}`,
        `Resources for Governance Onboarding: Documentation, educational videos or other resources that are dedicated to explaining ${ROUND_NAME}`,
      ],
    },
  },
  {
    id: RetroFundingBallotCategoriesAllocationCategorySlug.GOVERNANCE_ANALYTICS,
    name: 'Governance Analytics',
    image: govAnalytics.src,
    description:
      'Analytics that enabled accountability, provided transparency into Collective operations, promoted improved performance, or aided in the design of the Collective.',
    examples: [
      'Governance performance reports',
      'Finance and Grant related analytics & reports',
      'Delegate/Citizen voting power and activity analytics.',
    ],
    eligibility: {
      eligible_projects: [
        `${ROUND_NAME} related Analytics: Analyses of the performance of ${ROUND_NAME}, including governance participation, grant allocation and more`,
      ],
      not_eligible_projects: [
        `Analytics infrastructure or reports which are not related to ${ROUND_NAME}`,
      ],
    },
  },
  {
    id: RetroFundingBallotCategoriesAllocationCategorySlug.GOVERNANCE_LEADERSHIP,
    name: 'Governance Leadership',
    image: govLeadership.src,
    description:
      'Demonstrated leadership in the Collective, including but not limited to, hosting community calls and/or participation in councils, boards and commissions beyond executing on basic responsibilities outlined in Token House Charters.',
    examples: [
      `Various ${ROUND_NAME} Councils`,
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
