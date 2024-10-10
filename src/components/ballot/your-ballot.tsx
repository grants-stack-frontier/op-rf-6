import { Link, LoaderIcon, Menu } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

import { Separator } from '@/components/ui/separator';
import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { useSession } from '@/hooks/useAuth';
import {
  useSaveRound5Allocation,
  useSaveRound5Position,
  useRound5BallotWeightSum,
  useDistributionMethodFromLocalStorage,
  useDistributionMethod,
  DistributionMethod,
  useIsSavingRound5Ballot,
} from '@/hooks/useBallotRound5';
import { useBudget } from '@/hooks/useBudget';
import { useSaveProjects, useProjectsByCategory } from '@/hooks/useProjects';
import { categoryNames } from '@/lib/categories';
import { Round5ProjectAllocation } from '@/types/ballot';
import { CategoryId } from '@/types/various';

import { SearchInput } from '../common/search-input';
import { MetricsEditor } from '../metrics-editor';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { NumberInput } from '../ui/number-input';

import { BallotSubmitButton } from './ballot-submit-button';
import { SubmitRound5Dialog } from './submit-dialog5';
import { WeightsError } from './weights-error';

interface ProjectAllocationState extends Round5ProjectAllocation {
  allocationInput: string;
  positionInput: string;
}

function formatAllocationOPAmount(amount?: number): string {
  if (amount === undefined) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(amount);
}

const impactScores: { [key: number]: string } = {
  0: 'Conflict of interest',
  1: 'Very low impact',
  2: 'Low impact',
  3: 'Medium impact',
  4: 'High impact',
  5: 'Very high impact',
};

export function YourBallot() {
  const [isSubmitting, setSubmitting] = useState(false);

  const { ballot } = useBallotRound5Context();
  const { mutate: saveAllocation } = useSaveRound5Allocation();
  const { mutateAsync: savePosition } = useSaveRound5Position();
  const allocationSum = useRound5BallotWeightSum();
  const { isPending: isResetting } = useSaveProjects();
  const { getBudget } = useBudget(5);
  const { data: session } = useSession();
  const votingCategory = session?.category;
  const isSavingBallot = useIsSavingRound5Ballot();
  const { data: projects } = useProjectsByCategory(
    votingCategory as CategoryId
  );
  const {
    data: distributionMethod,
    update: updateDistributionMethodLocally,
    isPending: isUpdatingDistributionMethod,
  } = useDistributionMethodFromLocalStorage();

  const { mutate: redistribute } = useDistributionMethod();
  const budget = useMemo(() => {
    if (getBudget.data?.budget && votingCategory) {
      const portion = getBudget.data.allocations?.find(
        (c) => c.category_slug === votingCategory
      )?.allocation;
      return Math.round((getBudget.data.budget * (Number(portion) || 0)) / 100);
    }
    return getBudget.data?.budget ? getBudget.data.budget / 3 : 0;
  }, [getBudget.data, votingCategory]);

  const [projectList, setProjectList] = useState<ProjectAllocationState[]>(
    sortAndPrepProjects(ballot?.project_allocations || [], 'no-conflict')
  );
  const [conflicts, setConflicts] = useState<ProjectAllocationState[]>(
    sortAndPrepProjects(ballot?.project_allocations || [], 'conflict')
  );

  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    setProjectList(
      sortAndPrepProjects(ballot?.project_allocations || [], 'no-conflict')
    );
    setConflicts(
      sortAndPrepProjects(ballot?.project_allocations || [], 'conflict')
    );
  }, [ballot]);

  useEffect(() => {
    if (ballot && distributionMethod === DistributionMethod.CUSTOM) {
      setProjectList(
        sortAndPrepProjects(ballot?.project_allocations || [], 'no-conflict')
      );
      setConflicts(
        sortAndPrepProjects(ballot?.project_allocations || [], 'conflict')
      );
    } else if (
      ballot &&
      !distributionMethod &&
      allocationSum > 0 &&
      !isResetting &&
      !isUpdatingDistributionMethod
    ) {
      updateDistributionMethodLocally(DistributionMethod.CUSTOM);
    } else if (
      ballot &&
      (!distributionMethod ||
        distributionMethod === DistributionMethod.CUSTOM) &&
      allocationSum === 0 &&
      !isResetting &&
      !isUpdatingDistributionMethod
    ) {
      updateDistributionMethodLocally(null);
    }
  }, [
    ballot,
    distributionMethod,
    allocationSum,
    isResetting,
    isUpdatingDistributionMethod,
  ]);

  type Filter = 'conflict' | 'no-conflict';
  function sortAndPrepProjects(
    newProjects: Round5ProjectAllocation[],
    filter?: Filter
  ): ProjectAllocationState[] {
    const projects = newProjects
      .sort((a, b) =>
        distributionMethod === DistributionMethod.CUSTOM
          ? Number(b.allocation) - Number(a.allocation)
          : a.position - b.position
      )
      .map((p, i) => ({
        ...p,
        positionInput: (i + 1).toString(),
        allocation: p.allocation ?? 0,
        allocationInput: p.allocation?.toString() ?? '',
      }));
    if (filter === 'conflict') {
      return projects.filter((p) => p.impact === 0);
    }
    if (filter === 'no-conflict') {
      return projects.filter((p) => p.impact !== 0);
    }
    return projects;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<
    ProjectAllocationState[]
  >([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = projectList.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [searchTerm, projectList]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const displayProjects = searchTerm ? filteredProjects : projectList;

  const isMovable =
    distributionMethod === DistributionMethod.TOP_TO_BOTTOM ||
    distributionMethod === DistributionMethod.TOP_WEIGHTED;

  return (
    <div className="space-y-4">
      <p>
        Your voting category is{' '}
        <a href={`/category/${votingCategory}`} className="underline">
          {votingCategory
            ? categoryNames[votingCategory as CategoryId]
            : 'Unknown'}
        </a>{' '}
        ({ballot?.total_projects} projects)
      </p>
      <Card className="p-6 space-y-8">
        <MetricsEditor budget={budget} />
        <SearchInput
          className="my-2"
          placeholder="Search projects..."
          onChange={handleSearch}
        />

        <div>
          {displayProjects.map((proj, i) => {
            return (
              <div
                key={proj.project_id}
                className={`flex justify-between flex-1 border-b gap-1 py-6 ${
                  i === 0 ? 'pt-0' : ''
                }`}
                draggable={isMovable && !isInputFocused}
                onDragStart={(e) => {
                  if (isMovable && !isInputFocused) {
                    e.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({ index: i, id: proj.project_id })
                    );
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData('text/plain');
                  if (data && isMovable && !isInputFocused) {
                    const { index: draggedIndex, id: draggedId } =
                      JSON.parse(data);
                    const newIndex = i;
                    if (draggedIndex !== newIndex) {
                      const newProjects = [...projectList];
                      const [removed] = newProjects.splice(draggedIndex, 1);
                      newProjects.splice(newIndex, 0, removed);
                      setProjectList(
                        newProjects.map((p, index) => ({
                          ...p,
                          positionInput: (index + 1).toString(),
                        }))
                      );
                      savePosition({
                        id: draggedId,
                        position: newIndex,
                      }).then(() => {
                        redistribute(distributionMethod as DistributionMethod);
                      });
                    }
                  }
                }}
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
                        <p className="text-[16px] text-[#404454] line-height-[24px] font-regular truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px] dark:text-[#B0B3B8]">
                          {projects?.find(
                            (p) =>
                              p.applicationId?.toLowerCase() ===
                              proj.project_id?.toLowerCase()
                          )?.description ?? 'No description'}
                        </p>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        You scored: {impactScores[proj.impact]}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className={`flex justify-center items-center rounded-md w-[42px] h-[40px] bg-[#F2F3F8] text-[#636779] ${
                        !isMovable ? 'bg-gray-200 cursor-not-allowed' : ''
                      }`}
                    >
                      <Input
                        // max={projectList?.length ?? 0}
                        className="text-center"
                        value={proj.positionInput}
                        disabled={!isMovable || isSubmitting || isSavingBallot}
                        onFocus={() => setIsInputFocused(true)}
                        onFocusCapture={(e) => {
                          e.preventDefault();
                          setIsInputFocused(true);
                        }}
                        onChange={async (e) => {
                          const newIndex =
                            Number.parseInt(e.currentTarget.value, 10) - 1;
                          if (
                            isMovable &&
                            // newIndex >= 0 &&
                            (!e.currentTarget.value ||
                              (newIndex < projectList.length && newIndex >= 0))
                          ) {
                            let newProjects = [...projectList];
                            newProjects[i].positionInput =
                              e.currentTarget.value;
                            if (e.currentTarget.value) {
                              const [movedProject] = newProjects.splice(i, 1);
                              newProjects.splice(newIndex, 0, movedProject);
                              newProjects = newProjects.map((p, index) => ({
                                ...p,
                                positionInput: (index + 1).toString(),
                              }));
                            }
                            setProjectList(newProjects);
                          }
                        }}
                        onBlur={async (e) => {
                          setIsInputFocused(false);
                          if (e.target.value === '') {
                            const newProjects = [...projectList];
                            newProjects[i].positionInput = (i + 1).toString();
                            setProjectList(newProjects);
                            return;
                          }
                          const newIndex =
                            Number.parseInt(e.target.value, 10) - 1;
                          if (
                            isMovable &&
                            Number(proj.position) !==
                              Number(proj.positionInput) - 1
                          ) {
                            const newProjects = [...projectList];
                            const [movedProject] = newProjects.splice(i, 1);
                            newProjects.splice(newIndex, 0, movedProject);

                            await savePosition({
                              id: movedProject.project_id,
                              position: newIndex,
                            });

                            // yolo results
                            redistribute(
                              distributionMethod as DistributionMethod
                            );
                          }
                        }}
                      />
                    </div>
                    <div
                      className={`flex justify-center items-center rounded-md w-[42px] h-[40px] ${
                        isMovable
                          ? 'cursor-move bg-[#F2F3F8]'
                          : 'cursor-not-allowed bg-gray-200'
                      } text-[#636779]`}
                    >
                      <Menu />
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <Separator orientation="vertical" className="h-10" />
                </div>
                <div className="flex flex-col justify-start items-center gap-1 max-w-[112px]">
                  <div className="relative">
                    <NumberInput
                      min={0}
                      max={100}
                      step={1}
                      disabled={isSubmitting || isSavingBallot}
                      placeholder="--"
                      className="text-center w-[112px]"
                      value={proj.allocationInput || ''}
                      onFocus={() => setIsInputFocused(true)}
                      onFocusCapture={(e) => {
                        e.preventDefault();
                        setIsInputFocused(true);
                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const newAllocation = Number.parseFloat(inputValue);

                        const newProjectList = [...projectList];
                        newProjectList[i].allocation = Number.isNaN(
                          newAllocation
                        )
                          ? 0
                          : Number(inputValue);
                        newProjectList[i].allocationInput = inputValue;
                        setProjectList(newProjectList);

                        updateDistributionMethodLocally(
                          DistributionMethod.CUSTOM
                        );
                      }}
                      onBlur={() => {
                        setIsInputFocused(false);
                        saveAllocation({
                          project_id: proj.project_id,
                          allocation:
                            Number.parseFloat(proj.allocationInput) || 0,
                        });
                      }}
                      symbol="%"
                      maxDecimals={2}
                    />
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatAllocationOPAmount(
                      (budget *
                        (Number.parseFloat(proj.allocationInput) || 0)) /
                        100
                    )}{' '}
                    OP
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* <OpenSourceMultiplier initialValue={ballot?.os_multiplier} /> */}
        {/* <Button onClick={() => handleImpactChange(ballot?.projects_to_be_evaluated[0] ?? "", 5)}>Score Impact</Button> */}

        <div className="flex flex-col gap-6 mt-6">
          <WeightsError />
          <div className="flex items-center gap-4">
            <BallotSubmitButton onClick={() => setSubmitting(true)} />

            {isSavingBallot && (
              <span className="flex gap-2">
                <LoaderIcon className="animate-spin w-4 h-4" />
                <span className="text-xs">Saving ballot...</span>
              </span>
            )}
          </div>
        </div>

        {ballot?.address && (
          <SubmitRound5Dialog
            ballot={ballot}
            open={isSubmitting}
            onOpenChange={() => setSubmitting(false)}
          />
        )}
      </Card>
      {conflicts.length > 0 && (
        <>
          <h1 className="text-lg font-bold pt-6">Conflicts of interest</h1>
          {conflicts.map((proj, i) => {
            return (
              <div
                key={proj.project_id}
                className="flex justify-between flex-1 border-b gap-1 py-6"
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'text/plain',
                    JSON.stringify({ index: i, id: proj.project_id })
                  );
                }}
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
                          {projects?.find(
                            (p) =>
                              p.applicationId?.toLowerCase() ===
                              proj.project_id?.toLowerCase()
                          )?.description ?? 'No description'}
                        </p>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        You marked: {impactScores[proj.impact]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
