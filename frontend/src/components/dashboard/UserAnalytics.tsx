
import { useEffect } from "react";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Bookmark, Wrench, Clock } from "lucide-react";
import StatCard from "@/components/StatCard";

const UserAnalytics = () => {
  const { analytics } = useAnalytics();

  // Track user session time
  useEffect(() => {
    const startTime = new Date();
    
    return () => {
      const endTime = new Date();
      const sessionTimeHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      // Only log if the session was longer than 1 minute
      if (sessionTimeHours > 0.016) { // more than 1 minute
        // We would increment research hours here, but we don't want to in the cleanup function
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Your Research Activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          value={analytics.searchesMade.toString()}
          label="Searches Made"
          description="Total number of searches performed"
        />
        <StatCard 
          value={analytics.savedItems.toString()}
          label="Saved Items"
          description="Publications and datasets saved to your library"
        />
        <StatCard 
          value={analytics.toolsUsed.toString()}
          label="Tools Used"
          description="Number of different analysis tools used"
        />
        <StatCard 
          value={analytics.totalResearchHours.toFixed(1)}
          label="Research Hours"
          description="Total time spent on the platform"
        />
      </div>
    </div>
  );
};

export default UserAnalytics;
