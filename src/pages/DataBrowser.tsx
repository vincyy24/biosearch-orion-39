
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DataBrowserFilters from "@/components/data-browser/DataBrowserFilters";
import DataBrowserTable from "@/components/data-browser/DataBrowserTable";
import DataBrowserVisualizations from "@/components/data-browser/DataBrowserVisualizations";
import { sampleData } from "@/components/data-browser/types";

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

        <DataBrowserFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dataType={dataType}
          setDataType={setDataType}
          visibleColumns={visibleColumns}
          toggleColumn={toggleColumn}
          handleSearch={handleSearch}
        />

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
            <DataBrowserTable 
              paginatedData={paginatedData}
              visibleColumns={visibleColumns}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              filteredData={filteredData}
            />
          </TabsContent>
          
          <TabsContent value="visual" className="border rounded-lg p-6">
            <DataBrowserVisualizations />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DataBrowser;
