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
import { fetchPublications, fetchMyPublications } from "@/services/publicationService";

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
    fetchPublicationsData();
  }, [activeTab, isAuthenticated]);

  const fetchPublicationsData = async () => {
    try {
      setLoading(true);

      let response;
      if (activeTab === "my" && isAuthenticated) {
        // Fetch only user's publications
        response = await fetchMyPublications(currentPage, itemsPerPage, searchQuery);
      } else {
        // Fetch public publications for all users
        response = await fetchPublications(currentPage, itemsPerPage, searchQuery, { is_public: true });
      }

      if (response) {
        // Ensure all publications have researchers array
        const publicationsData = Array.isArray(response) ? response : (response.results || []);
        const normalizedData = publicationsData.map((pub: Publication) => ({
          ...pub,
          researchers: pub.researchers || [],
        }));

        setPublications(normalizedData);
        applyFilters(normalizedData, searchQuery, activeTab);
      } else {
        setPublications([]);
        setFilteredPublications([]);
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
      setPublications([]);
      setFilteredPublications([]);

      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch publications. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: Publication[], query: string, tab: string) => {
    let filtered = [...data];

    // Apply search query
    if (query) {
      const searchTerms = query.toLowerCase().split(" ");
      filtered = filtered.filter(pub => {
        const titleMatch = pub.title?.toLowerCase().includes(query.toLowerCase());
        const doiMatch = pub.doi?.toLowerCase().includes(query.toLowerCase());
        const journalMatch = pub.journal?.toLowerCase().includes(query.toLowerCase());
        const researchersMatch = pub.researchers?.some(r =>
          r.name?.toLowerCase().includes(query.toLowerCase()) ||
          r.institution?.toLowerCase().includes(query.toLowerCase())
        );

        return titleMatch || doiMatch || journalMatch || researchersMatch;
      });
    }

    // Apply tab filter (additional filtering if needed)
    if (tab === "private" && isAuthenticated) {
      filtered = filtered.filter(pub => !pub.is_public);
    } else if (tab === "peer_reviewed") {
      filtered = filtered.filter(pub => pub.is_peer_reviewed);
    }

    // Apply sorting
    if (sortBy === "date_desc") {
      filtered.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
    } else if (sortBy === "date_asc") {
      filtered.sort((a, b) => new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime());
    } else if (sortBy === "title_asc") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "title_desc") {
      filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    setFilteredPublications(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublicationsData();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Data will be fetched in the useEffect when activeTab changes
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

              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                fetchPublicationsData();
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All Publications</TabsTrigger>
              {isAuthenticated && <TabsTrigger value="my">My Publications</TabsTrigger>}
              {isAuthenticated && <TabsTrigger value="private">Private</TabsTrigger>}
              <TabsTrigger value="peer_reviewed">Peer-Reviewed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {renderPublicationList()}
            </TabsContent>

            <TabsContent value="my" className="mt-6">
              {isAuthenticated ? renderPublicationList() : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Login Required</h3>
                  <p className="text-muted-foreground mt-1">
                    Please log in to view your publications
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="private" className="mt-6">
              {isAuthenticated ? renderPublicationList() : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Login Required</h3>
                  <p className="text-muted-foreground mt-1">
                    Please log in to view private publications
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="peer_reviewed" className="mt-6">
              {renderPublicationList()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );

  function renderPublicationList() {
    if (loading) {
      return (
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
      );
    }

    if (paginatedPublications.length > 0) {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPublications.map((publication) => (
              <PublicationCard
                key={publication.id || publication.doi}
                publication={publication}
                onView={() => navigate(`/publications/${publication.doi.replace("/", "_")}`)}
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
      );
    }

    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No publications found</h3>
        <p className="text-muted-foreground mt-1">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }
};

export default Publications;
