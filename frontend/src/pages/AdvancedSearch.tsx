import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarIcon, FilterIcon, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import AppLayout from '@/components/layouts/AppLayout';
import SearchBar from '@/components/search/SearchBar';
import { toast } from '@/hooks/use-toast';

interface SearchResult {
  experiment_id: string;
  title: string;
  experiment_type: string;
  electrode_material?: string;
  date_created: string;
  scan_rate?: number;
}

const AdvancedSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [experimentTypes, setExperimentTypes] = useState<string[]>([]);
  
  // Filter states
  const [experimentType, setExperimentType] = useState<string>('');
  const [electrodeMaterial, setElectrodeMaterial] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [scanRateMin, setScanRateMin] = useState<string>('');
  const [scanRateMax, setScanRateMax] = useState<string>('');
  
  // For mobile filter sheet
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Get experiment types on mount
  useEffect(() => {
    const fetchExperimentTypes = async () => {
      try {
        const response = await fetch('/api/experiment-types/');
        if (response.ok) {
          const data = await response.json();
          setExperimentTypes(data.types);
        }
      } catch (error) {
        console.error('Error fetching experiment types:', error);
      }
    };
    
    fetchExperimentTypes();
  }, []);
  
  // Parse search params on mount and when they change
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const expType = searchParams.get('type') || '';
    const electrode = searchParams.get('electrode') || '';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const minRate = searchParams.get('min_rate') || '';
    const maxRate = searchParams.get('max_rate') || '';
    
    // Set filter states from URL params
    setExperimentType(expType);
    setElectrodeMaterial(electrode);
    setScanRateMin(minRate);
    setScanRateMax(maxRate);
    
    if (from) {
      setDateFrom(new Date(from));
    }
    if (to) {
      setDateTo(new Date(to));
    }
    
    // Perform search if we have a query or any filters
    if (query || expType || electrode || from || to || minRate || maxRate) {
      performSearch();
    }
  }, [searchParams]);
  
  const performSearch = async () => {
    setIsLoading(true);
    
    try {
      // Build query string from search params
      const query = searchParams.get('q') || '';
      const expType = searchParams.get('type') || '';
      const electrode = searchParams.get('electrode') || '';
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      const minRate = searchParams.get('min_rate');
      const maxRate = searchParams.get('max_rate');
      
      let queryString = `query=${encodeURIComponent(query)}`;
      
      if (expType) {
        queryString += `&experiment_type=${encodeURIComponent(expType)}`;
      }
      if (electrode) {
        queryString += `&electrode_material=${encodeURIComponent(electrode)}`;
      }
      if (from) {
        queryString += `&date_from=${encodeURIComponent(from)}`;
      }
      if (to) {
        queryString += `&date_to=${encodeURIComponent(to)}`;
      }
      if (minRate) {
        queryString += `&scan_rate_min=${encodeURIComponent(minRate)}`;
      }
      if (maxRate) {
        queryString += `&scan_rate_max=${encodeURIComponent(maxRate)}`;
      }
      
      const response = await fetch(`/api/search-voltammetry/?${queryString}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data.results);
      setTotalResults(data.count);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: "Search failed",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsFilterOpen(false);
    }
  };
  
  const handleSearch = (query: string) => {
    // Update the search params, keeping existing filters
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', query);
    setSearchParams(newParams);
  };
  
  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    // Set or remove experiment type
    if (experimentType) {
      newParams.set('type', experimentType);
    } else {
      newParams.delete('type');
    }
    
    // Set or remove electrode material
    if (electrodeMaterial) {
      newParams.set('electrode', electrodeMaterial);
    } else {
      newParams.delete('electrode');
    }
    
    // Set or remove date range
    if (dateFrom) {
      newParams.set('from', dateFrom.toISOString().split('T')[0]);
    } else {
      newParams.delete('from');
    }
    
    if (dateTo) {
      newParams.set('to', dateTo.toISOString().split('T')[0]);
    } else {
      newParams.delete('to');
    }
    
    // Set or remove scan rate range
    if (scanRateMin) {
      newParams.set('min_rate', scanRateMin);
    } else {
      newParams.delete('min_rate');
    }
    
    if (scanRateMax) {
      newParams.set('max_rate', scanRateMax);
    } else {
      newParams.delete('max_rate');
    }
    
    setSearchParams(newParams);
  };
  
  const resetFilters = () => {
    // Keep only the query parameter
    const query = searchParams.get('q') || '';
    const newParams = new URLSearchParams();
    
    if (query) {
      newParams.set('q', query);
    }
    
    // Reset filter states
    setExperimentType('');
    setElectrodeMaterial('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setScanRateMin('');
    setScanRateMax('');
    
    setSearchParams(newParams);
  };
  
  const renderFilters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-medium">Experiment Type</h3>
        <Select value={experimentType} onValueChange={setExperimentType}>
          <SelectTrigger>
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any type</SelectItem>
            {experimentTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="mb-2 font-medium">Electrode Material</h3>
        <Input
          placeholder="E.g., Glassy Carbon"
          value={electrodeMaterial}
          onChange={(e) => setElectrodeMaterial(e.target.value)}
        />
      </div>
      
      <div>
        <h3 className="mb-2 font-medium">Date Range</h3>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PPP') : <span>From date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="mt-2 flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'PPP') : <span>To date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div>
        <h3 className="mb-2 font-medium">Scan Rate (mV/s)</h3>
        <div className="flex space-x-2">
          <Input
            placeholder="Min"
            type="number"
            value={scanRateMin}
            onChange={(e) => setScanRateMin(e.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={scanRateMax}
            onChange={(e) => setScanRateMax(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex space-x-2 pt-4">
        <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
        <Button onClick={resetFilters} variant="outline">Reset</Button>
      </div>
    </div>
  );
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Advanced Search</h1>
          <p className="text-muted-foreground">Search and filter experimental data</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Filters sidebar - Desktop */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search results</CardDescription>
            </CardHeader>
            <CardContent>
              {renderFilters()}
            </CardContent>
          </Card>
          
          {/* Main content */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search bar */}
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Search for experiments, materials, techniques..."
                />
              </div>
              
              {/* Mobile filter button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your search results</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    {renderFilters()}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Applied filters */}
            <div className="flex flex-wrap items-center gap-2">
              {searchParams.get('type') && (
                <Button variant="secondary" size="sm" onClick={() => {
                  setExperimentType('');
                  applyFilters();
                }}>
                  Type: {searchParams.get('type')} ✕
                </Button>
              )}
              {searchParams.get('electrode') && (
                <Button variant="secondary" size="sm" onClick={() => {
                  setElectrodeMaterial('');
                  applyFilters();
                }}>
                  Electrode: {searchParams.get('electrode')} ✕
                </Button>
              )}
              {searchParams.get('from') && (
                <Button variant="secondary" size="sm" onClick={() => {
                  setDateFrom(undefined);
                  applyFilters();
                }}>
                  From: {searchParams.get('from')} ✕
                </Button>
              )}
              {searchParams.get('to') && (
                <Button variant="secondary" size="sm" onClick={() => {
                  setDateTo(undefined);
                  applyFilters();
                }}>
                  To: {searchParams.get('to')} ✕
                </Button>
              )}
              {(searchParams.get('min_rate') || searchParams.get('max_rate')) && (
                <Button variant="secondary" size="sm" onClick={() => {
                  setScanRateMin('');
                  setScanRateMax('');
                  applyFilters();
                }}>
                  Scan Rate: {searchParams.get('min_rate') || '0'} - {searchParams.get('max_rate') || '∞'} ✕
                </Button>
              )}
              
              {/* Reset all filters button */}
              {(searchParams.get('type') || searchParams.get('electrode') || 
                searchParams.get('from') || searchParams.get('to') ||
                searchParams.get('min_rate') || searchParams.get('max_rate')) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset all
                </Button>
              )}
            </div>
            
            {/* Results */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {isLoading ? 'Searching...' : 
                  results.length > 0 ? `${totalResults} results found` : 'No results found'}
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-gray-100 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {results.map(result => (
                    <Card key={result.experiment_id}>
                      <CardHeader>
                        <CardTitle>{result.title}</CardTitle>
                        <CardDescription>
                          ID: {result.experiment_id} | Type: {result.experiment_type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {result.electrode_material && (
                            <div className="bg-secondary rounded-full px-3 py-1">
                              Electrode: {result.electrode_material}
                            </div>
                          )}
                          {result.scan_rate && (
                            <div className="bg-secondary rounded-full px-3 py-1">
                              Scan Rate: {result.scan_rate} mV/s
                            </div>
                          )}
                          <div className="bg-secondary rounded-full px-3 py-1">
                            Date: {new Date(result.date_created).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="mr-2">
                          <a href={`/voltammetry/${result.experiment_id}`}>View Details</a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href={`/download?dataset=${result.experiment_id}`}>Download</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : searchParams.toString() ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No results found</h3>
                    <p className="text-muted-foreground text-center mt-2">
                      Try adjusting your search terms or filters.
                    </p>
                    <Button variant="outline" onClick={resetFilters} className="mt-4">
                      Reset all filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">Start your search</h3>
                    <p className="text-muted-foreground text-center mt-2">
                      Use the search bar above to find experiments, or apply filters to browse the database.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdvancedSearch;
