'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  distanceUnit: 'meters' | 'yards';
  timeFormat: '24h' | '12h';
  weekStart: 'monday' | 'sunday';
  defaultTheme: 'light' | 'dark' | 'system';
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: UserPreferences) => void;
}

const defaultPreferences: UserPreferences = {
  distanceUnit: 'meters',
  timeFormat: '24h',
  weekStart: 'monday',
  defaultTheme: 'system'
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    // In a real application, this would be an API call to get user preferences
    // For now, we'll use mock data
    const mockUserPreferences = {
      distanceUnit: 'meters',
      timeFormat: '24h',
      weekStart: 'monday',
      defaultTheme: 'system'
    } as UserPreferences;

    setPreferences(mockUserPreferences);
  }, []);

  const updatePreferences = (newPreferences: UserPreferences) => {
    // In a real application, this would make an API call to update preferences
    setPreferences(newPreferences);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
} 