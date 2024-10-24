'use client';

import { Button } from '../ui/button';
import { AttStarIcon } from './attestation-icons';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AttestationSuperlativeDialog({
  superlative,
  children,
}: {
  superlative: 'cant_live_without' | 'most_positive';
  children: React.ReactNode;
}) {
  const title =
    superlative === 'most_positive'
      ? 'One of the most positively attested projects by Citizens'
      : "One of the top projects that Citizens & Top Delegates can't live without";
  const description =
    superlative === 'most_positive'
      ? 'To receive this accolade: A project has least 20 reviewers, over 95% of those reviewers feel “extremely upset” if the project ceased to exist, and over 95% of those reviewers rate between 9-10.'
      : 'To receive this accolade: A project has least 20 reviewers, and over 90% of those reviewers feel “extremely upset” if the project ceased to exist.';
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[458px]">
        <DialogHeader>
          <div className="flex justify-center items-center mb-4">
            <AttStarIcon size={64} />
          </div>
          <DialogTitle className="text-[#0F111A] dark:text-white text-center text-xl font-semibold leading-7 mb-4">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[#404454] dark:text-[#B0B3B8] text-center text-base font-normal leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <DialogClose asChild>
            <Button className="w-full" variant="destructive">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
