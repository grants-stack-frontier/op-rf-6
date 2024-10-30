'use client';
import { RiLockUnlockFill } from '@remixicon/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

import { useBallotRound5Context } from '@/contexts/BallotRound5Context';
import { useProjectContext } from '@/contexts/ProjectContext';

import { LoadingDialog } from '../common/loading-dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { ROUND } from '@/config';

export function UnlockBallotDialog() {
  const { showUnlockDialog: isOpen, setShowUnlockDialog: setOpen } =
    useProjectContext();
  const [isUnlockedLoading, setIsUnlockedLoading] = useState(false);
  const router = useRouter();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const roundId = ROUND;
  const { updateBallotState } = useBallotRound5Context();

  const handleUnlock = useCallback(async () => {
    setIsUnlockedLoading(true);
    try {
      if (address) {
        localStorage.setItem(`ballot_unlocked_${address}`, 'true');
      }

      await updateBallotState();

      await queryClient.invalidateQueries({
        queryKey: ['budget', address, roundId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['ballot', address, roundId],
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      setOpen?.(false);
      router.push('/ballot');
    } catch (error) {
      console.error('Error unlocking ballot:', error);
    } finally {
      setIsUnlockedLoading(false);
    }
  }, [router, setOpen, address, queryClient, roundId, updateBallotState]);

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-col items-center gap-4">
            <AlertDialogTitle>
              <RiLockUnlockFill className="w-16 h-16" />
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xl font-medium">
              Nice work! You&apos;re ready to unlock your ballot and allocate
              rewards
            </AlertDialogDescription>
            <p className="text-sm">
              We&apos;ll use your scores to position projects in your unlocked
              ballot.
            </p>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleUnlock}
              disabled={isUnlockedLoading}
            >
              Unlock ballot
            </Button>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
      <LoadingDialog
        isOpen={isUnlockedLoading}
        setOpen={setIsUnlockedLoading}
        message="Unlocking your ballot"
      />
    </>
  );
}
