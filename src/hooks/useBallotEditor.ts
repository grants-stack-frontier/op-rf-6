"use client";
import { useCallback, useState } from "react";

import { Allocation } from "./useBallot";

type BallotState = Record<string, { allocation: number; locked: boolean }>;

export function useBallotEditor({
  debounceRate = 2000,
  onUpdate,
}: {
  debounceRate?: number;
  onUpdate?: (allocation: Allocation) => void;
}) {
  const [state, setState] = useState<BallotState>({});

  const setInitialState = useCallback(
    (allocations: Allocation[] = [], preserveAllocations = false) => {
      setState(
        Object.fromEntries(
          allocations.map((m) => [
            m.metricId,
            {
              allocation: preserveAllocations
                ? m.allocation
                : 100 / allocations.length,
              locked: false,
            },
          ])
        )
      );
    },
    [setState]
  );

  const set = (
    id: string,
    allocation: number = state[id].allocation,
    unlock: boolean = false
  ) => {
    setState((s) => {
      const _state = {
        ...s,
        [id]: {
          ...s[id],
          // Must be between 0 - 100
          allocation: Math.max(Math.min(allocation, 100), 0),
          locked: !unlock,
        },
      };
      onUpdate && // Could be a good idea to send all the allocations here also
        debounce(onUpdate, debounceRate)({ ...state[id], metricId: id });

      return calculateBalancedAmounts(_state);
    });
  };
  const inc = (id: string) => set(id, (state[id]?.allocation ?? 0) + 5);
  const dec = (id: string) => set(id, (state[id]?.allocation ?? 0) - 5);
  const add = (id: string, allocation = 0) => set(id, allocation);
  const remove = (id: string) =>
    setState((s) => {
      const { [id]: _remove, ..._state } = s;
      return calculateBalancedAmounts(_state);
    });
  const reset = setInitialState;

  return { set, inc, dec, add, remove, reset, state };
}

function calculateBalancedAmounts(state: BallotState) {
  // Autobalance non-locked fields
  const locked = Object.entries(state).filter(([_, m]) => m.locked);
  const nonLocked = Object.entries(state).filter(([_, m]) => !m.locked);

  const amountToBalance =
    100 - locked.reduce((sum, [_, m]) => sum + m.allocation, 0);

  return Object.fromEntries(
    Object.entries(state).map(([id, { allocation, locked }]) => [
      id,
      {
        allocation: locked
          ? allocation
          : amountToBalance
          ? amountToBalance / nonLocked.length
          : 0,
        locked,
      },
    ])
  );
}

function debounce<T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  wait: number
) {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: T): Promise<U> => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(callback(...args)), wait);
    });
  };
}