
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/services/api';

// Define the analytics data structure
interface UserAnalytics {
  searchesMade: number;
  savedItems: number;
  toolsUsed: number;
  totalResearchHours: number;
}

interface AnalyticsData {
  totalViews: number;
  totalDownloads: number;
  totalSavedItems: number;
  userCounts: {
    total: number;
    active: number;
    new: number;
  };
  popularData: {
    title: string;
    views: number;
    id: string;
  }[];
}

interface AnalyticsContextType {
  // Combined analytics data
  data: AnalyticsData;
  // User-specific analytics
  analytics: UserAnalytics;
  isLoading: boolean;
  error: string | null;
  // Methods
  incrementSavedItems: () => void;
  incrementDownloads: () => void;
  incrementViews: () => void;
  incrementSearches: () => void;
  incrementToolsUsed: (toolName: string) => void;
  addResearchHours: (hours: number) => void;
  refreshData: () => Promise<void>;
}

const initialAnalyticsData: AnalyticsData = {
  totalViews: 0,
  totalDownloads: 0,
  totalSavedItems: 0,
  userCounts: {
    total: 0,
    active: 0,
    new: 0,
  },
  popularData: []
};

const initialUserAnalytics: UserAnalytics = {
  searchesMade: 0,
  savedItems: 0,
  toolsUsed: 0,
  totalResearchHours: 0
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AnalyticsData>(initialAnalyticsData);
  const [analytics, setAnalytics] = useState<UserAnalytics>(initialUserAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch from API first
      try {
        const response = await apiClient.get('/api/analytics/');
        if (response.data) {
          setData(response.data);
        }
      } catch (apiError) {
        console.error("API error, using mock data:", apiError);
        
        // Use mock data if API fails
        setData({
          totalViews: 1254,
          totalDownloads: 389,
          totalSavedItems: 126,
          userCounts: {
            total: 832,
            active: 345,
            new: 72
          },
          popularData: [
            { title: "Cyclic Voltammetry of Novel Catalyst", views: 128, id: "exp-1" },
            { title: "Electrochemical Impedance Spectroscopy Data", views: 112, id: "exp-2" },
            { title: "Differential Pulse Analysis", views: 97, id: "exp-3" },
            { title: "Linear Sweep Voltammetry", views: 85, id: "exp-4" },
            { title: "Chronoamperometry Experiment", views: 76, id: "exp-5" }
          ]
        });
      }
      
      // Try to fetch user-specific analytics
      try {
        const userResponse = await apiClient.get('/api/analytics/user/');
        if (userResponse.data) {
          setAnalytics(userResponse.data);
        }
      } catch (userApiError) {
        console.error("User API error, using mock data:", userApiError);
        
        // Use mock data if API fails
        setAnalytics({
          searchesMade: 45,
          savedItems: 23,
          toolsUsed: 12,
          totalResearchHours: 78.5
        });
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchAnalyticsData();
    return Promise.resolve();
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Update methods for different analytics metrics
  const incrementSavedItems = () => {
    setData(prevData => ({
      ...prevData,
      totalSavedItems: prevData.totalSavedItems + 1
    }));
    setAnalytics(prev => ({
      ...prev,
      savedItems: prev.savedItems + 1
    }));
    
    // In a real app, we would also update this on the server
    // apiClient.post('/api/analytics/increment', { metric: 'savedItems' });
  };

  const incrementDownloads = () => {
    setData(prevData => ({
      ...prevData,
      totalDownloads: prevData.totalDownloads + 1
    }));
    
    // In a real app, we would also update this on the server
    // apiClient.post('/api/analytics/increment', { metric: 'downloads' });
  };

  const incrementViews = () => {
    setData(prevData => ({
      ...prevData,
      totalViews: prevData.totalViews + 1
    }));
    
    // In a real app, we would also update this on the server
    // apiClient.post('/api/analytics/increment', { metric: 'views' });
  };
  
  const incrementSearches = () => {
    setAnalytics(prev => ({
      ...prev,
      searchesMade: prev.searchesMade + 1
    }));
    
    // In a real app, we would also update this on the server
    // apiClient.post('/api/analytics/increment', { metric: 'searches' });
  };
  
  const incrementToolsUsed = (toolName: string) => {
    setAnalytics(prev => ({
      ...prev,
      toolsUsed: prev.toolsUsed + 1
    }));
    
    // In a real app, we would track which tools were used
    // apiClient.post('/api/analytics/tool-used', { tool: toolName });
  };
  
  const addResearchHours = (hours: number) => {
    setAnalytics(prev => ({
      ...prev,
      totalResearchHours: prev.totalResearchHours + hours
    }));
    
    // In a real app, we would also update this on the server
    // apiClient.post('/api/analytics/research-hours', { hours });
  };

  return (
    <AnalyticsContext.Provider
      value={{
        data,
        analytics,
        isLoading,
        error,
        incrementSavedItems,
        incrementDownloads,
        incrementViews,
        incrementSearches,
        incrementToolsUsed,
        addResearchHours,
        refreshData
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
