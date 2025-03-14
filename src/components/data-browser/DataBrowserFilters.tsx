
import React, { useState } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, Heart, Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUniqueDataTypes, getUniqueSpecies, SavedSearch, sampleSavedSearches } from "./types";

// Columns configuration for dynamic column selection
export const availableColumns = [
  { id: "id", label: "ID" },
  { id: "name", label: "Name" },
  { id: "type", label: "Type" },
  { id: "species", label: "Species" },
  { id: "description", label: "Description" },
];

interface DataBrowserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dataType: string;
  setDataType: (type: string) => void;
  visibleColumns: string[];
  toggleColumn: (columnId: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  species?: string;
  setSpecies?: (species: string) => void;
  isAuthenticated?: boolean;
}

const DataBrowserFilters = ({
  searchQuery,
  setSearchQuery,
  dataType,
  setDataType,
  visibleColumns,
  toggleColumn,
  handleSearch,
  species = "all",
  setSpecies = () => {},
  isAuthenticated = false,
}: DataBrowserFiltersProps) => {
  const { toast } = useToast();
  const [savedSearchName, setSavedSearchName] = useState("");
  const [showSavedSearchInput, setShowSavedSearchInput] = useState(false);

  // Get dynamic data types and species from the sample data
  const dataTypes = ["all", ...getUniqueDataTypes()];
  const speciesList = ["all", ...getUniqueSpecies()];

  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to save searches.",
        variant: "destructive",
      });
      return;
    }

    if (!savedSearchName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your saved search.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Search saved",
      description: `Your search "${savedSearchName}" has been saved.`,
    });

    setSavedSearchName("");
    setShowSavedSearchInput(false);
  };

  const applyFilter = (type: string, query: string) => {
    setDataType(type);
    setSearchQuery(query);
    
    toast({
      title: "Filter applied",
      description: `Applied saved filter: ${query}`,
    });
  };

  return (
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
                {dataTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Select value={species} onValueChange={setSpecies}>
              <SelectTrigger>
                <SelectValue placeholder="Species" />
              </SelectTrigger>
              <SelectContent>
                {speciesList.map(item => (
                  <SelectItem key={item} value={item.toLowerCase()}>
                    {item === "all" ? "All Species" : item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="md:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
          
          {isAuthenticated && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="md:w-auto">
                  <Star className="mr-2 h-4 w-4" /> Saved
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Saved Searches</h4>
                  {sampleSavedSearches.length > 0 ? (
                    <div className="space-y-2">
                      {sampleSavedSearches.map((savedSearch: SavedSearch) => (
                        <div key={savedSearch.id} className="flex items-center justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start" 
                            onClick={() => applyFilter(savedSearch.type, savedSearch.query)}
                          >
                            <Heart className="mr-2 h-3 w-3" /> {savedSearch.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No saved searches yet.</p>
                  )}
                  
                  {showSavedSearchInput ? (
                    <div className="pt-2 space-y-2">
                      <Input
                        placeholder="Name this search"
                        value={savedSearchName}
                        onChange={(e) => setSavedSearchName(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSaveSearch}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowSavedSearchInput(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowSavedSearchInput(true)}
                    >
                      <Plus className="mr-2 h-3 w-3" /> Save Current Search
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
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
  );
};

export default DataBrowserFilters;
