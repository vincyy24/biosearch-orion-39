
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layouts/AppLayout";
import PublicationCard from "@/components/publications/PublicationCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";

interface Publication {
  id: string;
  title: string;
  journal: string;
  year: string;
  doi: string;
  abstract?: string;
  authors?: { name: string; isMain: boolean }[];
}

const Publications = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      setIsLoading(true);
      try {
        // Mock data for now
        const mockPublications: Publication[] = [
          {
            id: "1",
            title: "Novel Electrochemical Sensing Mechanisms for Glucose Detection",
            journal: "Journal of Electroanalytical Chemistry",
            year: "2023",
            doi: "10.1016/j.jelechem.2023.01.001",
            authors: [
              { name: "Jane Smith", isMain: true },
              { name: "John Doe", isMain: false }
            ],
            abstract: "This paper presents a novel electrochemical sensing mechanism for glucose detection..."
          },
          {
            id: "2",
            title: "Recent Advances in Voltammetric Analysis of Pharmaceuticals",
            journal: "Electrochimica Acta",
            year: "2022",
            doi: "10.1016/j.electacta.2022.02.002",
            authors: [
              { name: "Michael Chen", isMain: true },
              { name: "Sarah Johnson", isMain: false }
            ],
            abstract: "A comprehensive review of recent advances in voltammetric techniques applied to pharmaceutical analysis..."
          },
          {
            id: "3",
            title: "Machine Learning Approaches for Electrochemical Data Analysis",
            journal: "Analytical Chemistry",
            year: "2021",
            doi: "10.1021/acs.analchem.1c00123",
            authors: [
              { name: "David Williams", isMain: true },
              { name: "Emma Brown", isMain: false }
            ],
            abstract: "This study explores various machine learning approaches for the analysis and interpretation of electrochemical data..."
          },
        ];

        setPublications(mockPublications);
        setFilteredPublications(mockPublications);
      } catch (error) {
        console.error("Error fetching publications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Apply filters when search term, year filter, or type filter changes
  useEffect(() => {
    if (publications) {
      let filtered = [...publications];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(pub => 
          pub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          pub.doi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pub.authors && pub.authors.some(author => 
            author.name.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        );
      }
      
      // Apply year filter
      if (yearFilter) {
        filtered = filtered.filter(pub => pub.year === yearFilter);
      }
      
      // Apply type filter (would need to add type to the publication interface)
      if (typeFilter) {
        filtered = filtered.filter(pub => (pub as any).type === typeFilter);
      }
      
      // Apply tab filtering
      if (activeTab === "my") {
        // Mock filtering for "my publications" - in a real app, this would filter by user ID
        filtered = filtered.filter((_, index) => index % 2 === 0);
      }
      
      setFilteredPublications(filtered);
    }
  }, [searchTerm, yearFilter, typeFilter, activeTab, publications]);

  const handleRegisterPublication = () => {
    navigate("/publications/new");
  };

  const handleViewPublication = (id: string) => {
    navigate(`/publications/details?id=${id}`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Publications</h1>
            <p className="text-muted-foreground mt-1">
              Browse and search scientific publications in the field of electrochemistry.
            </p>
          </div>
          {isAuthenticated && (
            <Button 
              onClick={handleRegisterPublication} 
              className="mt-4 md:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" /> Register Publication
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Publications</TabsTrigger>
            {isAuthenticated && <TabsTrigger value="my">My Publications</TabsTrigger>}
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or DOI"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="bg-background border rounded-md p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filter Publications</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setYearFilter("");
                  setTypeFilter("");
                }}
              >
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Publication Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Publication Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="conference">Conference Paper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(yearFilter || typeFilter) && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
                {yearFilter && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Year: {yearFilter}
                  </Badge>
                )}
                {typeFilter && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Type: {typeFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredPublications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((publication) => (
              <PublicationCard
                key={publication.id}
                publication={publication}
                onView={() => handleViewPublication(publication.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No publications found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setYearFilter("");
                setTypeFilter("");
                setActiveTab("all");
              }}
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Publications;
