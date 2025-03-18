
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecentDatasets } from "@/services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Download, Users, FileText, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  access: 'public' | 'private';
  author: string;
  date: string;
  downloads: number;
  method?: string;
  electrode?: string;
  instrument?: string;
}

const RecentDatasets = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadRecentDatasets = async () => {
      try {
        setLoading(true);
        const data = await fetchRecentDatasets();
        setDatasets(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load recent datasets:", err);
        setError("Failed to load recent datasets. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load recent datasets. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecentDatasets();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Public Datasets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="h-[300px]">
              <CardHeader>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-md text-center">
        <p className="text-destructive">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Recent Public Datasets</h2>
        <p className="text-muted-foreground">No public datasets available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Public Datasets</h2>
        <Link to="/data-browser">
          <Button variant="ghost" className="flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((dataset) => (
          <Card key={dataset.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{dataset.title}</CardTitle>
                <Badge variant={dataset.access === "public" ? "default" : "outline"}>
                  {dataset.access}
                </Badge>
              </div>
              <CardDescription>{dataset.category}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{dataset.description}</p>
              
              <div className="space-y-2 text-sm">
                {dataset.method && (
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4" /> 
                    Method: {dataset.method}
                  </div>
                )}
                
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" /> 
                  {new Date(dataset.date).toLocaleDateString()}
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" /> 
                  {dataset.author}
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Download className="mr-2 h-4 w-4" /> 
                  {dataset.downloads} downloads
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Link to={`/voltammetry/${dataset.id}`} className="w-full">
                <Button className="w-full">View Dataset</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentDatasets;
