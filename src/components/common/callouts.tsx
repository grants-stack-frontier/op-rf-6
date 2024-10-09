'use client';
import { useAccount } from 'wagmi';

import { votingEndDate } from '@/config';
import { useIsBadgeholder } from '@/hooks/useIsBadgeholder';

import { useVotingTimeLeft } from './voting-ends-in';

export function Callouts() {
  const { address, status } = useAccount();
  const isBadgeholder = useIsBadgeholder();

  const [, , , seconds] = useVotingTimeLeft(votingEndDate);

  if (Number(seconds) < 0) {
    return (
      <div className="bg-accent-foreground text-center p-3 text-white dark:text-black">
        Voting in Retro Funding Round 5 has closed
      </div>
    );
  }

  if (!address) return null;
  if (['connecting', 'reconnecting'].includes(status)) return null;
  if (isBadgeholder) return null;

  return (
    <div className="bg-accent-foreground text-center p-3 text-white dark:text-black">
      Demo mode: You&apos;re not a badgeholder
    </div>
  );
}
