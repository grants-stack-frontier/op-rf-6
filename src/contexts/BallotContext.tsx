'use client';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { useGetRetroFundingRoundBallotById } from '@/__generated__/api/agora';
import {
  Ballot,
  RetroFundingBallot5ProjectsAllocation,
} from '@/__generated__/api/agora.schemas';
import { ROUND } from '@/config';
import { useSession } from '@/hooks/useAuth';
import {
  useSavePosition,
  useBallotWeightSum,
  useDistributionMethod,
  DistributionMethod,
  useIsSavingBallot,
  useSaveAllocation,
} from '@/hooks/useBallot';
import { useBallotEditor } from '@/hooks/useBallotEditor';
import { useBudget } from '@/hooks/useBudget';
import { useDistributionMethodFromLocalStorage } from '@/hooks/useDistributionMethod';
import { useProjectsByCategory } from '@/hooks/useProjects';
import { useProjectScoring } from '@/hooks/useProjectScoring';
import { useProjectSorting } from '@/hooks/useProjectSorting';
import { ProjectAllocationState } from '@/types/ballot';
import { ImpactScore } from '@/types/project-scoring';
import { CategoryId } from '@/types/various';

type BallotContext = ReturnType<typeof useBallotEditor> & {
  isPending: boolean;
  ballot?: Ballot | undefined;
  updateBallotState: () => Promise<void>;
  projectList: ProjectAllocationState[];
  conflicts: ProjectAllocationState[];
  displayProjects: ProjectAllocationState[];
  isLoading: boolean;
  isUserCategory: boolean;
  walletAddress: Address | undefined;
  showUnlockDialog: boolean;
  setShowUnlockDialog: (show: boolean) => void;
  handleScore: (score: ImpactScore) => Promise<void>;
  currentProjectScore: ImpactScore | undefined;
  isSaving: boolean;
  isVoted: boolean;
  budget: number;
  isInteractive: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isMovable: boolean;
  handleProjectMove: (draggedIndex: number, newIndex: number) => void;
  handleAllocationChange: (index: number, value: string) => void;
  handleAllocationSave: (index: number) => void;
  handlePositionChange: (index: number, value: string) => void;
  isSubmitting: boolean;
  setSubmitting: (isSubmitting: boolean) => void;
  votingCategory?: CategoryId;
  formatAllocationOPAmount: (amount?: number) => string;
  distributionMethod: DistributionMethod | null;
  isSavingBallot: boolean;
};

const BallotContext = createContext({} as BallotContext);

export function BallotProvider({ children }: PropsWithChildren) {
  const { address } = useAccount();
  const { data, isFetched, isPending, refetch } =
    useGetRetroFundingRoundBallotById(ROUND, address ?? '');
  const ballot = data as Ballot;
  const [localBallot, setLocalBallot] = useState<Ballot | undefined>(ballot);

  const editor = useBallotEditor();

  const { data: session } = useSession();
  const votingCategory = session?.category as CategoryId;
  const { data: projects } = useProjectsByCategory(votingCategory);
  const {
    data: distributionMethod,
    update: updateDistributionMethodLocally,
    isPending: isUpdatingDistributionMethod,
  } = useDistributionMethodFromLocalStorage();
  const { mutate: redistribute, isPending: isRedistributing } =
    useDistributionMethod();
  const { mutateAsync: savePosition } = useSavePosition();
  const allocationSum = useBallotWeightSum();
  const { getBudget } = useBudget(ROUND);
  const isSavingBallot = useIsSavingBallot();
  const { mutate: saveAllocation } = useSaveAllocation();

  const [isSubmitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [projectList, setProjectList] = useState<ProjectAllocationState[]>([]);
  const [conflicts, setConflicts] = useState<ProjectAllocationState[]>([]);

  const isInteractive = useMemo(() => {
    return (
      !isPending &&
      !isSubmitting &&
      !isSavingBallot &&
      !isRedistributing &&
      projectList.length > 0 &&
      !!projects
    );
  }, [
    isPending,
    isSubmitting,
    isRedistributing,
    isSavingBallot,
    projectList,
    projects,
  ]);

  useEffect(() => {
    if (isFetched) {
      editor.reset(ballot?.projects_allocations);
    }
    setLocalBallot(ballot);
  }, [isFetched, ballot]);

  const updateBallotState = useCallback(async () => {
    if (localBallot) {
      const updatedBallot = {
        ...localBallot,
        projects_to_be_evaluated: [],
        total_projects: localBallot.projects_allocations?.length || 0,
      };
      setLocalBallot(updatedBallot);
      await refetch();
    }
  }, [localBallot, refetch]);

  const budget = useMemo(() => {
    if (getBudget.data?.budget && votingCategory) {
      const portion = getBudget.data.allocations?.find(
        (c) => c.category_slug === votingCategory
      )?.allocation;
      return Math.round((getBudget.data.budget * (Number(portion) || 0)) / 100);
    }
    return getBudget.data?.budget ? getBudget.data.budget / 3 : 0;
  }, [getBudget.data, votingCategory]);

  useEffect(() => {
    setProjectList(
      sortAndPrepProjects(
        localBallot?.projects_allocations || [],
        'no-conflict'
      )
    );
    setConflicts(
      sortAndPrepProjects(localBallot?.projects_allocations || [], 'conflict')
    );
  }, [localBallot]);

  useEffect(() => {
    if (localBallot && distributionMethod === DistributionMethod.CUSTOM) {
      setProjectList(
        sortAndPrepProjects(
          localBallot?.projects_allocations || [],
          'no-conflict'
        )
      );
      setConflicts(
        sortAndPrepProjects(localBallot?.projects_allocations || [], 'conflict')
      );
    } else if (
      localBallot &&
      !distributionMethod &&
      allocationSum > 0 &&
      !isUpdatingDistributionMethod
    ) {
      updateDistributionMethodLocally(DistributionMethod.CUSTOM);
    } else if (
      localBallot &&
      (!distributionMethod ||
        distributionMethod === DistributionMethod.CUSTOM) &&
      allocationSum === 0 &&
      !isUpdatingDistributionMethod
    ) {
      updateDistributionMethodLocally(null);
    }
  }, [
    localBallot,
    distributionMethod,
    allocationSum,
    isUpdatingDistributionMethod,
  ]);

  const { allProjectsScored, handleScoreSelect, isSaving } = useProjectScoring(
    votingCategory ?? '',
    projectList[0]?.project_id ?? '',
    address,
    localBallot
  );

  const { sortedProjects, isVoted, handleNavigation } = useProjectSorting(
    projects,
    localBallot,
    projectList[0],
    address
  );

  const isLastProject = useMemo(() => {
    if (!localBallot || !sortedProjects) return false;
    return (
      (localBallot.projects_allocations?.length ?? 0) ===
      sortedProjects.length - 1
    );
  }, [localBallot, sortedProjects]);

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
    if (!localBallot || !projectList[0]) return undefined;
    const allocation = localBallot.projects_allocations?.find(
      (p: RetroFundingBallot5ProjectsAllocation) =>
        p.project_id === projectList[0].project_id
    );
    return allocation ? (allocation.impact as ImpactScore) : undefined;
  }, [localBallot, projectList]);

  const isLoading = useMemo(
    () => !projectList.length || !projects,
    [projectList, projects]
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProjects = useMemo(() => {
    if (searchTerm) {
      return projectList.filter((project) =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  }, [searchTerm, projectList]);

  const handleProjectMove = useCallback(
    (draggedIndex: number, newIndex: number) => {
      const newProjects = [...projectList];
      const [removed] = newProjects.splice(draggedIndex, 1);
      newProjects.splice(newIndex, 0, removed);
      setProjectList(
        newProjects.map((p, index) => ({
          ...p,
          positionInput: (index + 1).toString(),
        }))
      );
      if (removed.project_id) {
        savePosition({
          project_id: removed.project_id,
          position: newIndex,
        }).then(() => {
          if (distributionMethod) {
            redistribute(distributionMethod);
          }
        });
      }
    },
    [projectList, savePosition, redistribute, distributionMethod]
  );

  const handleAllocationChange = useCallback(
    (index: number, value: string) => {
      const newProjectList = [...projectList];
      newProjectList[index].allocationInput = value;
      setProjectList(newProjectList);
    },
    [projectList]
  );
  const handleAllocationSave = useCallback(
    (index: number) => {
      const project = projectList[index];
      const newAllocation = Number.parseFloat(project.allocationInput);
      const normalizedNewAllocation = Number.isNaN(newAllocation)
        ? 0
        : newAllocation;

      if (Number(normalizedNewAllocation) !== Number(project.allocation)) {
        const newProjectList = [...projectList];
        newProjectList[index].allocation = normalizedNewAllocation;
        setProjectList(newProjectList);

        updateDistributionMethodLocally(DistributionMethod.CUSTOM);

        if (project.project_id) {
          saveAllocation({
            project_id: project.project_id,
            allocation: normalizedNewAllocation,
          });
        }
      }
    },
    [projectList, updateDistributionMethodLocally, saveAllocation]
  );

  const handlePositionChange = useCallback(
    (index: number, value: string) => {
      const newIndex = Number.parseInt(value, 10) - 1;
      if (
        newIndex >= 0 &&
        newIndex < projectList.length &&
        newIndex !== index
      ) {
        const newProjects = [...projectList];
        const [movedProject] = newProjects.splice(index, 1);
        newProjects.splice(newIndex, 0, movedProject);
        setProjectList(
          newProjects.map((p, i) => ({
            ...p,
            positionInput: (i + 1).toString(),
          }))
        );
        if (movedProject.project_id) {
          savePosition({
            project_id: movedProject.project_id,
            position: newIndex,
          }).then(() => {
            redistribute(distributionMethod as DistributionMethod);
          });
        }
      }
    },
    [projectList, savePosition, redistribute, distributionMethod]
  );

  const formatAllocationOPAmount = useCallback((amount?: number): string => {
    if (amount === undefined) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(amount);
  }, []);

  function sortAndPrepProjects(
    newProjects: RetroFundingBallot5ProjectsAllocation[],
    filter?: 'conflict' | 'no-conflict'
  ): ProjectAllocationState[] {
    const preparedProjects = newProjects
      .sort((a, b) => {
        if (distributionMethod === DistributionMethod.CUSTOM) {
          return Number(b.allocation) - Number(a.allocation);
        }
        const positionA = a.position ?? Number.MAX_SAFE_INTEGER;
        const positionB = b.position ?? Number.MAX_SAFE_INTEGER;
        return positionA - positionB;
      })
      .map((p, i) => {
        const fullProjectInfo = projects?.find(
          (project) =>
            project.applicationId?.toLowerCase() === p.project_id?.toLowerCase()
        );
        return {
          ...p,
          positionInput: (i + 1).toString(),
          allocation: p.allocation ?? 0,
          allocationInput: p.allocation?.toString() ?? '',
          description: fullProjectInfo?.description ?? 'No description',
        };
      });

    if (filter === 'conflict') {
      return preparedProjects.filter((p) => p.impact === 0);
    }
    if (filter === 'no-conflict') {
      return preparedProjects.filter((p) => p.impact !== 0);
    }
    return preparedProjects;
  }

  const value = {
    ...editor,
    isPending,
    ballot: localBallot,
    updateBallotState,
    projectList,
    conflicts,
    displayProjects: searchTerm ? filteredProjects : projectList,
    isLoading,
    isUserCategory: !!votingCategory,
    walletAddress: address,
    showUnlockDialog,
    setShowUnlockDialog,
    handleScore,
    currentProjectScore,
    isSaving,
    isVoted,
    budget,
    searchTerm,
    setSearchTerm,
    handleSearch,
    isMovable:
      distributionMethod === DistributionMethod.TOP_TO_BOTTOM ||
      distributionMethod === DistributionMethod.TOP_WEIGHTED,
    handleProjectMove,
    handleAllocationChange,
    handleAllocationSave,
    isInteractive,
    handlePositionChange,
    isSubmitting,
    setSubmitting,
    votingCategory,
    formatAllocationOPAmount,
    distributionMethod: distributionMethod ?? null,
    isSavingBallot,
  };

  return (
    <BallotContext.Provider value={value}>{children}</BallotContext.Provider>
  );
}

export function useBallotContext() {
  return useContext(BallotContext);
}
