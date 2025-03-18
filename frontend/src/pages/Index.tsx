
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Database, FileText, BarChart3, Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import RecentDatasets from "@/components/datasets/RecentDatasets";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else {
      toast({
        title: "Empty search",
        description: "Please enter a search term",
        variant: "destructive"
      });
    }
  };

  const features = [
    {
      title: "Browse Data",
      description: "Access a comprehensive collection of potentiostat data organized by categories.",
      icon: Database,
      link: "/data-browser"
    },
    {
      title: "Publications",
      description: "Explore research papers and publications related to electrochemical experiments.",
      icon: FileText,
      link: "/publications"
    },
    {
      title: "Visualization Tools",
      description: "Analyze data with interactive visualization tools and customizable charts.",
      icon: BarChart3,
      link: "/tools"
    },
    {
      title: "Download Datasets",
      description: "Download experimental data in various formats for offline analysis.",
      icon: Download,
      link: "/download"
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              BiomediResearch Potentiostat Data Repository
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              A comprehensive platform for accessing, visualizing, and analyzing potentiostat-generated electrochemical data.
            </p>
          </div>
          
          <div className="w-full max-w-2xl mt-8">
            <form onSubmit={handleSearch} className="flex w-full gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for datasets, publications, or authors..."
                  className="w-full pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg">Search</Button>
            </form>
          </div>
        </section>
        
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(feature.link)}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section className="py-12">
          <RecentDatasets />
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
