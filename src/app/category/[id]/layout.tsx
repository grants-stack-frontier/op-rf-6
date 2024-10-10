'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ProjectsSidebar } from '@/components/project-details/projects-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categories } from '@/lib/categories';
import { CategoryId } from '@/types/various';

export default function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: CategoryId };
}) {
  const router = useRouter();
  const { id } = params;

  return (
    <section className="flex-1">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/budget">Budget</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/category/${id}`}>Category</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Tabs defaultValue={id} className="w-full pt-3">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map(({ id: categoryType, name }) => (
            <TabsTrigger
              onClick={() => router.push(`/category/${categoryType}`)}
              key={categoryType}
              value={categoryType}
              className={`${id === categoryType ? 'text-black' : 'text-gray-500'}`}
            >
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent className="pt-10" value={id}>
          <div className="flex gap-12 mx-auto">
            <section className="flex-1 max-w-[720px]">{children}</section>
            <aside className="max-w-[304px]">
              <ProjectsSidebar id={id} />
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
