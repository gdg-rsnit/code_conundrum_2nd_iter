import type { NavigateFunction } from 'react-router-dom';

const AUTH_STORAGE_KEYS = [
  'cc_user',
  'cc_team',
  'cc_live_round',
  'cc_result',
  'userId',
] as const;

export const clearAuthSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const handleUnauthorized = (
  navigate: NavigateFunction,
  redirectPath: string = '/home'
) => {
  clearAuthSession();
  navigate(redirectPath, { replace: true });
};
