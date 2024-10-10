'use client';

import React from 'react';
import { useAccount } from 'wagmi';

import { BallotFooter } from '@/components/ballot/ballot-footer';
import { BallotHeader } from '@/components/ballot/ballot-header';
import { BallotProjects } from '@/components/ballot/ballot-projects';
import { NonBadgeholder, EmptyBallot } from '@/components/ballot/ballot-states';
import { ConflictsSection } from '@/components/ballot/conflicts-section';
import { PageView } from '@/components/common/page-view';
import { Skeleton } from '@/components/ui/skeleton';
import { useBallotRound5Context } from '@/contexts/BallotRound5Context';

export default function BallotPage() {
  const { address, isConnecting } = useAccount();
  const { state, ballot, isPending } = useBallotRound5Context();

  let content;

  if (isPending) {
    content = <Skeleton className="p-6 h-96" />;
  } else if (!address && !isConnecting) {
    content = <NonBadgeholder />;
  } else {
    const isEmptyBallot = !Object.keys(state).length;
    const needImpactScoring =
      ballot && ballot.projects_to_be_evaluated.length > 0;

    if (isEmptyBallot || needImpactScoring) {
      content = <EmptyBallot />;
    } else {
      content = (
        <div className="space-y-4">
          <BallotHeader />
          <BallotProjects />
          <BallotFooter />
          <ConflictsSection />
        </div>
      );
    }
  }

  return (
    <>
      <PageView title="Ballot" />
      {content}
    </>
  );
}
