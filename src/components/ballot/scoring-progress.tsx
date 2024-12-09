'use client';

import { useMemo } from 'react';

import { Text } from '@/components/ui/text';
import { useBallotContext } from '@/contexts/BallotContext';

import { Progress } from '../ui/progress';

export function ScoringProgressBar() {
  const { ballot } = useBallotContext();

  const quantities = useMemo(() => {
    if (ballot) {
      return {
        total: ballot.total_projects,
        toBeEvaluated: ballot.projects_to_be_evaluated.length,
      };
    }
    return {
      total: 0,
      toBeEvaluated: 0,
    };
  }, [ballot]);

  return (
    <>
      <Progress
        value={
          ((quantities.total - quantities.toBeEvaluated) / quantities.total) *
          100
        }
        className="w-60"
      />
      <Text className="text-center max-w-lg mx-auto text-sm text-muted-foreground">
        You&apos;ve scored {quantities.total - quantities.toBeEvaluated} of{' '}
        {quantities.total} projects
      </Text>
    </>
  );
}
