import { createContext, useContext, useState, useEffect, ReactNode, useReducer, FC, Dispatch } from 'react';
import apiClient from '@/services/api';

// Define the analytics data structure
interface UserAnalytics {
  searchesMade: number;
  savedItems: number;
  toolsUsed: number;
  totalResearchHours: number;
}

interface AnalyticsData {
  // Update AnalyticsData type with searches analytics data
  searches: number;
  views: number;
  downloads: number;
  savedItems: number;
  researchHours: number;
  toolsUsed: number;
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

interface DispatchActionType { type: (typeof INCREMENT_ANALYTICS)[keyof typeof INCREMENT_ANALYTICS]; payload?: any; }

interface AnalyticsContextType {
  analytics: AnalyticsData;
  isLoading: boolean;
  error: string | null;
  // Methods
  INCREMENT_ANALYTICS: typeof INCREMENT_ANALYTICS,
  updateAnalytics: Dispatch<DispatchActionType>,
  refreshData: () => Promise<void>;
}
const initialAnalyticsState: AnalyticsData = {
  views: 0,
  downloads: 0,
  savedItems: 0,
  searches: 0,
  researchHours: 0,
  toolsUsed: 0,
  userCounts: {
    total: 0,
    active: 0,
    new: 0,
  },
  popularData: []
};

//   {
//   type: "updateFromServer", payload: {
//     views: 1254,
//     downloads: 389,
//     savedItems: 126,
//     searches: 25,
//     toolsUsed: 12,
//     researchHours: 18.5,
//   userCounts: {
//     total: 832,
//     active: 345,
//     new: 72
//   },
//   popularData: [
//     { title: "Cyclic Voltammetry of Novel Catalyst", views: 128, id: "exp-1" },
//     { title: "Electrochemical Impedance Spectroscopy Data", views: 112, id: "exp-2" },
//     { title: "Differential Pulse Analysis", views: 97, id: "exp-3" },
//     { title: "Linear Sweep Voltammetry", views: 85, id: "exp-4" },
//     { title: "Chronoamperometry Experiment", views: 76, id: "exp-5" }
//   ]
//   }
// }

const initialUserAnalytics: UserAnalytics = {
  searchesMade: 0,
  savedItems: 0,
  toolsUsed: 0,
  totalResearchHours: 0
};


const INCREMENT_ANALYTICS = {
  IncrementViews: "incrementViews",
  IncrementDownloads: "incrementDownloads",
  IncrementSavedItems: "incrementSavedItems",
  IncrementSearches: "incrementSearches",
  IncrementResearchHours: "incrementResearchHours",
  IncrementToolsUsed: "incrementToolsUsed",
  IncrementTotalUsers: "incrementTotalUsers",
  DecrementTotalUsers: "decrementTotalUsers",
  IncrementActiveUsers: "incrementActiveUsers",
  IncrementNewUsers: "incrementNewUsers",
  IncrementPopularData: "incrementPopularData",
  UpdateAnalytics: "updateFromServer",
} as const;

const reducer = (state: AnalyticsData, action: DispatchActionType): AnalyticsData => {
  switch (action.type) {
    case INCREMENT_ANALYTICS.IncrementViews:
      return { ...state, views: state.views + 1 };
    case INCREMENT_ANALYTICS.IncrementDownloads:
      return { ...state, downloads: state.downloads + 1 };
    case INCREMENT_ANALYTICS.IncrementSavedItems:
      return { ...state, savedItems: state.savedItems + 1 };
    case INCREMENT_ANALYTICS.IncrementSearches:
      return { ...state, searches: state.searches + 1 };
    case INCREMENT_ANALYTICS.IncrementResearchHours:
      return { ...state, researchHours: state.researchHours + 1 };
    case INCREMENT_ANALYTICS.IncrementToolsUsed:
      return { ...state, toolsUsed: state.toolsUsed + 1 };
    case INCREMENT_ANALYTICS.IncrementTotalUsers:
      return { ...state, userCounts: { ...state.userCounts, total: state.userCounts.total + 1 } };
    case INCREMENT_ANALYTICS.DecrementTotalUsers:
      return { ...state, userCounts: { ...state.userCounts, total: state.userCounts.total - 1 } };
    case INCREMENT_ANALYTICS.IncrementActiveUsers:
      return { ...state, userCounts: { ...state.userCounts, active: state.userCounts.active + 1 } };
    case INCREMENT_ANALYTICS.IncrementNewUsers:
      return { ...state, userCounts: { ...state.userCounts, new: state.userCounts.new + 1 } };
    case INCREMENT_ANALYTICS.IncrementPopularData: {
      const newPopularData = [action.payload, ...state.popularData].slice(0, 5);
      return { ...state, popularData: newPopularData };
    }
    case INCREMENT_ANALYTICS.UpdateAnalytics:
      return { ...action.payload };
    default:
      return state;
  }
};

const AnalyticsContext = createContext<AnalyticsContextType>(undefined);

export const AnalyticsProvider: FC<{ children: ReactNode; }> = ({ children }) => {
  // const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalyticsState);
  const [analytics, updateAnalytics] = useReducer(reducer, initialAnalyticsState)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get('analytics/');

      if (response.data)
        updateAnalytics({ type: "updateFromServer", payload: response.data });
      else
        console.log("Error fetching analytics data:", response.data);


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
  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        isLoading,
        error,
        INCREMENT_ANALYTICS,
        updateAnalytics,
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
