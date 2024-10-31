import debounce from 'lodash.debounce';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';

import { updateRetroFundingRoundBudgetAllocation } from '@/__generated__/api/agora';
import { ROUND } from '@/config';
import { useAllProjectsByCategory } from '@/hooks/useProjects';
import { calculateBalancedAmounts, isCloseEnough } from '@/lib/budgetHelpers';
import { categories } from '@/lib/categories';
import type { CategoryId } from '@/types/various';

import { useSession } from './useAuth';
import { useBudget } from './useBudget';

export function useBudgetForm() {
  const roundId = ROUND;
  const { address } = useAccount();
  const allProjectsByCategory = useAllProjectsByCategory();
  const { getBudget, saveAllocation } = useBudget(roundId);
  const [totalBudget, setTotalBudget] = useState<number>(1_100_000);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const session = useSession();

  const allocationsRef = useRef(allocations);
  const lockedFieldsRef = useRef(lockedFields);
  const hasRefetchedRef = useRef(false);

  // Effect to refetch budget data when the session (token) changes
  useEffect(() => {
    if (session.data && !hasRefetchedRef.current) {
      getBudget.refetch().then(() => {
        hasRefetchedRef.current = true;
      });
    }
  }, [session.data, getBudget]);

  // Reset the hasRefetchedRef when the session changes
  useEffect(() => {
    hasRefetchedRef.current = false;
  }, [session.data]);

  const checkTotalAllocation = useCallback((allocs: Record<string, number>) => {
    const total = Object.values(allocs).reduce((sum, value) => sum + value, 0);
    const diff = (100 - total).toFixed(5);

    if (!isCloseEnough(total, 100)) {
      if (total < 100) {
        setError(
          `Percentages must equal 100% (add ${diff}% to your categories)`
        );
      } else {
        setError(
          `Percentages must equal 100% (remove ${Math.abs(
            Number(diff)
          )}% from your categories)`
        );
      }
      return false;
    }
    setError('');
    return true;
  }, []);

  const getDefaultAllocations = useCallback((categories: any[]) => {
    return categories.reduce(
      (acc, category) => {
        acc[category.id] = 33.33;
        return acc;
      },
      {} as Record<string, number>
    );
  }, []);

  useEffect(() => {
    if (getBudget.data) {
      const newAllocations: Record<string, number> = {};
      setTotalBudget(getBudget.data.budget ?? 1_100_000);
      for (const allocation of getBudget.data.allocations || []) {
        if (allocation.category_slug !== undefined) {
          newAllocations[allocation.category_slug] = Number(
            allocation.allocation
          );
        }
      }
      setAllocations(newAllocations);
      checkTotalAllocation(newAllocations);
    }
  }, [getBudget.data, checkTotalAllocation]);

  useEffect(() => {
    allocationsRef.current = allocations;
  }, [allocations]);

  useEffect(() => {
    lockedFieldsRef.current = lockedFields;
  }, [lockedFields]);

  useEffect(() => {
    if (categories) {
      if (
        getBudget?.data?.allocations &&
        getBudget?.data?.allocations.length > 0
      ) {
        setAllocations((prevAllocations) => {
          const newAllocations: Record<string, number> = {};
          for (const allocation of getBudget?.data?.allocations || []) {
            if (allocation.category_slug !== undefined) {
              newAllocations[allocation.category_slug] = Number(
                allocation.allocation
              );
            }
          }

          return Object.keys(newAllocations).some(
            (key) => newAllocations[key] !== prevAllocations[key]
          )
            ? newAllocations
            : prevAllocations;
        });

        setLockedFields((prevLockedFields) => {
          const newLockedFields: Record<string, boolean> = {};
          for (const allocation of getBudget?.data?.allocations || []) {
            if (allocation.category_slug !== undefined) {
              newLockedFields[allocation.category_slug] =
                allocation.locked ?? false;
            }
          }

          return Object.keys(newLockedFields).some(
            (key) => newLockedFields[key] !== prevLockedFields[key]
          )
            ? newLockedFields
            : prevLockedFields;
        });
      } else {
        const defaultAllocations = getDefaultAllocations(categories);
        setAllocations(defaultAllocations);

        const defaultLockedFields = categories.reduce(
          (acc, category) => {
            acc[category.id] = false;
            return acc;
          },
          {} as Record<string, boolean>
        );

        setLockedFields(defaultLockedFields);
      }

      checkTotalAllocation(
        getBudget?.data?.allocations && getBudget?.data?.allocations.length > 0
          ? Object.fromEntries(
              getBudget?.data?.allocations.map((allocation) => [
                allocation.category_slug,
                Number(allocation.allocation),
              ])
            )
          : getDefaultAllocations(categories)
      );
    }
  }, [
    getBudget?.data?.allocations,
    getDefaultAllocations,
    checkTotalAllocation,
    getBudget?.data,
  ]);

  const saveAllocationToBackend = useCallback(
    (categoryId: CategoryId, allocation: number, locked: boolean) => {
      saveAllocation.mutate(
        {
          category_slug: categoryId,
          allocation: allocation,
          locked: locked,
        },
        {
          onError: () => {
            setError('An error occurred while saving. Please try again.');
          },
        }
      );
    },
    [saveAllocation]
  );

  const debouncedSaveAllocation = useRef(
    debounce(saveAllocationToBackend, 300)
  ).current;

  const handleValueChange = useCallback(
    (categoryId: CategoryId, newValue: number) => {
      if (!address) return;

      const unlockedCategories = Object.entries(lockedFields).filter(
        ([_, isLocked]) => !isLocked
      );
      const isModificationNotAllowed =
        (unlockedCategories.length === 1 &&
          unlockedCategories[0][0] === categoryId) ||
        (lockedFields[categoryId] && unlockedCategories.length === 0);

      if (isModificationNotAllowed) {
        setError(
          'Unable to modify allocation. Please ensure at least one other category is unlocked before making changes.'
        );
        return;
      }

      const validatedValue = Math.max(0, Math.min(newValue, 100));
      const tempAllocations = { ...allocations, [categoryId]: validatedValue };
      const rebalancedAllocations = calculateBalancedAmounts(
        tempAllocations,
        lockedFields,
        categoryId,
        validatedValue
      );

      if (!checkTotalAllocation(rebalancedAllocations)) return;

      setError('');

      setAllocations(rebalancedAllocations);
      setLockedFields((prev) => ({
        ...prev,
        [categoryId]: true,
      }));

      debouncedSaveAllocation(
        categoryId,
        rebalancedAllocations[categoryId],
        true
      );
    },
    [
      address,
      allocations,
      lockedFields,
      checkTotalAllocation,
      debouncedSaveAllocation,
    ]
  );

  const toggleLock = useCallback(
    (categoryId: CategoryId) => {
      setLockedFields((prevLockedFields) => {
        const newLockedState = !prevLockedFields[categoryId];
        const newLockedFields = {
          ...prevLockedFields,
          [categoryId]: newLockedState,
        };

        setAllocations((prevAllocations) => {
          const totalLockedAllocation = Object.entries(newLockedFields)
            .filter(([_, isLocked]) => isLocked)
            .reduce((sum, [id, _]) => sum + prevAllocations[id], 0);

          const unlockedCategoryIds = Object.keys(newLockedFields).filter(
            (id) => !newLockedFields[id]
          );

          const remainingAllocation = 100 - totalLockedAllocation;
          const newAllocations = { ...prevAllocations };

          if (unlockedCategoryIds.length > 0) {
            const equalAllocation =
              remainingAllocation / unlockedCategoryIds.length;
            for (const id of unlockedCategoryIds) {
              newAllocations[id] = equalAllocation;
            }
          }

          for (const id of Object.keys(newAllocations)) {
            saveAllocationToBackend(
              id as CategoryId,
              newAllocations[id],
              newLockedFields[id]
            );
          }

          return newAllocations;
        });

        return newLockedFields;
      });
    },
    [saveAllocationToBackend]
  );

  const saveTotalBudgetToBackend = useCallback(
    async (budget: number) => {
      if (!address) return;
      try {
        await updateRetroFundingRoundBudgetAllocation(roundId, address, budget);
      } catch (error) {
        console.error('Failed to save budget allocation:', error);
        setError(
          'An error occurred while saving the total budget. Please try again.'
        );
      }
    },
    [address]
  );

  const debouncedSaveTotalBudget = useRef(
    debounce(saveTotalBudgetToBackend, 300)
  ).current;

  const handleTotalBudgetChange = useCallback(
    (newBudget: number) => {
      setTotalBudget(newBudget);
      debouncedSaveTotalBudget(newBudget);
    },
    [debouncedSaveTotalBudget]
  );

  const isLoading =
    getBudget.isLoading ||
    getBudget.isFetching ||
    allProjectsByCategory.isLoading ||
    allProjectsByCategory.isFetching ||
    saveAllocation.isPending;

  return {
    categories,
    allProjectsByCategory: allProjectsByCategory.data,
    allocations,
    budget: getBudget.data?.budget,
    lockedFields,
    handleValueChange,
    toggleLock,
    error,
    isLoading,
    totalBudget,
    setTotalBudget: handleTotalBudgetChange,
  };
}
