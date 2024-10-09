'use client';
import React, { createContext, useContext } from 'react';

import { Project } from '@/__generated__/api/agora.schemas';
import { useBudgetForm } from '@/hooks/useBudgetForm';
import { Category } from '@/types/categories';
import { CategoryId } from '@/types/various';

interface BudgetContextType {
  categories: Category[] | undefined;
  allProjectsByCategory?: Record<string, Project[]>;
  allocations: Record<string, number>;
  lockedFields: Record<string, boolean>;
  handleValueChange: (
    categoryId: CategoryId,
    newValue: number,
    locked: boolean
  ) => void;
  toggleLock: (categoryId: CategoryId) => void;
  error: string;
  isLoading: boolean;
  totalBudget: number;
  setTotalBudget: (budget: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: React.PropsWithChildren) {
  const budgetForm = useBudgetForm();

  return (
    <BudgetContext.Provider value={budgetForm}>
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
};
