
import MainLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Database, FileText, BarChart3, Download, BookOpen, Lock, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import RecentDatasets from "@/components/datasets/RecentDatasets";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { incrementSearches } = useAnalytics();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      incrementSearches(); // Track search analytics
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
      icon: <Database className="h-8 w-8" />,
      link: "/data-browser"
    },
    {
      title: "Research Publications",
      description: "Explore research papers with verified DOI information and related experimental data.",
      icon: <BookOpen className="h-8 w-8" />,
      link: "/publications"
    },
    {
      title: "Visualization Tools",
      description: "Analyze data with interactive visualization tools and customizable charts.",
      icon: <BarChart3 className="h-8 w-8" />,
      link: "/tools"
    },
    {
      title: "Download Datasets",
      description: "Download experimental data in various formats for offline analysis.",
      icon: <Download className="h-8 w-8" />,
      link: "/download"
    },
    {
      title: "Secure Data Management",
      description: "Control who can access your research with flexible privacy settings.",
      icon: <Lock className="h-8 w-8" />,
      link: "/settings"
    },
    {
      title: "Research Collaboration",
      description: "Collaborate with other researchers on projects with shared access controls.",
      icon: <Users className="h-8 w-8" />,
      link: "/community"
    }
  ];

  // Track user engagement time
  useEffect(() => {
    const startTime = new Date();
    
    return () => {
      const endTime = new Date();
      const sessionTimeHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      // We would increment research hours here, but we don't want to in the cleanup function
    };
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              ORION - Open Repository for Integrated Electrochemical Observation & Networking
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              A comprehensive platform for accessing, visualizing, and analyzing potentiostat-generated electrochemical data with DOI verification.
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
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                link={feature.link}
              />
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-bold mb-8">Recent Datasets</h2>
          <RecentDatasets />
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
