'use client';

import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        {children}
      </PreferencesProvider>
    </ThemeProvider>
  );
} 