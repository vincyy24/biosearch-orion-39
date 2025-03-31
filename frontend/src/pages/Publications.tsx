import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicationCard from "@/components/publications/PublicationCard";
import { Search, Filter, Plus, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Publication } from "@/types/common";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/services/api";

const Publications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/publications/');
      
      // If the API isn't working yet, use sample data
      let publicationsData = response.data?.results || getSamplePublications();
      
      // Ensure all publications have researchers array
      publicationsData = publicationsData.map((pub: Publication) => ({
        ...pub,
        researchers: pub.researchers || [],
      }));
      
      setPublications(publicationsData);
      applyFilters(publicationsData, searchQuery, activeTab);
    } catch (error) {
      console.error("Error fetching publications:", error);
      // Fall back to sample data
      const sampleData = getSamplePublications();
      setPublications(sampleData);
      applyFilters(sampleData, searchQuery, activeTab);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch publications. Using sample data instead.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSamplePublications = (): Publication[] => {
    return [
      {
        id: "pub-1",
        doi: "10.1021/jacs.0c01924",
        title: "Enhanced Electrochemical Performance of Lithium-Ion Batteries with Artificial SEI Films",
        journal: "Journal of the American Chemical Society",
        year: 2023,
        researchers: [
          { id: "r1", name: "Dr. Sarah Johnson", institution: "MIT", is_primary: true },
          { id: "r2", name: "Dr. Michael Chen", institution: "Stanford University", is_primary: false }
        ],
        created_at: "2023-04-15T10:30:00Z",
        is_public: true,
        abstract: "This paper investigates novel artificial solid-electrolyte interphase films for lithium-ion batteries, demonstrating significant improvements in cycle life and capacity retention.",
        is_peer_reviewed: true
      },
      {
        id: "pub-2",
        doi: "10.1038/s41586-020-2649-2",
        title: "Machine Learning Approaches for Predicting Battery Material Properties",
        journal: "Nature",
        year: 2022,
        researchers: [
          { id: "r3", name: "Dr. Emily Williams", institution: "UC Berkeley", is_primary: true },
          { id: "r4", name: "Dr. Robert Kumar", institution: "Princeton University", is_primary: false }
        ],
        created_at: "2022-11-22T14:15:00Z",
        is_public: true,
        abstract: "A comprehensive study utilizing machine learning algorithms to predict properties of novel battery materials, accelerating discovery of high-performance energy storage solutions.",
        is_peer_reviewed: true
      },
      {
        id: "pub-3",
        doi: "10.1002/adma.202001335",
        title: "High-Throughput Screening of Electrocatalysts for Water Splitting",
        journal: "Advanced Materials",
        year: 2023,
        researchers: [
          { id: "r5", name: "Dr. James Wilson", institution: "Caltech", is_primary: true },
          { id: "r6", name: "Dr. Lisa Zhang", institution: "Harvard University", is_primary: false }
        ],
        created_at: "2023-02-08T09:45:00Z",
        is_public: false,
        abstract: "Development of a high-throughput screening methodology to rapidly identify promising electrocatalysts for hydrogen evolution and oxygen evolution reactions.",
        is_peer_reviewed: true
      }
    ];
  };

  const applyFilters = (data: Publication[], query: string, tab: string) => {
    let filtered = [...data];
    
    // Apply search query
    if (query) {
      const searchTerms = query.toLowerCase().split(" ");
      filtered = filtered.filter(pub => {
        const titleMatch = pub.title.toLowerCase().includes(query.toLowerCase());
        const doiMatch = pub.doi.toLowerCase().includes(query.toLowerCase());
        const journalMatch = pub.journal.toLowerCase().includes(query.toLowerCase());
        const researchersMatch = pub.researchers?.some(r => 
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.institution.toLowerCase().includes(query.toLowerCase())
        );
        
        return titleMatch || doiMatch || journalMatch || researchersMatch;
      });
    }
    
    // Apply tab filter
    if (tab === "my") {
      // In a real app, this would filter to show only the user's publications
      // For now, let's just show a subset
      filtered = filtered.filter((_, index) => index % 2 === 0);
    } else if (tab === "private") {
      filtered = filtered.filter(pub => !pub.is_public);
    } else if (tab === "peer_reviewed") {
      filtered = filtered.filter(pub => pub.is_peer_reviewed);
    }
    
    // Apply sorting
    if (sortBy === "date_desc") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "date_asc") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === "title_asc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title_desc") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }
    
    setFilteredPublications(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(publications, searchQuery, activeTab);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    applyFilters(publications, searchQuery, value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    applyFilters(publications, searchQuery, activeTab);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedPublications = filteredPublications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AppLayout>
      <div className="container py-8 mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Research Publications</h1>
            <p className="text-muted-foreground mb-4">
              Browse and search published research with experimental data
            </p>
          </div>
          {isAuthenticated && (
            <Button 
              onClick={() => navigate("/publications/register")}
              className="mt-4 sm:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Register Publication
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search publications by title, DOI, author, or journal..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <div className="flex gap-2">
              <div className="w-[180px]">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Newest first</SelectItem>
                    <SelectItem value="date_asc">Oldest first</SelectItem>
                    <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All Publications</TabsTrigger>
              {isAuthenticated && <TabsTrigger value="my">My Publications</TabsTrigger>}
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="peer_reviewed">Peer-Reviewed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-between">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : paginatedPublications.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPublications.map((publication) => (
                      <PublicationCard
                        key={publication.id || publication.doi}
                        publication={publication}
                        onView={() => navigate(`/publications/${publication.doi}`)}
                      />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No publications found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="my" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-between">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : paginatedPublications.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPublications.map((publication) => (
                      <PublicationCard
                        key={publication.id || publication.doi}
                        publication={publication}
                        onView={() => navigate(`/publications/${publication.doi}`)}
                      />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No publications found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="private" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-between">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : paginatedPublications.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPublications.map((publication) => (
                      <PublicationCard
                        key={publication.id || publication.doi}
                        publication={publication}
                        onView={() => navigate(`/publications/${publication.doi}`)}
                      />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No publications found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="peer_reviewed" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-between">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : paginatedPublications.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPublications.map((publication) => (
                      <PublicationCard
                        key={publication.id || publication.doi}
                        publication={publication}
                        onView={() => navigate(`/publications/${publication.doi}`)}
                      />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No publications found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Publications;
