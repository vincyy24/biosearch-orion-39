
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

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
}

const DataBrowserFilters = ({
  searchQuery,
  setSearchQuery,
  dataType,
  setDataType,
  visibleColumns,
  toggleColumn,
  handleSearch,
}: DataBrowserFiltersProps) => {
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
  );
};

export default DataBrowserFilters;
