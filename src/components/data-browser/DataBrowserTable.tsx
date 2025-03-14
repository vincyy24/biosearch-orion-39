
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataItem {
  id: string;
  name: string;
  type: string;
  species: string;
  description: string;
}

interface DataBrowserTableProps {
  paginatedData: DataItem[];
  visibleColumns: string[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  filteredData: DataItem[];
}

const DataBrowserTable = ({
  paginatedData,
  visibleColumns,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredData,
}: DataBrowserTableProps) => {
  return (
    <>
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default DataBrowserTable;
