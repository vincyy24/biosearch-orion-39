
import React, { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie } from "recharts";
import { Loader2, Download, Eye, Bookmark, Users, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data, isLoading, error, refreshData } = useAnalytics();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to view analytics",
      });
      navigate("/login", { state: { from: "/analytics" } });
    }
  }, [isAuthenticated, navigate, toast]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshData();
      toast({
        title: "Refreshed",
        description: "Analytics data has been updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Refresh failed",
        description: "Could not refresh analytics data",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Generate sample data for different time periods
  const generateTimeSeriesData = (period: string) => {
    const now = new Date();
    const data = [];
    
    let days = 30;
    if (period === "7d") days = 7;
    if (period === "90d") days = 90;
    if (period === "1y") days = 365;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i - 1));
      
      // Generate random but realistic looking data
      const views = Math.floor(Math.random() * 50) + 10;
      const downloads = Math.floor(Math.random() * 15) + 5;
      
      data.push({
        date: date.toISOString().split('T')[0],
        views,
        downloads
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData(timeRange);
  
  // Sample data for pie chart
  const experimentTypeData = [
    { name: 'Cyclic Voltammetry', value: 40 },
    { name: 'Differential Pulse', value: 25 },
    { name: 'Linear Sweep', value: 20 },
    { name: 'Chronoamperometry', value: 10 },
    { name: 'Other', value: 5 }
  ];
  
  // Sample data for bar chart
  const userActivityData = [
    { name: 'Mon', uploads: 12, downloads: 19 },
    { name: 'Tue', uploads: 19, downloads: 21 },
    { name: 'Wed', uploads: 30, downloads: 28 },
    { name: 'Thu', uploads: 27, downloads: 32 },
    { name: 'Fri', uploads: 18, downloads: 24 },
    { name: 'Sat', uploads: 23, downloads: 22 },
    { name: 'Sun', uploads: 34, downloads: 29 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Insights and statistics about your research data
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{Math.floor(data.totalViews * 0.12)} from previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{data.totalDownloads.toLocaleString()}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{Math.floor(data.totalDownloads * 0.08)} from previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Bookmark className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{data.totalSavedItems.toLocaleString()}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{Math.floor(data.totalSavedItems * 0.15)} from previous period
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Activity Over Time</CardTitle>
                  <CardDescription>
                    Views and downloads over the selected time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          // Simplify date format based on time range
                          if (timeRange === "7d") {
                            return new Date(date).toLocaleDateString(undefined, { weekday: 'short' });
                          } else if (timeRange === "1y") {
                            return new Date(date).toLocaleDateString(undefined, { month: 'short' });
                          } else {
                            return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                          }
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} name="Views" />
                      <Line type="monotone" dataKey="downloads" stroke="#82ca9d" name="Downloads" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Experiment Types</CardTitle>
                  <CardDescription>
                    Distribution of experiment types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={experimentTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => entry.name}
                        labelLine={false}
                      >
                        {experimentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>
                    Uploads and downloads by day of week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="uploads" fill="#8884d8" name="Uploads" />
                      <Bar dataKey="downloads" fill="#82ca9d" name="Downloads" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Data</CardTitle>
                  <CardDescription>
                    Your most viewed research data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.popularData.slice(0, 5).map((item, i) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium leading-none mb-1 truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.views} views
                          </p>
                          <Progress 
                            value={(item.views / data.popularData[0].views) * 100}
                            className="h-1.5 mt-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;
