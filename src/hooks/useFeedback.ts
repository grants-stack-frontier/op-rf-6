import { useMutation } from '@tanstack/react-query';
import ky from 'ky';

import { useToast } from '@/components/ui/use-toast';
import { FeedbackForm } from '@/types/feedback';
import { formMap, feedbackFormConfig } from '@/lib/feedbackConfig';

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
            // formId: 'a15a5008-314a-4323-85c5-fe0ee0939004', // TO DO: Change this
            formId: feedbackFormConfig.formId,
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
