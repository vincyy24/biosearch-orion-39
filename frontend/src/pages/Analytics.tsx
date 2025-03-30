
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  dataset_count: number;
  dataset_downloads: number;
  publication_count: number;
  publication_citations: number;
  collaboration_count: number;
  monthly_activity: {
    month: string;
    datasets: number;
    publications: number;
  }[];
}

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Colors for charts
  const COLORS = ["#8B5CF6", "#22C55E", "#3B82F6", "#F97316", "#EF4444"];

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch analytics data from API
        // For now, we'll use mock data
        const mockData: AnalyticsData = {
          dataset_count: 45,
          dataset_downloads: 312,
          publication_count: 18,
          publication_citations: 87,
          collaboration_count: 9,
          monthly_activity: [
            { month: "Jan", datasets: 3, publications: 1 },
            { month: "Feb", datasets: 5, publications: 2 },
            { month: "Mar", datasets: 4, publications: 1 },
            { month: "Apr", datasets: 6, publications: 3 },
            { month: "May", datasets: 8, publications: 2 },
            { month: "Jun", datasets: 7, publications: 4 },
            { month: "Jul", datasets: 9, publications: 3 },
            { month: "Aug", datasets: 10, publications: 5 },
            { month: "Sep", datasets: 12, publications: 6 },
            { month: "Oct", datasets: 15, publications: 7 },
            { month: "Nov", datasets: 18, publications: 8 },
            { month: "Dec", datasets: 20, publications: 9 }
          ]
        };
        
        setAnalyticsData(mockData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load analytics",
          description: "There was an error fetching analytics data. Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                You need to be logged in to view analytics.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Loading analytics data...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const pieData = [
    { name: "Datasets", value: analyticsData?.dataset_count || 0 },
    { name: "Publications", value: analyticsData?.publication_count || 0 },
    { name: "Collaborations", value: analyticsData?.collaboration_count || 0 }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Total Datasets</CardTitle>
                  <CardDescription>All your uploaded datasets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData?.dataset_count}</div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {analyticsData?.dataset_downloads} total downloads
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Publications</CardTitle>
                  <CardDescription>Your registered publications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData?.publication_count}</div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {analyticsData?.publication_citations} total citations
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Collaborations</CardTitle>
                  <CardDescription>Active collaborations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData?.collaboration_count}</div>
                  <p className="text-muted-foreground text-sm mt-1">
                    Across {analyticsData?.collaboration_count || 0} projects
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>
                  Dataset uploads and publication registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyticsData?.monthly_activity || []}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="datasets" 
                        stackId="1"
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="publications" 
                        stackId="2" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>
                  Distribution of your research content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}`, 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="datasets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Analytics</CardTitle>
                <CardDescription>Performance of your datasets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Dataset A', downloads: 45, shares: 12 },
                        { name: 'Dataset B', downloads: 32, shares: 8 },
                        { name: 'Dataset C', downloads: 78, shares: 21 },
                        { name: 'Dataset D', downloads: 23, shares: 5 },
                        { name: 'Dataset E', downloads: 56, shares: 15 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="downloads" fill="#8B5CF6" />
                      <Bar dataKey="shares" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="publications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication Analytics</CardTitle>
                <CardDescription>Citations and impact of your publications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Publication A', citations: 23, views: 456 },
                        { name: 'Publication B', citations: 17, views: 321 },
                        { name: 'Publication C', citations: 45, views: 876 },
                        { name: 'Publication D', citations: 12, views: 234 },
                        { name: 'Publication E', citations: 29, views: 543 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="citations" fill="#F97316" />
                      <Bar dataKey="views" fill="#22C55E" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Analytics;
