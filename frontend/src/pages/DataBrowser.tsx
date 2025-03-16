
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SampleDataChart from "@/components/charts/SampleDataChart";

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

const DataBrowser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dataType, setDataType] = useState("all");
  const [currentView, setCurrentView] = useState("table");
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
          
          <div className="mt-4 md:mt-0">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Export Data
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
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.species}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
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
              <h3 className="text-xl font-semibold mb-2">Data Distribution</h3>
              <p className="text-muted-foreground mb-4">
                Visual representation of the data distribution by type
              </p>
              <div className="h-80">
                <SampleDataChart />
              </div>
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
