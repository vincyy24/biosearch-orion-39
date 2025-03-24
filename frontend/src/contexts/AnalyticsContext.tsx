
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AnalyticsData {
  searchesMade: number;
  savedItems: number;
  toolsUsed: number;
  totalResearchHours: number;
}

interface AnalyticsContextProps {
  analytics: AnalyticsData;
  incrementSearches: () => void;
  incrementSavedItems: () => void;
  incrementToolsUsed: () => void;
  incrementResearchHours: (hours: number) => void;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    // Load from localStorage if available
    const savedAnalytics = localStorage.getItem('userAnalytics');
    return savedAnalytics ? JSON.parse(savedAnalytics) : {
      searchesMade: 0,
      savedItems: 0,
      toolsUsed: 0,
      totalResearchHours: 0,
    };
  });

  // Save to localStorage when analytics change
  useEffect(() => {
    localStorage.setItem('userAnalytics', JSON.stringify(analytics));
  }, [analytics]);

  const incrementSearches = () => {
    setAnalytics(prev => ({
      ...prev,
      searchesMade: prev.searchesMade + 1
    }));
  };

  const incrementSavedItems = () => {
    setAnalytics(prev => ({
      ...prev,
      savedItems: prev.savedItems + 1
    }));
  };

  const incrementToolsUsed = () => {
    setAnalytics(prev => ({
      ...prev,
      toolsUsed: prev.toolsUsed + 1
    }));
  };

  const incrementResearchHours = (hours: number) => {
    setAnalytics(prev => ({
      ...prev,
      totalResearchHours: prev.totalResearchHours + hours
    }));
  };

  return (
    <AnalyticsContext.Provider value={{
      analytics,
      incrementSearches,
      incrementSavedItems,
      incrementToolsUsed,
      incrementResearchHours,
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
