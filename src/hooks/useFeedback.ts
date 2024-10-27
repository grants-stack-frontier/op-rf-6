import { useMutation } from '@tanstack/react-query';
import ky from 'ky';

import { useToast } from '@/components/ui/use-toast';
import { FeedbackForm } from '@/types/various';

// TO DO: Change these
const formMap: FeedbackForm = {
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

async function sendFeedback(feedback: FeedbackForm) {
  const addFormResponseItems = Object.entries(formMap).map(
    ([key, formFieldId]) => {
      const value = feedback[key as keyof typeof formMap];
      return {
        formFieldId,
        inputValue: { default: value },
      };
    }
  );
  return ky
    .post('/api/deform', {
      json: {
        operationName: 'AddFormResponse',
        variables: {
          data: {
            formId: 'a15a5008-314a-4323-85c5-fe0ee0939004', // TO DO: Change this
            addFormResponseItems,
          },
        },
        query:
          'mutation AddFormResponse($data: AddFormResponseInput!) { addFormResponse(data: $data) { id } }',
      },
    })
    .json<{ errors?: { message: string }[] }>()
    .then((r) => {
      if (r.errors?.length) {
        throw new Error(r.errors?.[0]?.message);
      }
      return r;
    });
}

export function useSendFeedback() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: sendFeedback,
    onError: (err) => {
      console.error(err);
      toast({ title: 'Error submitting feedback', variant: 'destructive' });
    },
  });
}
