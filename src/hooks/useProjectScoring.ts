import { useCallback, useMemo, useState } from 'react';

import { Ballot } from '@/__generated__/api/agora.schemas';
import { toast } from '@/components/ui/use-toast';
import {
  addSkippedProject,
  getProjectsSkipped,
  removeSkippedProject,
  setProjectsSkipped,
} from '@/lib/localStorage';
import { ImpactScore, ProjectsSkipped } from '@/types/project-scoring';

import { useSaveProjectImpact } from './useProjectImpact';

import type { Address } from 'viem';

export const scoreLabels: Record<ImpactScore, string> = {
  0: 'Conflict of interest',
  1: 'Very low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Very high',
  999: 'Skip',
};

// Custom hook for project scoring logic
export const useProjectScoring = (
  category: string,
  id: string,
  walletAddress: Address | undefined,
  ballot: Ballot | undefined
) => {
  const [allProjectsScored, setAllProjectsScored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync: saveProjectImpact } = useSaveProjectImpact();

  const projectsScored = useMemo(() => {
    if (ballot) {
      return {
        total: ballot.total_projects,
        votedCount: ballot.projects_allocations?.length,
        allocations: ballot.projects_allocations,
        toBeEvaluated: ballot.projects_to_be_evaluated,
      };
    }
    return {
      total: 0,
      votedCount: 0,
      allocations: [],
      toBeEvaluated: 0,
    };
  }, [ballot]);

  const handleScoreSelect = useCallback(
    async (score: ImpactScore) => {
      if (!walletAddress) {
        console.warn('Wallet address not available');
        return {
          allProjectsScored: false,
        };
      }

      const projectsSkipped = getProjectsSkipped(category, walletAddress);
      let updatedProjectsSkipped: ProjectsSkipped | undefined;

      if (score === 999) {
        updatedProjectsSkipped = addSkippedProject(category, id, walletAddress);
      } else {
        setIsSaving(true);
        try {
          toast({
            loading: true,
            title: 'Saving your impact score',
            variant: 'default',
          });
          await saveProjectImpact({
            projectId: id,
            impact: score,
          });
          if (projectsSkipped?.ids?.includes(id)) {
            updatedProjectsSkipped = removeSkippedProject(
              category,
              id,
              walletAddress
            );
          }
        } catch (error) {
          console.error('Error saving impact score:', error);
          setIsSaving(false);
          return {
            allProjectsScored: false,
          };
        } finally {
          setIsSaving(false);
        }
      }
      if (updatedProjectsSkipped) {
        setProjectsSkipped(category, walletAddress, updatedProjectsSkipped);
      } else {
        setProjectsSkipped(category, walletAddress, projectsSkipped);
      }
      // Only set allProjectsScored if totalProjects is defined and greater than 0
      if (
        projectsScored.total !== undefined &&
        projectsScored.total > 0 &&
        projectsScored.votedCount === projectsScored.total
      ) {
        // All projects must be voted on, including skipped projects. Skipping is not an impact score.
        setAllProjectsScored(true);
      }

      return {
        allProjectsScored, // All projects must be voted on, including skipped projects. Skipping is not an impact score.
      };
    },
    [
      category,
      id,
      projectsScored,
      walletAddress,
      allProjectsScored,
      saveProjectImpact,
    ]
  );

  return { allProjectsScored, handleScoreSelect, isSaving };
};
