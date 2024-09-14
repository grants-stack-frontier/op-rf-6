"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useBudgetForm } from "@/hooks/useBudgetForm";
import { Category } from "@/data/categories";
import { CategoryId } from "@/types/shared";
import debounce from "lodash.debounce";

interface BudgetContextType {
  categories: Category[] | undefined;
  countPerCategory: Record<string, number>;
  allocations: Record<string, number>;
  lockedFields: Record<string, boolean>;
  handleValueChange: (
    categoryId: CategoryId,
    newValue: number,
    locked: boolean
  ) => void;
  refetchBudget: () => void;
  toggleLock: (categoryId: CategoryId) => void;
  error: string;
}

const EPSILON = 1e-10;

const isCloseEnough = (value: number, target: number): boolean => {
  return Math.abs(value - target) < EPSILON;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: React.PropsWithChildren) {
  const categories = useCategories();
  const projects = useProjects();
  const roundId = 5;
  const { getBudget, saveAllocation } = useBudgetForm(roundId);

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [countPerCategory, setCountPerCategory] = useState<
    Record<string, number>
  >({});
  const [error, setError] = useState("");

  const lockedFieldsRef = useRef(lockedFields);

  useEffect(() => {
    lockedFieldsRef.current = lockedFields;
  }, [lockedFields]);

  useEffect(() => {
    if (projects.data && categories.data) {
      const counts = projects.data.reduce((acc, project) => {
        const category = categories.data.find(
          (cat) => cat.id === project.category
        );
        if (category) {
          acc[category.id] = (acc[category.id] ?? 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      setCountPerCategory(counts);

      if (getBudget.data) {
        const newAllocations: Record<string, number> = {};
        const newLockedFields: Record<string, boolean> = {};
        getBudget.data.forEach((allocation) => {
          if (allocation.category_slug !== undefined) {
            newAllocations[allocation.category_slug] = Number(
              allocation.allocation
            );
            newLockedFields[allocation.category_slug] =
              allocation.locked ?? false;
          }
        });
        setAllocations(newAllocations);
        setLockedFields(newLockedFields);
      } else {
        setAllocations(
          categories.data.reduce((acc, category) => {
            acc[category.id] = 100 / categories.data.length;
            return acc;
          }, {} as Record<string, number>)
        );
        setLockedFields(
          categories.data.reduce((acc, category) => {
            acc[category.id] = false;
            return acc;
          }, {} as Record<string, boolean>)
        );
      }
    }
  }, [projects.data, categories.data, getBudget.data]);

  const autobalanceAllocations = useCallback(
    (
      allocations: Array<{ id: string; allocation: number; locked: boolean }>,
      idToSkip: string
    ) => {
      const [amountToBalance, totalUnlocked, unlockedEntities] =
        allocations.reduce(
          (acc, allocation) => {
            acc[0] -=
              allocation.locked || allocation.id === idToSkip
                ? Number(allocation.allocation.toFixed(2))
                : 0;
            return [
              acc[0] < 0 ? 0 : acc[0],
              acc[1] +
                (allocation.locked || allocation.id === idToSkip
                  ? 0
                  : Number(allocation.allocation.toFixed(2))),
              acc[2] +
                (allocation.locked || allocation.id === idToSkip ? 0 : 1),
            ];
          },
          [100, 0, 0]
        );

      return allocations.map((allocation) => {
        if (!allocation.locked && allocation.id !== idToSkip) {
          return {
            ...allocation,
            allocation: totalUnlocked
              ? (Number(allocation.allocation.toFixed(2)) / totalUnlocked) *
                amountToBalance
              : unlockedEntities
              ? amountToBalance / unlockedEntities
              : 0,
          };
        }
        return allocation;
      });
    },
    []
  );

  const calculateBalancedAmounts = useCallback(
    (
      allocations: Record<string, number>,
      changedCategoryId: string,
      newValue: number
    ) => {
      const currentLockedFields = lockedFieldsRef.current;

      let newAllocations = Object.entries(allocations).map(
        ([id, allocation]) => ({
          id,
          allocation: id === changedCategoryId ? newValue : allocation,
          locked: currentLockedFields[id],
        })
      );

      const balancedAllocations = autobalanceAllocations(
        newAllocations,
        changedCategoryId
      );

      return Object.fromEntries(
        balancedAllocations.map(({ id, allocation }) => [
          id,
          Number(allocation.toFixed(14)),
        ])
      );
    },
    [autobalanceAllocations]
  );

  const handleValueChange = useCallback(
    (categoryId: CategoryId, newValue: number, locked: boolean) => {
      const validatedValue = Math.max(0, newValue);

      setAllocations((prevAllocations) => {
        const tempUpdatedAllocations = {
          ...prevAllocations,
          [categoryId]: validatedValue,
        };

        // Attempt to rebalance immediately
        const rebalancedAllocations = calculateBalancedAmounts(
          tempUpdatedAllocations,
          categoryId,
          validatedValue
        );

        // Check if the rebalanced total is close enough to 100%
        const rebalancedTotal = Object.values(rebalancedAllocations).reduce(
          (sum, value) => sum + value,
          0
        );

        if (rebalancedTotal > 100 && !isCloseEnough(rebalancedTotal, 100)) {
          setError(
            "This change would result in a total allocation significantly over 100%. Please adjust your input."
          );
          return prevAllocations;
        }

        setError("");

        const isLocked = lockedFieldsRef.current[categoryId];

        if (isLocked) {
          setLockedFields((prevLockedFields) => ({
            ...prevLockedFields,
            [categoryId]: false,
          }));
          locked = false;
        }

        saveAllocationRef.current(tempUpdatedAllocations, categoryId, locked);

        return tempUpdatedAllocations;
      });
    },
    [setLockedFields, setError]
  );

  // Update the saveAllocationRef to handle final rebalancing and saving
  const saveAllocationRef = useRef(
    debounce(
      (
        allocations: Record<string, number>,
        categoryId: CategoryId,
        locked: boolean
      ) => {
        const totalAllocation = Object.values(allocations).reduce(
          (sum, value) => sum + value,
          0
        );

        let updatedAllocations = allocations;

        if (!isCloseEnough(totalAllocation, 100)) {
          // Rebalance
          updatedAllocations = calculateBalancedAmounts(
            allocations,
            categoryId,
            allocations[categoryId]
          );
        }

        // Final check
        const finalTotal = Object.values(updatedAllocations).reduce(
          (sum, value) => sum + value,
          0
        );

        if (finalTotal > 100 && !isCloseEnough(finalTotal, 100)) {
          console.error(
            "Unexpected error: rebalanced total significantly exceeds 100%"
          );
          setError("An unexpected error occurred. Please try again.");
          setAllocations((prevAllocations) => prevAllocations); // Revert to previous allocations
          return;
        }

        setAllocations(updatedAllocations);
        saveAllocation.mutate({
          category_slug: categoryId,
          allocation: updatedAllocations[categoryId],
          locked,
        });
      },
      300
    )
  );

  const toggleLock = useCallback(
    (categoryId: CategoryId) => {
      setLockedFields((prev) => {
        const newLockedState = !prev[categoryId];
        const updatedLockedFields = { ...prev, [categoryId]: newLockedState };

        saveAllocation.mutate({
          category_slug: categoryId,
          allocation: allocations[categoryId],
          locked: newLockedState,
        });

        return updatedLockedFields;
      });
    },
    [allocations, saveAllocation]
  );

  const refetchBudget = useCallback(() => {
    getBudget.refetch();
  }, [getBudget]);

  const value = {
    categories: categories.data,
    countPerCategory,
    allocations,
    lockedFields,
    handleValueChange,
    toggleLock,
    refetchBudget,
    error,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudgetContext must be used within a BudgetProvider");
  }
  return context;
};
