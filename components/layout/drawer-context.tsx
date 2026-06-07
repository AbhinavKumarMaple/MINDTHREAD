'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface DrawerCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DrawerContext = createContext<DrawerCtx>({
  open: false,
  setOpen: () => {},
});

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
