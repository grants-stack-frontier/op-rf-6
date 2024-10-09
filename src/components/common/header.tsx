'use client';

import { ArrowUpRight } from 'lucide-react';
import { track } from 'mixpanel-browser';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';
import { badgeholderManualUrl, votingEndDate } from '@/config';
import { hasSeenIntro } from '@/lib/localStorage';

import { ConnectButton } from '../auth/connect-button';
import { SignMessage } from '../auth/sign-message';
import { VoterConfirmationDialog } from '../auth/voter-confirmation';
import { Separator } from '../ui/separator';

import { Logo } from './logo';
import { ModeToggle } from './mode-toggle';
import { VotingEndsIn } from './voting-ends-in';

export function Header() {
  const { address } = useAccount();
  const [homeHref, setHomeHref] = useState('/');

  useEffect(() => {
    if (address && hasSeenIntro(address)) {
      setHomeHref('/budget');
    } else {
      setHomeHref('/');
    }
  }, [address]);

  return (
    <header className="h-20 px-4 flex justify-between items-center">
      <Link href={homeHref}>
        <Logo />
      </Link>
      <div className="hidden sm:flex items-center gap-2 divide-x space-x-2 text-sm">
        <div className="flex flex-col lg:flex-row items-center h-8">
          <p>Round 5: OP Stack</p>
        </div>
        <div className="flex flex-col lg:flex-row items-center h-8">
          <VotingEndsIn className="pl-4" date={votingEndDate} />
        </div>
        <Link href={badgeholderManualUrl} target="_blank">
          <Button
            iconRight={ArrowUpRight}
            variant="link"
            className="pl-4 h-8"
            onClick={() => track('Open Manual', { external: true })}
          >
            View badgeholder manual
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Separator orientation="vertical" />
        <div className="hidden sm:block">
          <ConnectButton />
        </div>
      </div>

      <SignMessage />
      <VoterConfirmationDialog />
    </header>
  );
}
