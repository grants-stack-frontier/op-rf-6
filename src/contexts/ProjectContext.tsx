import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { useSession } from '@/hooks/useAuth';
import { useProjectById, useProjectsByCategory } from '@/hooks/useProjects';
import { useProjectScoring } from '@/hooks/useProjectScoring';
import { useProjectSorting } from '@/hooks/useProjectSorting';
import { ImpactScore } from '@/types/project-scoring';
import { CategoryId } from '@/types/various';

interface ProjectContextType {
  id: string;
  project: any;
  projects: any[];
  isLoading: boolean;
  isUserCategory: boolean;
  walletAddress: Address | undefined;
  showUnlockDialog: boolean;
  setShowUnlockDialog: (show: boolean) => void;
  handleScore: (score: ImpactScore) => Promise<void>;
  currentProjectScore: ImpactScore | undefined;
  isSaving: boolean;
  isVoted: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{
  children: React.ReactNode;
  id: string;
}> = ({ children, id }) => {
  const { data: session } = useSession();
  const { data: project, isPending: isProjectLoading } = useProjectById(id);
  const { data: projects, isPending: isProjectsLoading } =
    useProjectsByCategory(project?.applicationCategory as CategoryId);
  const { ballot } = useBallotRound5Context();
  const { address } = useAccount();

  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  const currentProject = useMemo(
    () => (project ? { ...project } : undefined),
    [project]
  );

  const walletAddress: Address | undefined = useMemo(
    () => session?.siwe?.address,
    [session?.siwe?.address]
  );
  const userCategory: CategoryId | undefined = useMemo(
    () => session?.category as CategoryId | undefined,
    [session?.category]
  );
  const isUserCategory = useMemo(
    () =>
      !!userCategory &&
      !!project?.applicationCategory &&
      userCategory === project?.applicationCategory,
    [userCategory, project?.applicationCategory]
  );

  const { allProjectsScored, handleScoreSelect, isSaving } = useProjectScoring(
    currentProject?.applicationCategory ?? '',
    currentProject?.applicationId ?? '',
    walletAddress,
    ballot
  );

  const { sortedProjects, isVoted, handleNavigation } = useProjectSorting(
    projects,
    ballot,
    currentProject,
    walletAddress
  );

  const isLastProject = useMemo(() => {
    if (!ballot || !sortedProjects) return false;
    return (
      (ballot.project_allocations?.length ?? 0) === sortedProjects.length - 1
    );
  }, [ballot, sortedProjects]);

  useEffect(() => {
    if (address && allProjectsScored) {
      const dialogShown = localStorage.getItem(
        `unlock_dialog_shown_${address}`
      );
      const ballotUnlocked = localStorage.getItem(`ballot_unlocked_${address}`);
      if (!dialogShown && !ballotUnlocked) {
        setShowUnlockDialog(true);
        localStorage.setItem(`unlock_dialog_shown_${address}`, 'true');
      }
    } else if (address && !allProjectsScored) {
      const dialogShown = localStorage.getItem(
        `unlock_dialog_shown_${address}`
      );
      const ballotUnlocked = localStorage.getItem(`ballot_unlocked_${address}`);
      if (dialogShown)
        localStorage.removeItem(`unlock_dialog_shown_${address}`);
      if (ballotUnlocked) localStorage.removeItem(`ballot_unlocked_${address}`);
    }
  }, [address, allProjectsScored]);

  const handleScore = useCallback(
    async (score: ImpactScore) => {
      const { allProjectsScored } = await handleScoreSelect(score);

      if (isLastProject || allProjectsScored) {
        const dialogShown = localStorage.getItem(
          `unlock_dialog_shown_${address}`
        );
        const ballotUnlocked = localStorage.getItem(
          `ballot_unlocked_${address}`
        );
        if (!dialogShown && !ballotUnlocked) {
          setShowUnlockDialog(true);
          localStorage.setItem(`unlock_dialog_shown_${address}`, 'true');
        } else {
          handleNavigation();
        }
      } else {
        handleNavigation();
      }
    },
    [handleScoreSelect, handleNavigation, isLastProject, address]
  );

  const currentProjectScore = useMemo(() => {
    if (!ballot || !currentProject) return undefined;
    const allocation = ballot.project_allocations?.find(
      (p: { project_id: string }) =>
        p.project_id === currentProject.applicationId
    );
    return allocation ? (allocation.impact as ImpactScore) : undefined;
  }, [ballot, currentProject]);

  const isLoading = useMemo(
    () => isProjectsLoading || isProjectLoading || !currentProject || !projects,
    [isProjectsLoading, isProjectLoading, currentProject, projects]
  );

  const value = useMemo(
    () => ({
      id,
      project: currentProject,
      projects: projects ?? [],
      isLoading,
      isUserCategory,
      walletAddress,
      showUnlockDialog,
      setShowUnlockDialog,
      handleScore,
      currentProjectScore,
      isSaving,
      isVoted,
    }),
    [
      id,
      currentProject,
      projects,
      isLoading,
      isUserCategory,
      walletAddress,
      showUnlockDialog,
      handleScore,
      currentProjectScore,
      isSaving,
      isVoted,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
