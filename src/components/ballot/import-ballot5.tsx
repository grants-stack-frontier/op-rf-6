'use client';

import { type ComponentProps, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';

import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { useSession } from '@/hooks/useAuth';
import {
  DistributionMethod,
  useDistributionMethodFromLocalStorage,
  useBallot,
} from '@/hooks/useBallotRound5';
import { useProjectsByCategory, useSaveProjects } from '@/hooks/useProjects';
import { format, parseCSV } from '@/lib/csv';
import mixpanel from '@/lib/mixpanel';
import { Round5ProjectAllocation } from '@/types/ballot';
import { ImpactScore } from '@/types/project-scoring';
import type { CategoryId } from '@/types/various';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from '../ui/use-toast';

export function ImportBallotDialog({
  isOpen,
  onOpenChange,
}: ComponentProps<typeof Dialog> & { isOpen: boolean }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import ballot</DialogTitle>
          <DialogDescription>
            Heads up! If you import a ballot, you&apos;ll lose your existing
            work. The accepted format is .csv.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <ImportBallotButton onClose={() => onOpenChange?.(false)} />
          <ExportBallotButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportBallotButton({ onClose }: { onClose: () => void }) {
  const { ballot, reset } = useBallotRound5Context();
  const { mutateAsync: saveProjects } = useSaveProjects();
  const { address } = useAccount();
  const { refetch } = useBallot(address);
  const { data: session } = useSession();
  const { data: projects } = useProjectsByCategory(
    session?.category as CategoryId
  );
  const { update } = useDistributionMethodFromLocalStorage();

  const ref = useRef<HTMLInputElement>(null);

  const importCSV = useCallback(
    (csvString: string) => {
      // Parse CSV and build the ballot data (remove name column)
      const { data } = parseCSV<Round5ProjectAllocation>(csvString);
      const allocations = data.map(({ project_id, allocation, impact }) => ({
        project_id,
        allocation: Number(allocation).toString(),
        impact: Number(impact) as ImpactScore,
      }));

      if (allocations.length !== data.length) {
        alert(
          'One or more of the project IDs were not correct and have been removed.'
        );
      }

      reset(
        allocations.map((alloc) => ({
          project_id: alloc.project_id,
          allocation: Number(alloc.allocation),
          impact: alloc.impact,
          name: ballot?.project_allocations.find(
            (p) => p.project_id === alloc.project_id
          )?.name,
          image: ballot?.project_allocations.find(
            (p) => p.project_id === alloc.project_id
          )?.image,
          position: ballot?.project_allocations.find(
            (p) => p.project_id === alloc.project_id
          )?.position,
        })) as Round5ProjectAllocation[]
      );

      mixpanel.track('Import CSV', { ballotSize: allocations.length });

      saveProjects({
        projects: allocations.filter(
          (alloc) =>
            !!projects?.find((p) => p.applicationId === alloc.project_id)
        ),
        action: 'import',
      })
        .then(() => {
          update(DistributionMethod.CUSTOM);
          refetch();
          onClose();
        })
        .catch(() => {
          toast({
            title: 'Error importing ballot',
            variant: 'destructive',
          });
        });
    },
    [ballot, reset]
  );

  return (
    <>
      <Button variant="destructive" onClick={() => ref.current?.click()}>
        Import
      </Button>
      <input
        ref={ref}
        type="file"
        accept="*.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => importCSV(String(reader.result));
            reader.onerror = () => console.log(reader.error);
          }
        }}
      />
    </>
  );
}

function ExportBallotButton() {
  const { ballot } = useBallotRound5Context();
  const emptyBallot: any[] = ballot
    ? ballot.project_allocations.map((alloc) => ({
        project_id: alloc.project_id,
        name: alloc.name,
        allocation: 0,
        impact: alloc.impact,
      }))
    : [{ project_id: '0x0', name: 'Some project', allocation: 0, impact: 0 }];

  return (
    <Button variant="outline" onClick={() => exportRound5Ballot(emptyBallot)}>
      Download ballot template
    </Button>
  );
}

export function exportRound5Ballot(ballot: Round5ProjectAllocation[]) {
  const csv = format(
    ballot.map((alloc) => ({
      project_id: alloc.project_id,
      name: alloc.name,
      allocation: alloc.allocation,
      impact: alloc.impact,
    })),
    {}
  );
  mixpanel.track('Export CSV', { ballotSize: ballot.length });

  // Create a Blob with the CSV content
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'ballot_template.csv');
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
