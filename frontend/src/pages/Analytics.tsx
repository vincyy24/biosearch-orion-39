
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { BarChart, PieChart, LineChart, AreaChart } from "recharts";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Activity,
  Users,
  Database,
  Microscope,
  FileText,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Sample data for analytics charts
const researchData = [
  { name: "Jan", uploads: 4, downloads: 8, accesses: 15 },
  { name: "Feb", uploads: 6, downloads: 12, accesses: 20 },
  { name: "Mar", uploads: 8, downloads: 16, accesses: 25 },
  { name: "Apr", uploads: 10, downloads: 20, accesses: 30 },
  { name: "May", uploads: 12, downloads: 24, accesses: 35 },
  { name: "Jun", uploads: 14, downloads: 28, accesses: 40 },
];

const publicationData = [
  { name: "2019", count: 5, citations: 12 },
  { name: "2020", count: 8, citations: 24 },
  { name: "2021", count: 12, citations: 48 },
  { name: "2022", count: 15, citations: 60 },
  { name: "2023", count: 18, citations: 72 },
];

const userActivityData = [
  { name: "Mon", searches: 45, datasets: 15, tools: 8 },
  { name: "Tue", searches: 55, datasets: 20, tools: 10 },
  { name: "Wed", searches: 60, datasets: 25, tools: 12 },
  { name: "Thu", searches: 50, datasets: 18, tools: 9 },
  { name: "Fri", searches: 48, datasets: 16, tools: 8 },
  { name: "Sat", searches: 30, datasets: 10, tools: 5 },
  { name: "Sun", searches: 25, datasets: 8, tools: 4 },
];

const datasetTypeData = [
  { name: "Cyclic Voltammetry", value: 45 },
  { name: "Impedance", value: 30 },
  { name: "Chronoamperometry", value: 15 },
  { name: "Other", value: 10 },
];

const methodologyBreakdownData = [
  { name: "Electrochemical", value: 55 },
  { name: "Spectroscopic", value: 25 },
  { name: "Chromatographic", value: 12 },
  { name: "Microscopic", value: 8 },
];

const Analytics = () => {
  const { toast } = useToast();
  const { totalSearches, totalResearchHours, incrementSearches } = useAnalytics();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your analytics data is being prepared for download.",
    });
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track research metrics, publication impact, and platform usage
            </p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Research Projects</p>
                  <h4 className="text-2xl font-bold">42</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Microscope className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">↑12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Publications</p>
                  <h4 className="text-2xl font-bold">18</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">↑8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Datasets</p>
                  <h4 className="text-2xl font-bold">124</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Database className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">↑15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Users</p>
                  <h4 className="text-2xl font-bold">86</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-red-500">↓5%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Platform Activity
                  </CardTitle>
                  <CardDescription>User engagement across the platform</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <LineChart
                      width={600}
                      height={300}
                      data={userActivityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      {/* Chart implementation would go here */}
                      <div className="text-center py-16 text-muted-foreground">
                        <LineChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Activity data visualization</p>
                      </div>
                    </LineChart>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="mr-2 h-5 w-5" />
                    Research Methodologies
                  </CardTitle>
                  <CardDescription>Distribution of research approaches</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <PieChart width={500} height={300}>
                      {/* Chart implementation would go here */}
                      <div className="text-center py-16 text-muted-foreground">
                        <PieChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Research methodology distribution</p>
                      </div>
                    </PieChart>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Monthly Growth Metrics
                </CardTitle>
                <CardDescription>Track growth across key platform metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <AreaChart
                    width={1000}
                    height={350}
                    data={researchData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    {/* Chart implementation would go here */}
                    <div className="text-center py-16 text-muted-foreground">
                      <BarChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Monthly growth metrics visualization</p>
                    </div>
                  </AreaChart>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            {/* Research analytics content */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Research Activity</CardTitle>
                  <CardDescription>Research project creation and participation</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : (
                    <BarChart
                      width={1000}
                      height={350}
                      data={researchData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      {/* Chart implementation would go here */}
                      <div className="text-center py-16 text-muted-foreground">
                        <BarChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Research activity visualization</p>
                      </div>
                    </BarChart>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Research Topics</CardTitle>
                    <CardDescription>Top research topics by frequency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <PieChart width={500} height={300}>
                        {/* Chart implementation would go here */}
                        <div className="text-center py-16 text-muted-foreground">
                          <PieChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Research topics distribution</p>
                        </div>
                      </PieChart>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Collaboration Network</CardTitle>
                    <CardDescription>Research collaboration patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="text-center py-16 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Collaboration network visualization</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publications" className="space-y-6">
            {/* Publications analytics content */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publication Metrics</CardTitle>
                  <CardDescription>Publications and citation trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : (
                    <BarChart
                      width={1000}
                      height={350}
                      data={publicationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      {/* Chart implementation would go here */}
                      <div className="text-center py-16 text-muted-foreground">
                        <BarChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Publication metrics visualization</p>
                      </div>
                    </BarChart>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Journal Distribution</CardTitle>
                    <CardDescription>Publications by journal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <PieChart width={500} height={300}>
                        {/* Chart implementation would go here */}
                        <div className="text-center py-16 text-muted-foreground">
                          <PieChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Journal distribution visualization</p>
                        </div>
                      </PieChart>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Citation Impact</CardTitle>
                    <CardDescription>Citation metrics by publication</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="text-center py-16 text-muted-foreground">
                        <BarChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Citation impact visualization</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            {/* Datasets analytics content */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dataset Activity</CardTitle>
                  <CardDescription>Upload and download trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : (
                    <AreaChart
                      width={1000}
                      height={350}
                      data={researchData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      {/* Chart implementation would go here */}
                      <div className="text-center py-16 text-muted-foreground">
                        <LineChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Dataset activity visualization</p>
                      </div>
                    </AreaChart>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dataset Types</CardTitle>
                    <CardDescription>Distribution of dataset types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <PieChart width={500} height={300}>
                        {/* Chart implementation would go here */}
                        <div className="text-center py-16 text-muted-foreground">
                          <PieChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Dataset types distribution</p>
                        </div>
                      </PieChart>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dataset Usage</CardTitle>
                    <CardDescription>Dataset access and citation metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="text-center py-16 text-muted-foreground">
                        <BarChartIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Dataset usage visualization</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
