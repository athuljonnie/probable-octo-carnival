export interface User {
  id: string;
  phoneNumber: string;
  isAuthenticated: boolean;
  googleAuthorized?: boolean;
  googleProfile?: any;
  googleCalendarConnected?: boolean;
}

export interface CallForwardingConfig {
  whenBusy: string;
  whenUnavailable: string;
  whenSwitchedOff: string;
  agentNumber: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export interface CallForwardingState {
  config: CallForwardingConfig;
  setConfig: (config: CallForwardingConfig) => void;
}