
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Database, FileText, Wrench, BarChart4 } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import FeatureCard from "@/components/FeatureCard";
import StatCard from "@/components/StatCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else {
      toast({
        title: "Empty search",
        description: "Please enter a search term",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-background to-primary/5 py-20 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
              Advancing Biomedical Research
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              Access a comprehensive platform for genomic data, scientific publications, 
              and computational tools to accelerate your research.
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col w-full max-w-lg gap-2 mb-8">
              <div className="flex w-full gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search genes, publications, tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {/* Filter options would go here */}
                  <select className="rounded border p-2 bg-background">
                    <option>All Categories</option>
                    <option>Genes</option>
                    <option>Proteins</option>
                    <option>Publications</option>
                  </select>
                  
                  <select className="rounded border p-2 bg-background">
                    <option>All Years</option>
                    <option>2023</option>
                    <option>2022</option>
                    <option>2021</option>
                  </select>
                  
                  <select className="rounded border p-2 bg-background">
                    <option>All Sources</option>
                    <option>Internal Database</option>
                    <option>External References</option>
                  </select>
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-primary self-start mt-1"
              >
                {showFilters ? "Hide advanced filters" : "Show advanced filters"}
              </button>
            </form>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="default" size="lg" onClick={() => navigate('/data-browser')}>
                Explore Data
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/documentation')}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Database className="h-10 w-10" />}
              title="Genomic Databases"
              description="Access comprehensive genomic and proteomic databases from leading research institutions."
              link="/data-browser"
            />
            
            <FeatureCard 
              icon={<FileText className="h-10 w-10" />}
              title="Scientific Publications"
              description="Browse and search the latest research papers and publications in the field."
              link="/publications"
            />
            
            <FeatureCard 
              icon={<Wrench className="h-10 w-10" />}
              title="Computational Tools"
              description="Utilize powerful analytical tools for data processing and visualization."
              link="/tools"
            />
            
            <FeatureCard 
              icon={<BarChart4 className="h-10 w-10" />}
              title="Personalized Dashboard"
              description="Track your research, save favorites, and get customized recommendations."
              link="/dashboard"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Platform Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              value="150M+"
              label="Genomic Records"
              description="Comprehensive genomic data from multiple sources"
            />
            
            <StatCard 
              value="2.5M+"
              label="Publications"
              description="Scientific papers and research articles"
            />
            
            <StatCard 
              value="50+"
              label="Analysis Tools"
              description="Specialized computational and analytical tools"
            />
            
            <StatCard 
              value="10K+"
              label="Researchers"
              description="Active scientists and researchers using our platform"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Accelerate Your Research?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of researchers who are advancing scientific discovery using our platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg">
              Sign Up Now
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              Request Demo
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
