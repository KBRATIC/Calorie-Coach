import { createContext, useContext } from 'react';

export const IsActiveContext = createContext<boolean>(true);

export function useIsActive() {
  return useContext(IsActiveContext);
}
