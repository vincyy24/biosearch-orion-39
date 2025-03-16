
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { Search, Filter, Download, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SampleDataChart from "@/components/charts/SampleDataChart";
import VoltammetryPlot from "@/components/visualizations/VoltammetryPlot";
import { fetchVisualizationUrl } from "@/services/api";

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
  { id: "VOLT001", name: "Cyclic Voltammetry Study", type: "Voltammetry", species: "N/A", description: "Electrochemical analysis using cyclic voltammetry" },
  { id: "VOLT002", name: "Differential Pulse Analysis", type: "Voltammetry", species: "N/A", description: "Electrochemical analysis using differential pulse voltammetry" },
];

const DataBrowser = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [dataType, setDataType] = useState("all");
  const [currentView, setCurrentView] = useState("table");
  const [selectedVisualization, setSelectedVisualization] = useState("distribution");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();

  // Check for ID parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const itemId = params.get("id");
    if (itemId) {
      const item = sampleData.find(d => d.id === itemId);
      if (item) {
        setSelectedItem(item);
        
        // If it's a voltammetry item, switch to visual tab
        if (item.type === "Voltammetry") {
          setCurrentView("visual");
          setSelectedVisualization("voltammetry");
        }
        
        setSearchQuery(item.name);
        setDataType(item.type.toLowerCase());
      }
    }
  }, [location.search]);

  useEffect(() => {
    // Fetch dashboard URL based on selected visualization
    if (selectedVisualization === "publications") {
      const url = fetchVisualizationUrl("PublicationsViz");
      setDashboardUrl(url);
    } else if (selectedVisualization === "voltammetry") {
      const url = fetchVisualizationUrl("VoltammetryViz");
      setDashboardUrl(url);
    }
  }, [selectedVisualization]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search executed",
      description: `Searching for: ${searchQuery}, Type: ${dataType}`,
    });
  };

  const handleDownload = (format: 'csv' | 'excel') => {
    toast({
      title: `Download initiated (${format.toUpperCase()})`,
      description: "Your data will be downloaded shortly.",
    });

    // In a real app, this would call an API endpoint to generate the file
    setTimeout(() => {
      // Simulate file download for CSV
      if (format === 'csv') {
        const header = "ID,Name,Type,Species,Description\n";
        const csvContent = "data:text/csv;charset=utf-8," + 
          header + 
          filteredData.map(item => 
            `${item.id},${item.name},${item.type},${item.species},"${item.description}"`
          ).join("\n");
          
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "data_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For Excel, in a real app we would use a library like xlsx
        toast({
          title: "Excel export",
          description: "In a production environment, this would generate an Excel file using the xlsx library.",
        });
      }
    }, 1000);
  };

  // Filter data based on search query and selected type
  const filteredData = sampleData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = dataType === "all" || item.type.toLowerCase() === dataType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

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
          
          <div className="mt-4 md:mt-0 space-x-2">
            <Button variant="outline" onClick={() => handleDownload('csv')}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleDownload('excel')}>
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
          </div>
        </div>

        {selectedItem && (
          <div className="bg-primary/10 rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                <p className="text-sm text-muted-foreground mb-2">ID: {selectedItem.id} | Type: {selectedItem.type} | Species: {selectedItem.species}</p>
                <p>{selectedItem.description}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 md:mt-0"
                onClick={() => setSelectedItem(null)}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

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
                    <SelectItem value="voltammetry">Voltammetry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="md:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </form>
        </div>

        <Tabs defaultValue="table" value={currentView} onValueChange={setCurrentView} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="border rounded-lg p-4">
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
                {filteredData.map((item) => (
                  <TableRow key={item.id} className={selectedItem?.id === item.id ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.species}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          if (item.type === "Voltammetry") {
                            setCurrentView("visual");
                            setSelectedVisualization("voltammetry");
                          }
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No results found. Try adjusting your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="visual" className="border rounded-lg p-6">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h3 className="text-xl font-semibold">Data Visualization</h3>
                
                <div className="mt-2 md:mt-0">
                  <Select value={selectedVisualization} onValueChange={setSelectedVisualization}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select visualization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distribution">Data Distribution</SelectItem>
                      <SelectItem value="publications">Publications Analysis</SelectItem>
                      <SelectItem value="voltammetry">Voltammetry Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedVisualization === "distribution" && (
                <div className="h-80">
                  <SampleDataChart />
                </div>
              )}
              
              {selectedVisualization === "voltammetry" && (
                <div className="mb-8">
                  <p className="text-muted-foreground mb-4">
                    Interactive visualization of voltammetry data with adjustable parameters
                  </p>
                  <VoltammetryPlot height={400} />
                </div>
              )}
              
              {selectedVisualization === "publications" && (
                <div className="bg-muted/30 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Publication citation analysis across different years and research topics
                  </p>
                  
                  {dashboardUrl && (
                    <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
                      <iframe 
                        src={dashboardUrl}
                        title="Publications Dashboard" 
                        width="100%" 
                        height="100%" 
                        style={{ border: "none" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Django-Plotly-Dash integration for voltammetry data */}
            {selectedVisualization === "voltammetry" && dashboardUrl && (
              <div className="bg-muted/30 p-6 rounded-lg mt-6">
                <h3 className="text-lg font-medium mb-2">Advanced Voltammetry Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed interactive visualization powered by Python Dash
                </p>
                <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
                  <iframe 
                    src={dashboardUrl}
                    title="Voltammetry Dashboard" 
                    width="100%" 
                    height="100%" 
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DataBrowser;
