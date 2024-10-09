'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const tabs = [
  {
    children: 'Budget',
    href: '/budget',
  },
  {
    children: 'Ballot',
    href: '/ballot',
  },
];

export function BudgetTabs() {
  const path = usePathname();

  return (
    <section className="flex gap-6 text-2xl">
      {tabs.map((tab, i) => (
        <Link
          key={i}
          className={cn('text-gray-400 font-semibold', {
            ['text-foreground']: tab.href === path, // is active
          })}
          {...tab}
        />
      ))}
    </section>
  );
}
