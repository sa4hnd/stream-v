'use client';

import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/channel/')) return null;
  return <>{children}</>;
}
