import { ComponentProps } from 'react';

import { votingEndDate } from '@/config';
import { useRound5BallotWeightSum } from '@/hooks/useBallotRound5';
import { useBudget } from '@/hooks/useBudget';
import { useIsBadgeholder } from '@/hooks/useIsBadgeholder';

import { useVotingTimeLeft } from '../common/voting-ends-in';
import { Button } from '../ui/button';
import { DisabledTooltip } from '../ui/tooltip';

export function BallotSubmitButton({ onClick }: ComponentProps<typeof Button>) {
  const allocationSum = useRound5BallotWeightSum();
  const [seconds] = useVotingTimeLeft(votingEndDate);
  const isBadgeholder = useIsBadgeholder();
  const {
    getBudget: { data: budgetData },
  } = useBudget(5);

  const isBudgetIncomplete =
    !budgetData?.budget ||
    !budgetData.allocations ||
    budgetData.allocations.length === 0;

  if (Number(seconds) < 0) {
    return null;
  }

  const isDisabled =
    allocationSum !== 100 || isBudgetIncomplete || !isBadgeholder;

  let tooltipMessage = '';
  if (isDisabled) {
    if (allocationSum !== 100) {
      tooltipMessage = 'Ensure your allocation sums to 100%.';
    } else if (isBudgetIncomplete) {
      tooltipMessage = 'Ensure your budget is complete.';
    } else if (!isBadgeholder) {
      tooltipMessage = 'You must be a badgeholder to submit.';
    }
  }

  return (
    <DisabledTooltip isDisabled={isDisabled} content={tooltipMessage}>
      <Button
        disabled={isDisabled}
        variant={'destructive'}
        type="submit"
        onClick={onClick}
      >
        Submit budget and ballot
      </Button>
    </DisabledTooltip>
  );
}
