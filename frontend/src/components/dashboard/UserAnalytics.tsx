import { useEffect, useState } from "react";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import PlotlyChart from "@/components/visualizations/PlotlyChart";
import apiClient from "@/services/api";

const UserAnalytics = () => {
  const { analytics, incrementResearchHours } = useAnalytics();
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch chart data from backend
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        // This would fetch the Plotly figure JSON from your Django backend
        const response = await apiClient.get('analytics/activity-chart/');
        setActivityData(response.data);
      } catch (error) {
        console.error("Failed to fetch activity chart data:", error);
        // Fallback to sample data if the API call fails
        setActivityData({
          data: [
            {
              x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              y: [18, 24, 30, 26, 32, 28, 35, 42],
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Searches',
              marker: { color: '#4f46e5' }
            },
            {
              x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              y: [5, 8, 12, 10, 15, 13, 20, 17],
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Publications',
              marker: { color: '#16a34a' }
            },
            {
              x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              y: [12, 10, 15, 18, 22, 20, 25, 30],
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Datasets',
              marker: { color: '#ca8a04' }
            }
          ],
          layout: {
            title: 'Research Activity Over Time',
            xaxis: { title: 'Month' },
            yaxis: { title: 'Count' },
            autosize: true,
            margin: { l: 50, r: 20, t: 50, b: 50 },
            legend: { orientation: 'h', y: -0.2 }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  // Track user session time
  useEffect(() => {
    const startTime = new Date();

    return () => {
      const endTime = new Date();
      const sessionTimeHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      // Only log if the session was longer than 1 minute
      if (sessionTimeHours > 0.016) { // more than 1 minute
        incrementResearchHours(sessionTimeHours);
      }
    };
  }, [incrementResearchHours]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Your Research Activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={analytics.searches.toString()}
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
          value={analytics.researchHours.toFixed(1)}
          label="Research Hours"
          description="Total time spent on the platform"
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Research Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {activityData && (
                <PlotlyChart
                  data={activityData.data}
                  layout={activityData.layout}
                  loading={loading}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAnalytics;