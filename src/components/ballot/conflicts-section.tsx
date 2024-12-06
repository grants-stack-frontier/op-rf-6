import Link from 'next/link';
import React from 'react';

import { useBallotContext } from '@/contexts/BallotContext';

const impactScores: { [key: number]: string } = {
  0: 'Conflict of interest',
  1: 'Very low impact',
  2: 'Low impact',
  3: 'Medium impact',
  4: 'High impact',
  5: 'Very high impact',
};

export function ConflictsSection() {
  const { conflicts } = useBallotContext();

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <>
      <h1 className="text-lg font-bold pt-6">Conflicts of interest</h1>
      {conflicts.map((proj) => (
        <div
          key={proj.project_id}
          className="flex justify-between flex-1 border-b gap-1 py-6"
        >
          <div className="flex items-start justify-between flex-grow">
            <div className="flex items-start gap-1">
              <div
                className="size-12 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage: `url(${proj.image})`,
                }}
              />
              <div className="flex flex-col gap-1 ml-4">
                <div>
                  <Link href={`/project/${proj.project_id}`}>
                    <p className="font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px]">
                      {proj.name}
                    </p>
                  </Link>
                  <p className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px]">
                    {proj.description ?? 'No description'}
                  </p>
                </div>
                <div className="text-muted-foreground text-xs">
                  You marked: {impactScores[proj.impact]}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
