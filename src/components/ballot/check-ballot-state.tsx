import { useAccount } from 'wagmi';

import { NonBadgeholder, EmptyBallot } from '@/components/ballot/ballot-states';
import { Skeleton } from '@/components/ui/skeleton';
import { useBallotRound5Context } from '@/contexts/BallotRound5Context';

import { YourBallot } from './your-ballot';

export function CheckBallotState() {
  const { address, isConnecting } = useAccount();
  const { state, ballot, isPending } = useBallotRound5Context();

  if (isPending) {
    return <Skeleton className="p-6 h-96" />;
  }
  if (!address && !isConnecting) {
    return <NonBadgeholder />;
  }
  const isEmptyBallot = !Object.keys(state).length;
  const needImpactScoring =
    ballot && ballot.projects_to_be_evaluated.length > 0;
  if (isEmptyBallot || needImpactScoring) {
    return <EmptyBallot />;
  }
  return <YourBallot />;
}
