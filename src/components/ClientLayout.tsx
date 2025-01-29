'use client';

import { PreferencesProvider } from '@/contexts/PreferencesContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PreferencesProvider>
      {children}
    </PreferencesProvider>
  );
} 