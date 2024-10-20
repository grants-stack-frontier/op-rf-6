import { ComponentProps } from 'react';

import { ROUND, votingEndDate } from '@/config';
import { useBallotWeightSum } from '@/hooks/useBallot';
import { useBudget } from '@/hooks/useBudget';

import { useVotingTimeLeft } from '../common/voting-ends-in';
import { Button } from '../ui/button';
import { DisabledTooltip } from '../ui/tooltip';

export function BallotSubmitButton({ onClick }: ComponentProps<typeof Button>) {
  const allocationSum = useBallotWeightSum();
  const [seconds] = useVotingTimeLeft(votingEndDate);
  const {
    getBudget: { data: budgetData },
  } = useBudget(ROUND);

  const isBudgetIncomplete =
    !budgetData?.budget ||
    !budgetData.allocations ||
    budgetData.allocations.length === 0;

  if (Number(seconds) < 0) {
    return null;
  }

  const votingExpired = Number(seconds) < 0;

  const isDisabled =
    allocationSum !== 100 || isBudgetIncomplete || votingExpired;

  let tooltipMessage = '';
  if (isDisabled) {
    if (allocationSum !== 100) {
      tooltipMessage = 'Ensure your allocation sums to 100%.';
    } else if (isBudgetIncomplete) {
      tooltipMessage = 'Ensure your budget is complete.';
    } else if (votingExpired) {
      tooltipMessage = 'Voting has closed.';
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
