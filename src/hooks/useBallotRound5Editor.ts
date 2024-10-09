'use client';
import { useCallback, useState } from 'react';

import type { Round5ProjectAllocation } from './useBallotRound5';
import type { CategoryId } from '@/types/shared';

export type BallotRound5State = Record<
  string,
  { allocation: number; locked: boolean }
>;

export function useBallotRound5Editor() {
  const [state, setState] = useState<BallotRound5State>({});

  // const debouncedUpdate = useRef(
  //   debounce(
  //     (id: string, state: BallotRound5State) =>
  //       onUpdate?.({ ...state[id], project_id: id }),
  //     200,
  //     {
  //       leading: false,
  //       trailing: true,
  //     }
  //   )
  // ).current;
  const setInitialState = useCallback(
    (allocations: Round5ProjectAllocation[] = []) => {
      const ballot: BallotRound5State = Object.fromEntries(
        allocations.map((m) => [
          m.project_id,
          { allocation: m.allocation, locked: false },
        ])
      );
      setState(ballot);
    },
    [setState]
  );

  const set = (id: CategoryId, amount: number, unlock = false) => {
    setState((s) => {
      // Must be between 0 - 100
      const allocation = Math.max(Math.min(amount || 0, 100), 0);
      const locked = !unlock;
      const _state = calculateBalancedAmounts({
        ...s,
        [id]: { ...s[id], allocation, locked },
      });

      // debouncedUpdate(id, _state);

      return _state;
    });
  };
  const inc = (id: CategoryId) =>
    set(id, Math.floor((state[id]?.allocation ?? 0) + 1));
  const dec = (id: CategoryId) =>
    set(id, Math.ceil((state[id]?.allocation ?? 0) - 1));
  const add = (id: CategoryId, allocation = 0) => {
    const _state = calculateBalancedAmounts({
      ...state,
      [id]: { ...state[id], allocation, locked: false },
    });

    set(id, _state[id].allocation, true);
  };
  const reset = setInitialState;

  return { set, inc, dec, add, reset, state };
}

function calculateBalancedAmounts(state: BallotRound5State): BallotRound5State {
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
