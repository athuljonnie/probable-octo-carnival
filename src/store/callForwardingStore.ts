import { create } from 'zustand';
import { CallForwardingState } from '../types';

export const useCallForwardingStore = create<CallForwardingState>((set) => ({
  config: {
    whenBusy: '',
    whenUnavailable: '',
    whenSwitchedOff: '',
    agentNumber: '',
  },
  setConfig: (config) => set({ config }),
}));