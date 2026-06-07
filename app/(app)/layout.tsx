'use client';

import { useEffect } from 'react';
import { DrawerProvider } from '@/components/layout/drawer-context';
import { Drawer } from '@/components/layout/Drawer';
import { syncAll } from '@/lib/local/sync';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pull the cloud DB snapshot into the local IndexedDB cache on entry.
  useEffect(() => {
    syncAll().catch(() => {});
  }, []);

  return (
    <DrawerProvider>
      {children}
      <Drawer />
    </DrawerProvider>
  );
}
