'use client';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { useAccount } from 'wagmi';

import {
  useBallot,
  useRemoveAllocation,
  useSaveAllocation,
} from '@/hooks/useBallot';
import { useBallotEditor } from '@/hooks/useBallotEditor';
import { Round4Ballot } from '@/types/ballot';

type BallotContext = ReturnType<typeof useBallotEditor>;
const BallotContext = createContext(
  {} as BallotContext & {
    isPending: boolean;
    ballot?: Round4Ballot | null;
  }
);

export function BallotProvider({ children }: PropsWithChildren) {
  const { address } = useAccount();
  const { data: ballot, isFetched, isPending } = useBallot(address);
  const save = useSaveAllocation();
  const remove = useRemoveAllocation();

  const editor = useBallotEditor({
    onUpdate: save.mutate,
    onRemove: remove.mutate,
  });

  useEffect(() => {
    if (isFetched) {
      editor.reset(ballot?.allocations);
    }
  }, [isFetched]); // Only trigger when isFetched is changed

  const value = { ballot, isPending, ...editor };

  return (
    <BallotContext.Provider value={value}>{children}</BallotContext.Provider>
  );
}

export function useBallotContext() {
  return useContext(BallotContext);
}
