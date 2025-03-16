
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Filter, Download, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SampleDataChart from "@/components/charts/SampleDataChart";

// Sample data for demonstration
const sampleGenes = [
  { id: "GENE001", name: "BRCA1", type: "Gene", species: "Human", description: "Breast cancer type 1 susceptibility protein" },
  { id: "GENE002", name: "TP53", type: "Gene", species: "Human", description: "Cellular tumor antigen p53" },
  { id: "GENE003", name: "EGFR", type: "Gene", species: "Human", description: "Epidermal growth factor receptor" },
];

const sampleProteins = [
  { id: "PROT001", name: "P53_HUMAN", type: "Protein", species: "Human", description: "Cellular tumor antigen p53" },
  { id: "PROT002", name: "BRCA1_HUMAN", type: "Protein", species: "Human", description: "Breast cancer type 1 susceptibility protein" },
];

const samplePathways = [
  { id: "PATH001", name: "p53 Pathway", type: "Pathway", species: "Human", description: "p53 signaling pathway" },
  { id: "PATH002", name: "EGFR Signaling", type: "Pathway", species: "Human", description: "EGFR signaling pathway" },
];

const sampleDatasets = [
  { id: "DSET001", name: "Cancer Genome Atlas", type: "Dataset", species: "Human", description: "Comprehensive cancer genomics dataset" },
  { id: "DSET002", name: "Protein Data Bank", type: "Dataset", species: "Multiple", description: "3D structural data of large biological molecules" },
];

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dataType, setDataType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const { toast } = useToast();

  // Extract search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    if (query) {
      setSearchQuery(query);
    }
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with new search query
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    
    toast({
      title: "Search executed",
      description: `Searching for: ${searchQuery}, Type: ${dataType}, Date: ${dateRange}`,
    });
  };

  const handleDownload = (format: 'csv' | 'excel') => {
    toast({
      title: `Download initiated (${format.toUpperCase()})`,
      description: "Your data will be downloaded shortly.",
    });
    
    // Simulate file download
    setTimeout(() => {
      // Create dummy content for CSV
      if (format === 'csv') {
        const csvContent = "data:text/csv;charset=utf-8,ID,Name,Type,Species,Description\n" + 
          sampleGenes.concat(sampleProteins, samplePathways, sampleDatasets)
            .map(item => `${item.id},${item.name},${item.type},${item.species},"${item.description}"`)
            .join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "search_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For Excel, we'd typically use a library like xlsx in a real implementation
        // This is just a placeholder notification
        toast({
          title: "Excel export",
          description: "In a production environment, this would generate an Excel file using the xlsx library.",
        });
      }
    }, 1000);
  };

  // Filter function to apply across all data types
  const filterByQuery = (item: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  };

  // Get filtered data based on current search and filters
  const filteredGenes = sampleGenes.filter(filterByQuery);
  const filteredProteins = sampleProteins.filter(filterByQuery);
  const filteredPathways = samplePathways.filter(filterByQuery);
  const filteredDatasets = sampleDatasets.filter(filterByQuery);
  
  // Calculate total results
  const totalResults = 
    filteredGenes.length + 
    filteredProteins.length + 
    filteredPathways.length + 
    filteredDatasets.length;

  // Render result rows for a specific data type
  const renderResultRows = (data: any[]) => {
    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
            No results found
          </TableCell>
        </TableRow>
      );
    }

    return data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.id}</TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.type}</TableCell>
        <TableCell>{item.species}</TableCell>
        <TableCell className="max-w-xs truncate">{item.description}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/data-browser?id=${item.id}`)}>
            View <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Results</h1>
            <p className="text-muted-foreground">
              {totalResults} results found for "{searchQuery}"
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 space-x-2">
            <Button variant="outline" onClick={() => handleDownload('csv')}>
              <Download className="mr-2 h-4 w-4" /> Export as CSV
            </Button>
            <Button variant="outline" onClick={() => handleDownload('excel')}>
              <Download className="mr-2 h-4 w-4" /> Export as Excel
            </Button>
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
                    placeholder="Refine your search..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Data Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="gene">Genes</SelectItem>
                    <SelectItem value="protein">Proteins</SelectItem>
                    <SelectItem value="pathway">Pathways</SelectItem>
                    <SelectItem value="dataset">Datasets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="md:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </form>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Results ({totalResults})</TabsTrigger>
            <TabsTrigger value="genes">Genes ({filteredGenes.length})</TabsTrigger>
            <TabsTrigger value="proteins">Proteins ({filteredProteins.length})</TabsTrigger>
            <TabsTrigger value="pathways">Pathways ({filteredPathways.length})</TabsTrigger>
            <TabsTrigger value="datasets">Datasets ({filteredDatasets.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {totalResults > 0 ? (
              <div className="space-y-8">
                {filteredGenes.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Genes</CardTitle>
                      <CardDescription>Gene records matching your search</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Species</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {renderResultRows(filteredGenes.slice(0, 3))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    {filteredGenes.length > 3 && (
                      <CardFooter>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('genes')}>
                          View all {filteredGenes.length} gene results
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
                
                {filteredProteins.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Proteins</CardTitle>
                      <CardDescription>Protein records matching your search</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Species</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {renderResultRows(filteredProteins.slice(0, 3))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    {filteredProteins.length > 3 && (
                      <CardFooter>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('proteins')}>
                          View all {filteredProteins.length} protein results
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
                
                {/* Similar cards for pathways and datasets would go here */}
                {filteredPathways.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Pathways</CardTitle>
                      <CardDescription>Pathway records matching your search</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Species</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {renderResultRows(filteredPathways.slice(0, 3))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    {filteredPathways.length > 3 && (
                      <CardFooter>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('pathways')}>
                          View all {filteredPathways.length} pathway results
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
                
                {filteredDatasets.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Datasets</CardTitle>
                      <CardDescription>Dataset records matching your search</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Species</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {renderResultRows(filteredDatasets.slice(0, 3))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    {filteredDatasets.length > 3 && (
                      <CardFooter>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('datasets')}>
                          View all {filteredDatasets.length} dataset results
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search terms or removing filters</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="genes">
            <Card>
              <CardHeader>
                <CardTitle>Gene Results</CardTitle>
                <CardDescription>
                  {filteredGenes.length} genes matching your search criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderResultRows(filteredGenes)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="proteins">
            <Card>
              <CardHeader>
                <CardTitle>Protein Results</CardTitle>
                <CardDescription>
                  {filteredProteins.length} proteins matching your search criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderResultRows(filteredProteins)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pathways">
            <Card>
              <CardHeader>
                <CardTitle>Pathway Results</CardTitle>
                <CardDescription>
                  {filteredPathways.length} pathways matching your search criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderResultRows(filteredPathways)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="datasets">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Results</CardTitle>
                <CardDescription>
                  {filteredDatasets.length} datasets matching your search criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderResultRows(filteredDatasets)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
