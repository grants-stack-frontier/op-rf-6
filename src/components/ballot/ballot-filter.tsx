'use client';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { exportRound5Ballot, ImportBallotDialog } from './import-ballot5';
import { useBallotRound5Context } from './provider5';

export function BallotFilter() {
  const [isOpen, setOpen] = useState(false);
  const { ballot } = useBallotRound5Context();

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-transparent h-10 w-10"
          >
            <Ellipsis className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Import ballot
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              exportRound5Ballot(ballot?.project_allocations ?? [])
            }
          >
            Export ballot
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportBallotDialog isOpen={isOpen} onOpenChange={setOpen} />
    </div>
  );
}
