
import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Filter, Download, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SampleDataChart from "@/components/charts/SampleDataChart";
import PlotlyVisualization from "@/components/visualizations/PlotlyVisualization";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Sample data for demonstration
const sampleData = [
  { id: "GENE001", name: "BRCA1", type: "Gene", species: "Human", description: "Breast cancer type 1 susceptibility protein" },
  { id: "GENE002", name: "TP53", type: "Gene", species: "Human", description: "Cellular tumor antigen p53" },
  { id: "GENE003", name: "EGFR", type: "Gene", species: "Human", description: "Epidermal growth factor receptor" },
  { id: "PROT001", name: "P53_HUMAN", type: "Protein", species: "Human", description: "Cellular tumor antigen p53" },
  { id: "PROT002", name: "BRCA1_HUMAN", type: "Protein", species: "Human", description: "Breast cancer type 1 susceptibility protein" },
  { id: "PATH001", name: "p53 Pathway", type: "Pathway", species: "Human", description: "p53 signaling pathway" },
  { id: "PATH002", name: "EGFR Signaling", type: "Pathway", species: "Human", description: "EGFR signaling pathway" },
  { id: "DSET001", name: "Cancer Genome Atlas", type: "Dataset", species: "Human", description: "Comprehensive cancer genomics dataset" },
];

// Columns configuration for dynamic column selection
const availableColumns = [
  { id: "id", label: "ID" },
  { id: "name", label: "Name" },
  { id: "type", label: "Type" },
  { id: "species", label: "Species" },
  { id: "description", label: "Description" },
];

// Sample PlotlyJs data for demonstration
const generatePlotlyData = () => [
  {
    x: ['Genes', 'Proteins', 'Pathways', 'Datasets'],
    y: [3, 2, 2, 1],
    type: 'bar',
    marker: {
      color: ['rgba(64, 76, 237, 0.8)', 'rgba(237, 64, 85, 0.8)', 'rgba(64, 237, 188, 0.8)', 'rgba(237, 194, 64, 0.8)']
    }
  }
];

const scatterPlotData = [
  {
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    mode: 'markers',
    type: 'scatter',
    marker: { 
      size: 12,
      color: 'rgba(64, 76, 237, 0.8)',
    },
    name: 'Series A'
  },
  {
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    mode: 'markers',
    type: 'scatter',
    marker: { 
      size: 12,
      color: 'rgba(237, 64, 85, 0.8)',
    },
    name: 'Series B'
  }
];

const voltammetryData = [
  {
    x: Array.from({ length: 100 }, (_, i) => i / 10),
    y: Array.from({ length: 100 }, (_, i) => Math.sin(i / 10) * Math.exp(-i / 50) * 10),
    type: 'scatter',
    mode: 'lines',
    name: 'Voltage',
    line: { color: 'rgba(64, 76, 237, 0.8)', width: 2 }
  }
];

const DataBrowser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dataType, setDataType] = useState("all");
  const [currentView, setCurrentView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [visibleColumns, setVisibleColumns] = useState(['id', 'name', 'type', 'species', 'description']);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search executed",
      description: `Searching for: ${searchQuery}, Type: ${dataType}`,
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download initiated",
      description: "Your data will be downloaded shortly.",
    });
  };

  const toggleColumn = (columnId: string) => {
    if (visibleColumns.includes(columnId)) {
      if (visibleColumns.length > 1) { // Prevent removing all columns
        setVisibleColumns(visibleColumns.filter(id => id !== columnId));
      }
    } else {
      setVisibleColumns([...visibleColumns, columnId]);
    }
  };

  // Filter data based on search query and selected type
  const filteredData = sampleData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = dataType === "all" || item.type.toLowerCase() === dataType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Data Browser</h1>
            <p className="text-muted-foreground">
              Search and explore genomic data, proteins, pathways, and datasets
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
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
                    placeholder="Search genes, proteins, pathways..."
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
              
              <Button type="submit" className="md:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {availableColumns.map(column => (
                <Button
                  key={column.id}
                  variant={visibleColumns.includes(column.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleColumn(column.id)}
                  type="button"
                >
                  {column.label}
                </Button>
              ))}
            </div>
          </form>
        </div>

        <Tabs defaultValue="table" value={currentView} onValueChange={setCurrentView} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="table" className="flex items-center gap-1">
              <List className="h-4 w-4" /> Table View
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-1">
              <LayoutGrid className="h-4 w-4" /> Visual Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="border rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('id') && <TableHead>ID</TableHead>}
                  {visibleColumns.includes('name') && <TableHead>Name</TableHead>}
                  {visibleColumns.includes('type') && <TableHead>Type</TableHead>}
                  {visibleColumns.includes('species') && <TableHead>Species</TableHead>}
                  {visibleColumns.includes('description') && <TableHead>Description</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    {visibleColumns.includes('id') && <TableCell className="font-medium">{item.id}</TableCell>}
                    {visibleColumns.includes('name') && <TableCell>{item.name}</TableCell>}
                    {visibleColumns.includes('type') && <TableCell>{item.type}</TableCell>}
                    {visibleColumns.includes('species') && <TableCell>{item.species}</TableCell>}
                    {visibleColumns.includes('description') && <TableCell className="max-w-xs truncate">{item.description}</TableCell>}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="text-center py-8 text-muted-foreground">
                      No results found. Try adjusting your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {filteredData.length > 0 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            isActive={currentPage === pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="visual" className="border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <PlotlyVisualization 
                title="Data Distribution"
                description="Distribution of data types in the database"
                data={generatePlotlyData()}
                layout={{
                  title: "",
                  xaxis: { title: "Data Type" },
                  yaxis: { title: "Count" }
                }}
              />
              
              <PlotlyVisualization
                title="Data Relationships"
                description="Correlation between related data points"
                data={scatterPlotData}
                layout={{
                  title: "",
                  xaxis: { title: "Variable X" },
                  yaxis: { title: "Variable Y" }
                }}
              />
            </div>
            
            <div className="mb-6">
              <PlotlyVisualization
                title="Voltammetry Analysis"
                description="Time series data visualization of voltage measurements"
                data={voltammetryData}
                layout={{
                  title: "",
                  xaxis: { title: "Time (s)" },
                  yaxis: { title: "Voltage (mV)" }
                }}
                height={400}
                isFullWidth={true}
              />
            </div>
            
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Genome Browser Integration</h3>
              <p className="text-muted-foreground mb-4">
                The genome browser visualization will be integrated here, 
                allowing researchers to explore genomic regions interactively.
              </p>
              <div className="border border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  Genome Browser Placeholder (IGV.js Integration)
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DataBrowser;
