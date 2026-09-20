import { useSyncExternalStore } from 'react';
import { runRepository } from './runRepository';

export function useAllRuns() {
  return useSyncExternalStore(runRepository.subscribe, () => runRepository.allRuns());
}
