'use client';

import { CheckBallotState } from '@/components/ballot/check-ballot-state';
import { PageView } from '@/components/common/page-view';

export default function BallotPage() {
  return (
    <>
      <PageView title="Ballot" />
      <CheckBallotState />
    </>
  );
}
