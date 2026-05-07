import { createRef } from 'react';

export const navigationRef = createRef();

export function resetToAna() {
  navigationRef.current?.reset({ index: 0, routes: [{ name: 'Ana' }] });
}
