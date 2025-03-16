
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Database, Microscope, Calendar } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface SearchResult {
  id: string;
  title: string;
  type: "publication" | "dataset" | "tool" | "gene";
  description: string;
  year?: number;
  author?: string;
  source?: string;
}

const SearchResults = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    year: "all",
    category: "all",
    source: "all",
  });
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("query") || "";
    setQuery(searchQuery);
    
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [location.search]);
  
  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call when backend is implemented
      // const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      // const data = await response.json();
      
      // Simulating API response with mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults: SearchResult[] = [
        {
          id: "pub-1",
          title: "Advancements in Genomic Research",
          type: "publication",
          description: "A comprehensive review of recent advancements in genomic research techniques and applications.",
          year: 2023,
          author: "Dr. Jane Smith",
          source: "Journal of Genomics"
        },
        {
          id: "pub-2",
          title: "Clinical Applications of CRISPR",
          type: "publication",
          description: "Exploring current and potential clinical applications of CRISPR gene editing technology.",
          year: 2022,
          author: "Dr. John Doe",
          source: "Nature Medicine"
        },
        {
          id: "data-1",
          title: "Human Genome Project Dataset",
          type: "dataset",
          description: "Complete genomic sequences and annotations from the Human Genome Project.",
          year: 2021,
          source: "NCBI"
        },
        {
          id: "tool-1",
          title: "Genomic Analysis Toolkit",
          type: "tool",
          description: "A collection of tools for analyzing and visualizing genomic data.",
          year: 2022,
          author: "BiomediResearch Team",
          source: "BiomediResearch"
        },
        {
          id: "gene-1",
          title: "BRCA1 Gene Profile",
          type: "gene",
          description: "Complete profile and metadata for the BRCA1 gene associated with breast cancer susceptibility.",
          source: "Gene Database"
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Update URL without reloading the page
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("query", query);
      const newRelativePathQuery = `${location.pathname}?${searchParams.toString()}`;
      window.history.pushState(null, "", newRelativePathQuery);
      
      performSearch(query);
    }
  };
  
  const filteredResults = results.filter(result => {
    // Filter by tab
    if (activeTab !== "all" && result.type !== activeTab) {
      return false;
    }
    
    // Filter by year
    if (filters.year !== "all" && result.year?.toString() !== filters.year) {
      return false;
    }
    
    // Filter by category
    if (filters.category !== "all" && result.type !== filters.category) {
      return false;
    }
    
    // Filter by source
    if (filters.source !== "all" && result.source !== filters.source) {
      return false;
    }
    
    return true;
  });

  // Extract unique years and sources for filter options
  const years = [...new Set(results.filter(r => r.year).map(r => r.year))];
  const sources = [...new Set(results.filter(r => r.source).map(r => r.source))];
  
  const resultCounts = {
    all: results.length,
    publication: results.filter(r => r.type === "publication").length,
    dataset: results.filter(r => r.type === "dataset").length,
    tool: results.filter(r => r.type === "tool").length,
    gene: results.filter(r => r.type === "gene").length,
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Search Results</h1>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex w-full max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search genes, publications, tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={filters.year} 
              onValueChange={(value) => setFilters({...filters, year: value})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year?.toString() || ''}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters({...filters, category: value})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="publication">Publications</SelectItem>
                <SelectItem value="dataset">Datasets</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
                <SelectItem value="gene">Genes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Microscope className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={filters.source} 
              onValueChange={(value) => setFilters({...filters, source: value})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source || ''}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Tabs and Results */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  All ({resultCounts.all})
                </TabsTrigger>
                <TabsTrigger value="publication">
                  Publications ({resultCounts.publication})
                </TabsTrigger>
                <TabsTrigger value="dataset">
                  Datasets ({resultCounts.dataset})
                </TabsTrigger>
                <TabsTrigger value="tool">
                  Tools ({resultCounts.tool})
                </TabsTrigger>
                <TabsTrigger value="gene">
                  Genes ({resultCounts.gene})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                {filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No results found for "{query}"</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="publication" className="mt-0">
                {filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No publication results found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="dataset" className="mt-0">
                {filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No dataset results found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tool" className="mt-0">
                {filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No tool results found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="gene" className="mt-0">
                {filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No gene results found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </MainLayout>
  );
};

const SearchResultCard = ({ result }: { result: SearchResult }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'publication':
        return <BookOpen className="h-5 w-5" />;
      case 'dataset':
        return <Database className="h-5 w-5" />;
      case 'tool':
        return <Microscope className="h-5 w-5" />;
      case 'gene':
        return <Microscope className="h-5 w-5" />; // Could use a more specific icon for genes
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'publication':
        return 'Publication';
      case 'dataset':
        return 'Dataset';
      case 'tool':
        return 'Tool';
      case 'gene':
        return 'Gene';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              {getIcon(result.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4">
                {result.year && <span>{result.year}</span>}
                {result.author && <span>{result.author}</span>}
                {result.source && <span>{result.source}</span>}
                <span className="text-primary">{getTypeLabel(result.type)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{result.description}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">View Details</Button>
          <Button variant="ghost" size="sm">Download</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResults;
