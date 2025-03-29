
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Search, Filter, Calendar, Users, Download, ExternalLink, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchPublications } from "@/services/publicationService";

interface Publication {
  id: string;
  doi: string;
  title: string;
  journal: string;
  year: number;
  is_public: boolean;
  researchers: {
    id: string;
    name: string;
    institution: string;
    is_primary: boolean;
  }[];
  created_at: string;
  abstract: string;
}

interface PublicationFilters {
  is_public?: boolean;
  year?: number;
  sort_by?: string;
}

const Publications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<PublicationFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    fetchPublicationsData();
  }, [filters]);

  const fetchPublicationsData = async () => {
    try {
      setLoading(true);
      const response = await fetchPublications(1, 20, searchQuery, filters);
      setPublications(response.results || []);
      
      // Extract unique years for filter
      if (response.results?.length) {
        const uniqueYears = Array.from(new Set(response.results.map(pub => pub.year))).filter(Boolean) as number[];
        setYears(uniqueYears.sort((a, b) => b - a));
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load publications. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublicationsData();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredPublications = publications.filter(pub => {
    // Filter by tab
    if (activeTab === "my" && !pub.researchers.some(r => r.is_primary)) {
      return false;
    }
    
    if (activeTab === "public" && !pub.is_public) {
      return false;
    }
    
    return true;
  });

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Publications</h1>
            <p className="text-muted-foreground mt-1">Browse and manage publications and their associated datasets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/publications/new")}>
              <Plus className="w-4 h-4 mr-2" /> Register Publication
            </Button>
            <Button onClick={() => navigate("/upload")}>
              <Upload className="w-4 h-4 mr-2" /> Upload Data
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search publications..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full md:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <Button type="submit" className="w-full md:w-auto">
              Search
            </Button>
          </form>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Publication Type</label>
                <Select 
                  value={filters.is_public?.toString() || ''} 
                  onValueChange={(val) => handleFilterChange('is_public', val === '' ? undefined : val === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Publications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Publications</SelectItem>
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Year</label>
                <Select 
                  value={filters.year?.toString() || ''} 
                  onValueChange={(val) => handleFilterChange('year', val === '' ? undefined : parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select 
                  value={filters.sort_by || ''} 
                  onValueChange={(val) => handleFilterChange('sort_by', val === '' ? undefined : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Most Recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Publications</TabsTrigger>
            <TabsTrigger value="my">My Publications</TabsTrigger>
            <TabsTrigger value="public">Public Publications</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderPublicationsList(loading, filteredPublications, navigate)}
          </TabsContent>
          
          <TabsContent value="my" className="mt-0">
            {renderPublicationsList(loading, filteredPublications, navigate)}
          </TabsContent>
          
          <TabsContent value="public" className="mt-0">
            {renderPublicationsList(loading, filteredPublications, navigate)}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const renderPublicationsList = (loading: boolean, publications: Publication[], navigate: any) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (publications.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No publications found</h3>
        <p className="text-muted-foreground mb-6">
          Register your first publication to manage datasets and track research impact
        </p>
        <Button onClick={() => navigate("/publications/new")}>
          <Plus className="w-4 h-4 mr-2" /> Register Publication
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {publications.map((publication) => (
        <Card key={publication.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg hover:text-primary cursor-pointer" onClick={() => navigate(`/publications/${publication.doi}`)}>
                  {publication.title}
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {publication.journal}, {publication.year}
                </CardDescription>
              </div>
              {publication.is_public ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100">
                  Private
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {publication.abstract && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {publication.abstract}
              </p>
            )}
            
            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-muted-foreground" />
                <span>Published: {publication.year}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-muted-foreground" />
                <span>
                  {publication.researchers.length} Researcher{publication.researchers.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1.5 text-muted-foreground" />
                <span>DOI: {publication.doi}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/publications/${publication.doi}`)}
              >
                View Details
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://doi.org/${publication.doi}`, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Original Publication
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/publications/${publication.doi}?tab=datasets`)}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Datasets
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Publications;
