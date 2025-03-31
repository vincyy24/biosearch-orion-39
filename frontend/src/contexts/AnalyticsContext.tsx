import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/services/api';

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
  data: AnalyticsData;
  isLoading: boolean;
  error: string | null;
  incrementSavedItems: () => void;
  incrementDownloads: () => void;
  incrementViews: () => void;
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

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AnalyticsData>(initialAnalyticsData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make API call to fetch analytics data
      // For now, use mock data since backend is not fully implemented
      const response = await apiClient.get('/api/analytics/');
      
      // If API works, use real data
      if (response.data) {
        setData(response.data);
      } else {
        // Otherwise, use mock data
        setTimeout(() => {
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
          setIsLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
      
      // Use mock data as fallback
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
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchAnalyticsData();
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const incrementSavedItems = () => {
    setData(prevData => ({
      ...prevData,
      totalSavedItems: prevData.totalSavedItems + 1
    }));
  };

  const incrementDownloads = () => {
    setData(prevData => ({
      ...prevData,
      totalDownloads: prevData.totalDownloads + 1
    }));
  };

  const incrementViews = () => {
    setData(prevData => ({
      ...prevData,
      totalViews: prevData.totalViews + 1
    }));
  };

  return (
    <AnalyticsContext.Provider
      value={{
        data,
        isLoading,
        error,
        incrementSavedItems,
        incrementDownloads,
        incrementViews,
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
