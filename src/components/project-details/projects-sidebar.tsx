'use client';
import { RiArrowDownLine } from '@remixicon/react';
import Link from 'next/link';
import { PropsWithChildren, useRef, useState } from 'react';
import { useIntersection } from 'react-use';

import { Project } from '@/__generated__/api/agora.schemas';
import { useProjectsByCategory } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { CategoryId } from '@/types/various';

import AvatarPlaceholder from '../../../public/avatar-placeholder.svg';
import { ManualDialog } from '../common/manual-dialog';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Heading } from '../ui/headings';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

export function ProjectsSidebar({ id }: { id: CategoryId }) {
  const { data: projects, isPending } = useProjectsByCategory(id);
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  return (
    <Card
      className={cn('w-[300px] h-[620px] p-6 sticky top-8', {
        ['opacity-50 animate-pulse']: isPending,
      })}
    >
      {projects?.length && (
        <>
          {projects?.length > 1 ? (
            <Heading variant="h3" className="leading-6">
              There are {projects?.length} projects in this category
            </Heading>
          ) : (
            <Heading variant="h3" className="leading-6">
              There are no projects in this category
            </Heading>
          )}
        </>
      )}

      <div className="space-y-2">
        <ScrollArea className="h-[508px] relative">
          {isPending &&
            Array(8)
              .fill(0)
              .map((_, i) => (
                <ProjectItem key={i} isLoading>
                  --
                </ProjectItem>
              ))}
          {projects?.map((item: Project, index: number) => (
            <Link key={`${item.name}-${index}`} href={`/project/${item.id}`}>
              <ProjectItem {...item}>{item.name}</ProjectItem>
            </Link>
          ))}
          <div ref={intersectionRef} />
          {(intersection?.intersectionRatio ?? 0) < 1 && (
            <Badge
              variant="outline"
              className="animate-in fade-in zoom-in absolute bottom-2 left-1/2 -translate-x-1/2 bg-white dark:text-black"
            >
              More <RiArrowDownLine className="ml-2 size-3 " />
            </Badge>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
}

function ProjectItem({
  name,
  profileAvatarUrl = AvatarPlaceholder.src,
  isLoading,
}: PropsWithChildren<Project> & { isLoading?: boolean }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <div className="flex text-xs items-center justify-between py-2 flex-1 border-b text-muted-foreground">
        <div className="flex gap-2 items-center max-w-[204px] ">
          <div
            className="size-4 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0"
            style={{
              backgroundImage: `url(${profileAvatarUrl})`,
            }}
          />
          <div className="truncate">
            {name || <Skeleton className="h-3 w-16" />}
          </div>
        </div>
        <div className={cn({ ['text-gray-400']: isLoading })}>
          {/* {children} */}
        </div>
      </div>
      <ManualDialog open={isOpen} onOpenChange={setOpen} />
    </>
  );
}
