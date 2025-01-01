import { FeedbackForm, FeedbackFormConfig } from "@/types/feedback";

export const formMap: FeedbackForm = {
  address: '8c3fdad7-e429-48e0-af58-b61fb0ecd3c3',
  // How much time did you spend voting in this round (in hours)?
  votingTime: '0de463fa-f2e0-42bb-a0b9-dc10c9b0c84b',
  // Please rate the voting experience
  votingRating: '3633a6b2-cda0-4354-9b59-9b47115d8c87',

  // Did the app provide you enough information to confidently vote on the round budget and category allocation?
  budgetConfidenceRating: '410b1eed-599d-4f4e-b9fd-a796ee55c356',
  // Please feel free to elaborate here. Reminder that these responses are private.
  budgetConfidenceComment: 'fe74da9d-1a41-47d7-8add-b8e590222f93',

  // How useful was scoring each project before deciding on your allocation?
  scoringUsefulnessRating: '4f7c19cc-2fc3-4267-89be-62ec502f3601',
  // Please feel free to elaborate here. Reminder that these responses are private.
  scoringUsefulnessComment: 'b32bc787-58ca-46ce-91ef-7f7c2ec6e705',

  // How useful were allocation methods for determining your ballot?
  allocationMethodsUsefulnessRating: '6b19127e-fb76-449c-b367-8850d252b9d2',
  // Please feel free to elaborate here. Reminder that these responses are private.
  allocationMethodsUsefulnessComment: '1dfbf276-3aee-4152-b7dc-b09938842027',

  // How worried are you about detrimental behavior among badgeholders influencing the allocation of Retro Funding in this round?
  concernRating: '73ed49d2-ce15-428f-a765-aeb37e504767',
  // Please feel free to elaborate here. Reminder that these responses are private.
  concernComment: 'd04c2581-85d2-43b6-bcc4-0e71a167842f',

  // Given the design of this round, how confident do you feel that rewards will be allocated efficiently to the most deserving projects?
  confidenceRating: '5ef68cc1-f4b9-463d-83a3-c4aaddb4f250',
  // Please feel free to elaborate here. Reminder that these responses are private.
  confidenceComment: 'd3b99ab5-b75c-4e5d-ae45-b8e3d0524f56',
} as const;

export const feedbackFormConfig: FeedbackFormConfig = {
  formId: 'a15a5008-314a-4323-85c5-fe0ee0939004',
  formFields: [
    {
      id: formMap.address,
      keyName: 'address',
      title: '',
      type: 'hidden'
    },
    {
      id: formMap.votingTime,
      keyName: 'votingTime',
      title: 'How much time did you spend voting in this round (in hours)?',
      placeholder: 'Ex: 10 hours',
      type: 'number',
    },
    {
      id: formMap.votingRating,
      keyName: 'votingRating',
      title: 'Please rate the voting experience',
      type: 'select',
      options: Array(10).fill(0).map((_, i) => ({
        label: `${i + 1} ${i === 0 ? '(terrible)' : i === 9 ? '(amazing ✨)' : ''}`,
        value: String(i + 1)
      }))
    },
    {
      id: formMap.budgetConfidenceRating,
      keyName: 'budgetConfidenceRating',
      title: 'Did the app provide you enough information to confidently vote on the round budget and category allocation?',
      type: 'select',
      options: Array(7).fill(0).map((_, i) => ({
        label: `${i + 1} ${i === 0 ? '(definitely not)' : i === 3 ? '(somewhat)' : i === 6 ? '(absolutely)' : ''}`,
        value: String(i + 1)
      })),
      comment: {
        id: formMap.budgetConfidenceComment!,
        keyName: 'budgetConfidenceComment',
        placeholder: 'Please feel free to elaborate or provide additional feedback here. Reminder that these responses are private.'
      }
    },
    {
      id: formMap.scoringUsefulnessRating!,
      keyName: 'scoringUsefulnessRating',
      title: 'How useful was scoring each project before deciding on your allocation?',
      description: 'If you used Pairwise, skip this question.',
      skippable: true,
      type: 'select',
      options: Array(7).fill(0).map((_, i) => ({
        label: `${i + 1} ${i === 0 ? '(not useful at all)' : i === 3 ? '(somewhat useful)' : i === 6 ? '(very useful)' : ''}`,
        value: String(i + 1)
      })),
      comment: {
        id: formMap.scoringUsefulnessComment!,
        keyName: 'scoringUsefulnessComment',
        placeholder: 'Optionally, how would you change or improve the scoring step? Reminder that these responses are private.'
      }
    },
    {
      id: formMap.allocationMethodsUsefulnessRating!,
      keyName: 'allocationMethodsUsefulnessRating',
      title: 'How useful were allocation methods for determining your ballot?',
      skippable: true,
      type: 'select',
      options: Array(7).fill(0).map((_, i) => ({
        label: `${i + 1} ${i === 0 ? '(not useful)' : i === 3 ? '(somewhat useful)' : i === 6 ? '(very useful)' : ''}`,
        value: String(i + 1)
      })),
      comment: {
        id: formMap.allocationMethodsUsefulnessComment!,
        keyName: 'allocationMethodsUsefulnessComment',
        placeholder: 'Please feel free to elaborate or provide additional feedback here. Reminder that these responses are private.'
      }
    },
    {
      id: formMap.concernRating,
      keyName: 'concernRating',
      title: 'How worried are you about detrimental behavior among badgeholders influencing the allocation of Retro Funding in this round?',
      description: 'Examples are collusion, bribery, self-dealing, or other behaviors at odds with the goals of the Collective.',
      type: 'select',
      options: Array(7).fill(0).map((_, i) => ({
        label: `${i + 1} ${i === 0 ? '(not worried)' : i === 3 ? '(somewhat worried)' : i === 6 ? '(very worried)' : ''}`,
        value: String(i + 1)
      })),
      comment: {
        id: formMap.concernComment!,
        keyName: 'concernComment',
        placeholder: 'Please feel free to elaborate here. Reminder that these responses are private.'
      }
    },
    {
      id: formMap.confidenceRating,
      keyName: 'confidenceRating',
      title: 'Given the design of this round, how confident do you feel that rewards will be allocated efficiently to the most deserving projects?',
      type: 'select',
      options: Array(7).fill(0).map((_, i) => ({
        label: `${i + 1} ${i === 0 ? '(very low confidence)' : i === 3 ? '(some confidence)' : i === 6 ? '(very high confidence)' : ''}`,
        value: String(i + 1)
      })),
      comment: {
        id: formMap.confidenceComment!,
        keyName: 'confidenceComment',
        placeholder: 'Please feel free to elaborate here. Reminder that these responses are private.'
      }
    },
  ]
}