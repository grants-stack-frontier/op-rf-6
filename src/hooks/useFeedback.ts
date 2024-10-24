import { useMutation } from '@tanstack/react-query';
import ky from 'ky';

import { useToast } from '@/components/ui/use-toast';
import { FeedbackForm } from '@/types/various';

// TO DO: Change these
const formMap: FeedbackForm = {
  address: '45ea618e-403e-40b8-b610-88b6b1b63b6c',
  votingTime: 'cd9c9bd0-0b16-4e3f-a28b-8a50cffe64c0',

  votingRating: 'a4779d7d-8b78-4322-a101-6d4524e19a12',

  concernRating: '125df7e0-9622-428f-87a7-624b29df0b4f',
  concernComment: '71a745ae-e5d5-433b-badf-3a93e4e2326b',

  confidenceRating: 'd5fd6cec-6b77-4c2d-8e76-91c181fd4ef3',
  confidenceComment: 'c06e1e36-ec60-457c-a3d5-fc3429f85a35',

  budgetConfidenceRating: '91484848-4848-4848-4848-484848484848',
  budgetConfidenceComment: '91484848-4848-4848-4848-484848484848',
  
  scoringUsefulnessRating: '91484848-4848-4848-4848-484848484848',
  scoringUsefulnessComment: '91484848-4848-4848-4848-484848484848',

  allocationMethodsUsefulnessRating: '91484848-4848-4848-4848-484848484848',
  allocationMethodsUsefulnessComment: '91484848-4848-4848-4848-484848484848',

  behaviors: {
    id: "505b462d-1d03-4799-9402-8a78f8afe56c",
    choiceRefs: {
      collusion: "85f58f02-0b56-494d-8dfc-b9d899f7fbed",
      bribery: "05ec7e72-d0fc-4719-9a7a-4196fb7c4890",
      "self-dealing": "0d8fa526-1895-4fa0-88d1-c2007ad2cc0d",
      other: "fa6957e5-5387-48bf-9df8-ac213f1a66f0",
      none: "cf274617-880d-46da-bdb1-48732f670f9c",
    },
  },
  behaviorsComment: "fa87855f-c32d-46d2-a74f-c35b969faf71",

  trustRating: '91484848-4848-4848-4848-484848484848',
  trustComment: '91484848-4848-4848-4848-484848484848',
} as const;

async function sendFeedback(feedback: FeedbackForm) {
  const addFormResponseItems = Object.entries(formMap).map(
    ([key, formFieldId]) => {
      const value = feedback[key as keyof typeof formMap];
      return {
        formFieldId,
        inputValue: formFieldId?.choiceRefs
        ? {
            choiceRefs: value?.map(
              (behavior: string) => formFieldId.choiceRefs[behavior]
            ),
          }
        : { default: value },
      };
    }
  );
  return ky
    .post('/api/deform', {
      json: {
        operationName: 'AddFormResponse',
        variables: {
          data: {
            formId: '25b6553b-b3f9-4b94-b62f-66fd2f955d57', // TO DO: Change this
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
