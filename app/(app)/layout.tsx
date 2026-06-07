'use client';

import { DrawerProvider } from '@/components/layout/drawer-context';
import { Drawer } from '@/components/layout/Drawer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DrawerProvider>
      {children}
      <Drawer />
    </DrawerProvider>
  );
}
