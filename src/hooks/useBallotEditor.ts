'use client';
import debounce from 'lodash.debounce';
import { useCallback, useRef, useState } from 'react';

import type { Round4Allocation } from './useBallot';

export type BallotState = Record<
  string,
  { allocation: number; locked: boolean }
>;

export function useBallotEditor({
  onRemove,
  onUpdate,
}: {
  onRemove?: (id: string) => void;
  onUpdate?: (allocation: Round4Allocation) => void;
}) {
  const [state, setState] = useState<BallotState>({});

  const debouncedUpdate = useRef(
    debounce(
      (id: string, state: BallotState) =>
        onUpdate?.({ ...state[id], metric_id: id }),
      200,
      {
        leading: false,
        trailing: true,
      }
    )
  ).current;
  const setInitialState = useCallback(
    (allocations: Round4Allocation[] = []) => {
      const ballot: BallotState = Object.fromEntries(
        allocations.map((m) => [
          m.metric_id,
          { allocation: m.allocation, locked: Boolean(m.locked) },
        ])
      );
      setState(ballot);
    },
    [setState]
  );

  const set = (id: string, amount: number, unlock = false) => {
    setState((s) => {
      // Must be between 0 - 100
      const allocation = Math.max(Math.min(amount || 0, 100), 0);
      const locked = !unlock;
      const _state = calculateBalancedAmounts({
        ...s,
        [id]: { ...s[id], allocation, locked },
      });

      debouncedUpdate(id, _state);

      return _state;
    });
  };
  const inc = (id: string) =>
    set(id, Math.floor((state[id]?.allocation ?? 0) + 1));
  const dec = (id: string) =>
    set(id, Math.ceil((state[id]?.allocation ?? 0) - 1));
  const add = (id: string, allocation = 0) => {
    const _state = calculateBalancedAmounts({
      ...state,
      [id]: { ...state[id], allocation, locked: false },
    });

    set(id, _state[id].allocation, true);
  };
  const remove = (id: string) =>
    setState((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _remove, ..._state } = s;
      onRemove?.(id);
      return calculateBalancedAmounts(_state);
    });
  const reset = setInitialState;

  return { set, inc, dec, add, remove, reset, state };
}

function calculateBalancedAmounts(state: BallotState): BallotState {
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
