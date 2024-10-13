import React from 'react';

import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { categoryNames } from '@/lib/categories';
import { CategoryId } from '@/types/various';

export function BallotHeader() {
  const { votingCategory, ballot } = useBallotRound5Context();

  return (
    <p>
      Your voting category is{' '}
      <a href={`/category/${votingCategory}`} className="underline">
        {votingCategory
          ? categoryNames[votingCategory as CategoryId]
          : 'Unknown'}
      </a>{' '}
      ({ballot?.total_projects} projects)
    </p>
  );
}
