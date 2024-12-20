import { useQueryClient } from '@tanstack/react-query';
import { ArrowDownToLineIcon } from 'lucide-react';
import { track } from 'mixpanel-browser';
import Image from 'next/image';
import { ComponentProps, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ROUND, ROUND_NAME, votingEndDate } from '@/config';
import { useBallot, useSubmitBallot } from '@/hooks/useBallotRound5';
import { formatDate } from '@/lib/utils';
import { Round5Ballot } from '@/types/ballot';

import VotingSuccessImage from '../../../public/RetroFunding_R6_IVoted.png';
import { Button } from '../ui/button';
import { Heading } from '../ui/headings';
import { Text } from '../ui/text';

import { Feedback, Form } from './feedback-form';
// import { exportRound5Ballot } from './import-ballot5';

export function SubmitRound5Dialog({
  open,
  ballot,
  onOpenChange,
}: ComponentProps<typeof Dialog> & { ballot?: Round5Ballot }) {
  const [feedbackProgress, setFeedbackProgress] = useState<
    'init' | 'in_progress' | 'submit' | 'done'
  >(ballot?.status === 'SUBMITTED' ? 'submit' : 'init');
  const { address } = useAccount();

  const { refetch: refetchBallot } = useBallot(address);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setFeedbackProgress(ballot?.status === 'SUBMITTED' ? 'submit' : 'init');
    }
  }, [open, ballot?.status]);

  const submit = useSubmitBallot({
    onSuccess: async () => {
      setFeedbackProgress('done');
      await queryClient.invalidateQueries({
        queryKey: ['ballot-round5', address],
      });
      await refetchBallot();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {(() => {
          switch (feedbackProgress) {
            case 'init':
              return (
                <div className="flex flex-col gap-2">
                  <Heading variant="h3" className="text-center">
                    Before submitting your ballot, please answer the following
                    questions.
                  </Heading>
                  <Text className="text-secondary-foreground text-center">
                    Your responses will directly inform the design of future
                    rounds, so thank you for taking the time to respond!
                  </Text>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => setFeedbackProgress('in_progress')}
                  >
                    Continue
                  </Button>
                </div>
              );
            case 'in_progress':
              return (
                <Form
                  defaultValues={{
                    index: 0,
                    address: ballot?.address,
                    behaviors: [],
                  }}
                >
                  <Feedback onSubmit={() => setFeedbackProgress('submit')} />
                </Form>
              );
            case 'submit':
              return (
                <div className="flex flex-col gap-2">
                  <Heading variant="h3" className="text-center">
                    Submit your ballot
                  </Heading>
                  <Text className="text-muted-foreground text-center">
                    <div>
                      You can make changes and resubmit your ballot until{' '}
                    </div>
                    {formatDate(votingEndDate)}
                  </Text>
                  <Button
                    variant="destructive"
                    isLoading={submit.isPending}
                    disabled={submit.isPending}
                    onClick={() => submit.mutate()}
                  >
                    Submit ballot
                  </Button>
                  <Button variant="ghost" onClick={() => onOpenChange?.(false)}>
                    Cancel
                  </Button>
                </div>
              );
            case 'done':
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-center">
                    <Image
                      id="download"
                      {...VotingSuccessImage}
                      alt="Success!"
                      className="rounded-xl mb-2"
                    />
                  </div>
                  <Heading variant="h3" className="text-center">
                    Your vote has been received!
                  </Heading>
                  <Text className="text-muted-foreground text-center">
                    Your work as a badgeholder is crucial to the improvement of
                    the {ROUND_NAME}! We made you an image to share this moment.
                  </Text>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const imageURL = document.querySelector('#download');
                      downloadImage(imageURL as HTMLImageElement);
                    }}
                  >
                    Download image
                    <ArrowDownToLineIcon className="size-4 ml-2" />
                  </Button>
                  {/* <Button
                    variant="outline"
                    isLoading={submit.isPending}
                    disabled={submit.isPending}
                    onClick={() =>
                      exportRound5Ballot(ballot?.project_allocations ?? [])
                    }
                  >
                    Export your ballot
                  </Button> */}
                  <Button variant="ghost" onClick={() => onOpenChange?.(false)}>
                    Close
                  </Button>
                </div>
              );
          }
        })()}
      </DialogContent>
    </Dialog>
  );
}

export function downloadImage(element: HTMLImageElement | null) {
  if (!element) return;
  const anchor = document.createElement('a');
  anchor.href = element.src;

  anchor.download = `optimism-round${ROUND}-voted.png`;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  track('Download I Voted image');
}
