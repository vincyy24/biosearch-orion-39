
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Calendar, User, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample publications data
const samplePublications = [
  {
    id: "pub1",
    title: "Genomic landscape of metastatic breast cancer identifies drivers of disease progression",
    authors: ["Smith, J.", "Johnson, A.", "Williams, R."],
    journal: "Nature Genetics",
    year: 2023,
    abstract: "This study characterizes the genomic landscape of metastatic breast cancer and identifies key drivers of disease progression through comprehensive genomic analysis.",
    doi: "10.1038/ng.2023.1234",
    keywords: ["breast cancer", "genomics", "metastasis", "disease progression"],
    citations: 42,
  },
  {
    id: "pub2",
    title: "Single-cell transcriptomics reveals immune cell populations in Alzheimer's disease",
    authors: ["Lee, S.", "Brown, T.", "Garcia, M."],
    journal: "Cell",
    year: 2022,
    abstract: "Using single-cell RNA sequencing, this study provides a detailed map of immune cell populations in Alzheimer's disease patients, revealing novel therapeutic targets.",
    doi: "10.1016/j.cell.2022.5678",
    keywords: ["Alzheimer's disease", "single-cell", "RNA-seq", "immunology"],
    citations: 78,
  },
  {
    id: "pub3",
    title: "CRISPR-Cas9 mediated gene editing for rare genetic disorders",
    authors: ["Chen, H.", "Zhang, L.", "Kim, S."],
    journal: "Science",
    year: 2022,
    abstract: "This paper demonstrates the successful application of CRISPR-Cas9 gene editing technology to correct mutations responsible for several rare genetic disorders.",
    doi: "10.1126/science.2022.9101",
    keywords: ["CRISPR", "gene editing", "genetic disorders", "therapy"],
    citations: 103,
  },
  {
    id: "pub4",
    title: "Structural basis of SARS-CoV-2 spike protein recognition by neutralizing antibodies",
    authors: ["Rodriguez, A.", "Patel, K.", "White, M."],
    journal: "Cell",
    year: 2021,
    abstract: "This study reveals the structural mechanisms underlying the recognition of SARS-CoV-2 spike protein by neutralizing antibodies, providing insights for vaccine development.",
    doi: "10.1016/j.cell.2021.1112",
    keywords: ["COVID-19", "SARS-CoV-2", "spike protein", "antibodies", "structural biology"],
    citations: 215,
  },
  {
    id: "pub5",
    title: "Machine learning approaches for predicting drug-target interactions",
    authors: ["Wang, Q.", "Davis, P.", "Miller, J."],
    journal: "Nature Methods",
    year: 2023,
    abstract: "This research presents novel machine learning algorithms for accurately predicting drug-target interactions, accelerating the drug discovery process.",
    doi: "10.1038/nmeth.2023.3344",
    keywords: ["machine learning", "drug discovery", "drug-target interactions", "bioinformatics"],
    citations: 31,
  },
  {
    id: "pub6",
    title: "Human gut microbiome alterations in inflammatory bowel disease",
    authors: ["Thompson, E.", "Anderson, B.", "Kumar, R."],
    journal: "Nature Communications",
    year: 2022,
    abstract: "A comprehensive analysis of gut microbiome alterations in inflammatory bowel disease patients, identifying specific bacterial signatures associated with disease phenotypes.",
    doi: "10.1038/ncomms.2022.5566",
    keywords: ["microbiome", "inflammatory bowel disease", "gut bacteria", "metagenomics"],
    citations: 89,
  },
];

const Publications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [yearFilter, setYearFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search executed",
      description: `Searching for: ${searchQuery}, Sort: ${sortBy}, Year: ${yearFilter}`,
    });
  };

  // Filter publications based on search and filters
  const filteredPublications = samplePublications.filter(pub => {
    const matchesSearch = searchQuery === "" || 
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pub.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesYear = yearFilter === "all" || pub.year.toString() === yearFilter;
    
    return matchesSearch && matchesYear;
  });

  // Sort publications based on selection
  const sortedPublications = [...filteredPublications].sort((a, b) => {
    if (sortBy === "date") {
      return b.year - a.year;
    } else if (sortBy === "citations") {
      return b.citations - a.citations;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const yearOptions = ["all", ...new Set(samplePublications.map(pub => pub.year.toString()))].sort((a, b) => b.localeCompare(a));

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Publications</h1>
            <p className="text-muted-foreground">
              Browse and search scientific publications in biomedical research
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search publications by title, abstract, authors, or keywords..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year}>
                        {year === "all" ? "All Years" : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Newest First</SelectItem>
                    <SelectItem value="citations">Most Cited</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="md:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </form>
        </div>

        <div className="flex justify-end mb-4">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="cards">Card View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {sortedPublications.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No publications found matching your search criteria.</p>
          </div>
        ) : (
          <div className={viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
            {sortedPublications.map((pub) => (
              <Card key={pub.id} className={viewMode === "cards" ? "" : "overflow-hidden"}>
                <CardContent className={`${viewMode === "cards" ? "p-6" : "p-6 flex"}`}>
                  {viewMode === "list" && (
                    <div className="mr-6 flex items-center justify-center bg-primary/10 rounded-lg p-4 h-16 w-16">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{pub.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-1 h-3 w-3" />
                        {pub.authors.join(", ")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {pub.year}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{pub.abstract}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {pub.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {pub.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{pub.keywords.length - 3}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm font-medium">
                      <ArrowUpDown className="mr-1 h-3 w-3" />
                      {pub.citations} citations
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-muted/30 px-6 py-3">
                  <div className="flex w-full justify-between items-center">
                    <span className="text-sm text-muted-foreground">{pub.journal}</span>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Publications;
