import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RiArrowRightSLine } from '@remixicon/react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ContributorsDialog } from './contributors-dialog';

export function AvatarCarousel({
  images,
}: {
  images: { url: string; name: string }[];
}) {
  const [contributorsDialogOpen, setContributorsDialogOpen] = useState(false);
  const currentImages = images.slice(0, 5);

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 rtl:space-x-reverse">
        {currentImages.map(({ url, name }) => (
          <TooltipProvider key={name}>
            <Tooltip delayDuration={url ? 0 : 1000000}>
              <TooltipTrigger asChild>
                <Image
                  className="rounded-full h-6 w-6 object-cover"
                  src={url ?? ''}
                  alt={name ?? ''}
                  width={28}
                  height={28}
                />
              </TooltipTrigger>
              <TooltipContent
                className="max-w-[300px] text-center text-xs"
                sideOffset={-60}
              >
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      {images.length > 5 && (
        <Button
          variant={null}
          size="icon"
          onClick={() => setContributorsDialogOpen(true)}
          className="-ml-2 h-7 w-7 text-sm border-0 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full"
          aria-label="Next"
        >
          <RiArrowRightSLine className="h-4 w-4" />
        </Button>
      )}
      <ContributorsDialog
        isOpen={contributorsDialogOpen}
        setOpen={setContributorsDialogOpen}
        contributors={images}
      />
    </div>
  );
}
