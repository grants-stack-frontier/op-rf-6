import { useMemo } from 'react';

import { ROUND, votingEndDate } from '@/config';
import { useBallotWeightSum } from '@/hooks/useBallot';
import { useBudget } from '@/hooks/useBudget';
import { useDistributionMethodFromLocalStorage } from '@/hooks/useDistributionMethod';

import { useVotingTimeLeft } from '../common/voting-ends-in';

export function WeightsError() {
  const allocationSum = useBallotWeightSum();
  const remainingAllocation = useMemo(() => {
    return 100 - allocationSum;
  }, [allocationSum]);

  const [seconds] = useVotingTimeLeft(votingEndDate);
  const { data: distributionMethod } = useDistributionMethodFromLocalStorage();
  const {
    getBudget: { data: budgetData },
  } = useBudget(ROUND);

  if (Number(seconds) < 0) {
    return (
      <span className="text-sm text-destructive">
        Voting has closed! Results will be announced shortly.
      </span>
    );
  }

  if (!distributionMethod)
    return (
      <span className="text-sm text-destructive">
        Choose an allocation method at the top of this ballot.
      </span>
    );

  const isBudgetIncomplete =
    !budgetData?.budget ||
    !budgetData.allocations ||
    budgetData.allocations.length === 0;

  if (Math.abs(remainingAllocation) < 0.01 && isBudgetIncomplete) {
    return (
      <span className="text-sm text-destructive">
        Please set{' '}
        <a href="/budget" className="underline">
          your budget and category allocations
        </a>{' '}
        before submitting.
      </span>
    );
  }

  // Treat the allocation as complete if the remaining allocation is negligible
  if (Math.abs(remainingAllocation) < 0.01) return null;

  // Format the remainingAllocation to show up to 2 decimal places
  const formattedRemainingAllocation = remainingAllocation
    .toFixed(2)
    .replace(/\.?0+$/, '');

  return (
    <span className="text-sm text-destructive">
      Percentages must equal 100% (
      {remainingAllocation > 0
        ? `add ${formattedRemainingAllocation}% to your ballot`
        : `remove ${Math.abs(Number(formattedRemainingAllocation))}% from your ballot`}
      )
    </span>
  );
}
