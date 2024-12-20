'use client';

import React from 'react';
import { useAccount } from 'wagmi';

import { BallotFooter } from '@/components/ballot/ballot-footer';
import { BallotHeader } from '@/components/ballot/ballot-header';
import { BallotProjects } from '@/components/ballot/ballot-projects';
import { NonBadgeholder, EmptyBallot } from '@/components/ballot/ballot-states';
import { ConflictsSection } from '@/components/ballot/conflicts-section';
import { PageView } from '@/components/common/page-view';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { useProjects } from '@/hooks/useProjects';

export default function BallotPage() {
  const { address, isConnecting } = useAccount();
  const { state, ballot, isPending } = useBallotRound5Context();
  const { data: projects } = useProjects();

  console.log({ ballot, projects });

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
          <Card className="p-6 space-y-8">
            <BallotProjects />
            <BallotFooter />
            <ConflictsSection />
          </Card>
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
