'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  distanceUnit: 'kilometers' | 'miles';
  timeFormat: '24h' | '12h';
  weekStart: 'monday' | 'sunday';
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: UserPreferences) => void;
}

const defaultPreferences: UserPreferences = {
  distanceUnit: 'kilometers',
  timeFormat: '24h',
  weekStart: 'monday'
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    // In a real application, this would be an API call to get user preferences
    // For now, we'll use mock data
    const mockUserPreferences = {
      distanceUnit: 'kilometers',
      timeFormat: '24h',
      weekStart: 'monday'
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