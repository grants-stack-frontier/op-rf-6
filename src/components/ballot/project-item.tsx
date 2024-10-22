import { Menu } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Separator } from '@/components/ui/separator';
import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { ProjectAllocationState } from '@/types/ballot';

interface ProjectItemProps {
  project: ProjectAllocationState;
  index: number;
}

const impactScores: { [key: number]: string } = {
  0: 'Conflict of interest',
  1: 'Very low impact',
  2: 'Low impact',
  3: 'Medium impact',
  4: 'High impact',
  5: 'Very high impact',
};

export function ProjectItem({ project, index }: ProjectItemProps) {
  const {
    isMovable,
    handleProjectMove,
    handleAllocationChange,
    handleAllocationSave,
    handlePositionChange,
    budget,
    formatAllocationOPAmount,
    isInteractive,
  } = useBallotRound5Context();

  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <div
      className={`flex justify-between flex-1 border-b gap-1 py-6 ${
        index === 0 ? 'pt-0' : ''
      }`}
      draggable={isMovable && !isInputFocused}
      onDragStart={(e) => {
        if (isMovable && !isInputFocused) {
          e.dataTransfer.setData(
            'text/plain',
            JSON.stringify({ index, id: project.project_id })
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
          const { index: draggedIndex } = JSON.parse(data);
          handleProjectMove(draggedIndex, index);
        }
      }}
    >
      <div className="flex items-start justify-between flex-grow">
        <div className="flex items-start gap-1">
          <div
            className="size-12 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0"
            style={{
              backgroundImage: `url(${project.image})`,
            }}
          />
          <div className="flex flex-col gap-1 ml-4">
            <div>
              <Link href={`/project/${project.project_id}`}>
                <p className="font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px]">
                  {project.name}
                </p>
              </Link>
              <p className="text-[16px] text-[#404454] line-height-[24px] font-regular truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px] dark:text-[#B0B3B8]">
                {project.description}
              </p>
            </div>
            <div className="text-muted-foreground text-xs">
              You scored: {impactScores[project.impact]}
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
              className="text-center"
              value={project.positionInput}
              disabled={!isMovable || !isInteractive}
              onFocus={() => setIsInputFocused(true)}
              onFocusCapture={() => setIsInputFocused(true)}
              onChange={(e) => handlePositionChange(index, e.target.value)}
              onBlur={() => setIsInputFocused(false)}
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
          <div className="flex flex-col justify-start items-center gap-1 max-w-[112px]">
            <div className="relative">
              <NumberInput
                min={0}
                max={100}
                step={1}
                disabled={!isInteractive}
                placeholder="--"
                className="text-center w-[112px]"
                value={project.allocationInput || ''}
                onFocus={() => setIsInputFocused(true)}
                onFocusCapture={() => setIsInputFocused(true)}
                onChange={(e) => handleAllocationChange(index, e.target.value)}
                onBlur={() => {
                  setIsInputFocused(false);
                  handleAllocationSave(index);
                }}
                symbol="%"
                maxDecimals={2}
              />
            </div>
            <div className="text-muted-foreground text-xs">
              {formatAllocationOPAmount(
                (budget * (Number.parseFloat(project.allocationInput) || 0)) /
                  100
              )}{' '}
              OP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
