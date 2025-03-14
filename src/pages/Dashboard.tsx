
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Star,
  Clock,
  BarChart2,
  FileText,
  Database,
  Tool,
  Plus,
  ArrowUpRight,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";
import DashboardChart from "@/components/charts/DashboardChart";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Sample data for recent activity
const recentActivity = [
  {
    id: "act1",
    type: "search",
    title: "BRCA1 Gene Search",
    timestamp: "2 hours ago",
  },
  {
    id: "act2",
    type: "view",
    title: "Viewed Cancer Genomics Dataset",
    timestamp: "Yesterday",
  },
  {
    id: "act3",
    type: "download",
    title: "Downloaded Protein Structure Analysis Results",
    timestamp: "2 days ago",
  },
  {
    id: "act4",
    type: "tool",
    title: "Used Genome Alignment Tool",
    timestamp: "3 days ago",
  },
  {
    id: "act5",
    type: "save",
    title: "Saved Publication on CRISPR Applications",
    timestamp: "1 week ago",
  },
];

// Sample data for saved items
const savedItems = [
  {
    id: "save1",
    type: "publication",
    title: "CRISPR-Cas9 mediated gene editing for rare genetic disorders",
    date: "October 15, 2022",
    icon: FileText,
  },
  {
    id: "save2",
    type: "dataset",
    title: "Human Genome Project Complete Dataset",
    date: "January 23, 2023",
    icon: Database,
  },
  {
    id: "save3",
    type: "tool",
    title: "ProteinVisualizer",
    date: "September 22, 2023",
    icon: Tool,
  },
  {
    id: "save4",
    type: "publication",
    title: "Single-cell transcriptomics reveals immune cell populations in Alzheimer's disease",
    date: "August 5, 2022",
    icon: FileText,
  },
];

// Sample data for recommended items
const recommendations = [
  {
    id: "rec1",
    type: "publication",
    title: "Advances in CRISPR Technology for Therapeutic Applications",
    relevance: "Based on your interests in gene editing",
    icon: FileText,
  },
  {
    id: "rec2",
    type: "dataset",
    title: "Cancer Cell Line Encyclopedia",
    relevance: "Popular among researchers in your field",
    icon: Database,
  },
  {
    id: "rec3",
    type: "tool",
    title: "GenomeMapper",
    relevance: "Compatible with your recent analyses",
    icon: Tool,
  },
];

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Placeholder function for demo purposes
  const handleAction = (action: string, item: string) => {
    toast({
      title: `${action} initiated`,
      description: `Action on: ${item}`,
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, Researcher. Here's an overview of your research activities.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" onClick={() => handleAction("New", "research project")}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
            <Button onClick={() => navigate("/data-browser")}>
              <Database className="mr-2 h-4 w-4" /> Browse Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Searches</p>
                  <h4 className="text-2xl font-bold">42</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <ClipboardList className="h-5 w-5 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Saved Items</p>
                  <h4 className="text-2xl font-bold">18</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Star className="h-5 w-5 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tools Used</p>
                  <h4 className="text-2xl font-bold">7</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Tool className="h-5 w-5 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Research Hours</p>
                  <h4 className="text-2xl font-bold">36h</h4>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-red-500">↓5%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Research Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <DashboardChart />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Recent Activity</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="bg-muted/50 p-2 rounded-full mr-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Items and Recommendations */}
        <Tabs defaultValue="saved" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="saved">Saved Items</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg mr-4">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                        <h3 className="text-base font-medium line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Saved on {item.date}</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="bg-muted/30 px-6 py-3 flex justify-end space-x-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleAction("View", item.title)}
                    >
                      <ArrowUpRight className="mr-1 h-3 w-3" /> Open
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recommended">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-muted/50 p-3 rounded-lg mr-4">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                        <h3 className="text-base font-medium line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{item.relevance}</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="bg-muted/30 px-6 py-3 flex justify-end space-x-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleAction("Save", item.title)}
                    >
                      <BookmarkPlus className="mr-1 h-3 w-3" /> Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleAction("View", item.title)}
                    >
                      <ExternalLink className="mr-1 h-3 w-3" /> View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
