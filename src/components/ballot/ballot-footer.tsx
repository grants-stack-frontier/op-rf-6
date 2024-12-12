import { LoaderIcon } from 'lucide-react';
import React from 'react';

import { useBallotContext } from '@/contexts/BallotContext';

import { BallotSubmitButton } from './ballot-submit-button';
import { SubmitRound5Dialog } from './submit-dialog5';
import { WeightsError } from './weights-error';

export function BallotFooter() {
  const { ballot, isSubmitting, setSubmitting, isSavingBallot } =
    useBallotContext();

  return (
    <div className="flex flex-col gap-6 mt-6">
      <WeightsError />
      <div className="flex items-center gap-4">
        <BallotSubmitButton onClick={() => setSubmitting(true)} />

        {isSavingBallot && (
          <span className="flex gap-2">
            <LoaderIcon className="animate-spin w-4 h-4" />
            <span className="text-xs">Saving ballot...</span>
          </span>
        )}
      </div>

      {ballot?.address && (
        <SubmitRound5Dialog
          ballot={ballot}
          open={isSubmitting}
          onOpenChange={() => setSubmitting(false)}
        />
      )}
    </div>
  );
}
