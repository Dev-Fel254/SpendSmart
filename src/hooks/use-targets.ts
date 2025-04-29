import type { Targets } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useCallback } from 'react';

const TARGETS_KEY = 'spendSmartTargets';

const defaultTargets: Targets = {
  daily: null,
  weekly: null,
  monthly: null,
};

function useTargets() {
  const [targets, setTargets] = useLocalStorage<Targets>(TARGETS_KEY, defaultTargets);

   const updateTargets = useCallback(
    (newTargets: Partial<Targets>) => {
      setTargets((prev) => ({ ...prev, ...newTargets }));
    },
    [setTargets]
  );

  return { targets, updateTargets };
}

export default useTargets;
