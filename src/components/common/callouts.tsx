'use client';
import { useAccount } from 'wagmi';

import { votingEndDate } from '@/config';
import { useSession } from '@/hooks/useAuth';

import { useVotingTimeLeft } from './voting-ends-in';

export function Callouts() {
  const { address, status } = useAccount();
  const { data: session } = useSession();

  const [, , , seconds] = useVotingTimeLeft(votingEndDate);

  if (Number(seconds) < 0) {
    return (
      <div className="bg-accent-foreground text-center p-3 text-white dark:text-black">
        Voting in Retro Funding Round 6 has closed
      </div>
    );
  }

  if (!address) return null;
  if (['connecting', 'reconnecting'].includes(status)) return null;
  if (session?.isBadgeholder) return null;

  return (
    <div className="bg-accent-foreground text-center p-3 text-white dark:text-black">
      Demo mode: You&apos;re not a badgeholder
    </div>
  );
}
