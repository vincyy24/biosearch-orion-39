import { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Search,
  Wrench,
  BarChart,
  Database,
  GitMerge,
  Share2,
  ExternalLink,
  ThumbsUp,
  Server,
  Cpu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample tools data
const toolsData = [
  {
    id: "tool1",
    name: "GenomeMapper",
    description: "Fast and accurate genome alignment tool for next-generation sequencing data",
    category: "sequence-analysis",
    tags: ["NGS", "alignment", "mapping"],
    popularity: 4.8,
    lastUpdated: "2023-08-15",
    icon: GitMerge,
  },
  {
    id: "tool2",
    name: "ProteinVisualizer",
    description: "Interactive 3D visualization tool for protein structures and molecular dynamics",
    category: "visualization",
    tags: ["protein", "3D", "structure"],
    popularity: 4.5,
    lastUpdated: "2023-09-22",
    icon: Share2,
  },
  {
    id: "tool3",
    name: "TranscriptomeAnalyzer",
    description: "Comprehensive RNA-Seq analysis pipeline for differential expression and pathway analysis",
    category: "transcriptomics",
    tags: ["RNA-Seq", "differential expression", "pathway"],
    popularity: 4.7,
    lastUpdated: "2023-10-05",
    icon: BarChart,
  },
  {
    id: "tool4",
    name: "PhyloTree",
    description: "Phylogenetic tree construction and visualization from multiple sequence alignments",
    category: "phylogenetics",
    tags: ["phylogeny", "evolution", "tree"],
    popularity: 4.3,
    lastUpdated: "2023-07-12",
    icon: GitMerge,
  },
  {
    id: "tool5",
    name: "MetaGenomeExplorer",
    description: "Metagenomic analysis toolkit for taxonomic profiling and functional annotation",
    category: "metagenomics",
    tags: ["metagenomics", "taxonomy", "microbiome"],
    popularity: 4.6,
    lastUpdated: "2023-11-01",
    icon: Database,
  },
  {
    id: "tool6",
    name: "EpigenomeAnalyzer",
    description: "Comprehensive toolkit for analyzing ChIP-seq, ATAC-seq, and methylation data",
    category: "epigenomics",
    tags: ["ChIP-seq", "ATAC-seq", "methylation"],
    popularity: 4.4,
    lastUpdated: "2023-09-18",
    icon: Server,
  },
  {
    id: "tool7",
    name: "GenomeEditor",
    description: "CRISPR design and analysis tool for gene editing applications",
    category: "crispr",
    tags: ["CRISPR", "gene editing", "guide RNA"],
    popularity: 4.9,
    lastUpdated: "2023-10-20",
    icon: Cpu,
  },
  {
    id: "tool8",
    name: "VarSeq",
    description: "Variant calling and annotation pipeline for whole genome and exome sequencing",
    category: "variant-analysis",
    tags: ["variant calling", "annotation", "genomics"],
    popularity: 4.7,
    lastUpdated: "2023-11-10",
    icon: Database,
  },
];

// Tool categories
const categories = [
  { id: "all", name: "All Tools" },
  { id: "sequence-analysis", name: "Sequence Analysis" },
  { id: "visualization", name: "Visualization" },
  { id: "transcriptomics", name: "Transcriptomics" },
  { id: "phylogenetics", name: "Phylogenetics" },
  { id: "metagenomics", name: "Metagenomics" },
  { id: "epigenomics", name: "Epigenomics" },
  { id: "crispr", name: "CRISPR Tools" },
  { id: "variant-analysis", name: "Variant Analysis" },
];

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search executed",
      description: `Searching for tools: ${searchQuery}`,
    });
  };

  const handleLaunchTool = (toolName: string) => {
    toast({
      title: "Tool launching",
      description: `Launching ${toolName}...`,
    });
  };

  // Filter tools based on search and category
  const filteredTools = toolsData.filter(tool => {
    const matchesSearch = searchQuery === "" ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Computational Tools</h1>
            <p className="text-muted-foreground">
              Discover and use specialized tools for biomedical and genomic research
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for tools by name, description, or functionality..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="mb-6 flex flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              {filteredTools.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground">No tools found matching your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTools.map((tool) => (
                    <Card key={tool.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start mb-4">
                          <div className="bg-primary/10 p-3 rounded-lg mr-4">
                            <tool.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{tool.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <ThumbsUp className="mr-1 h-3 w-3" />
                              {tool.popularity} • Updated {tool.lastUpdated}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {tool.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="bg-muted/30 px-6 py-3 flex justify-between">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-3 w-3" /> Documentation
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleLaunchTool(tool.name)}
                        >
                          <Wrench className="mr-2 h-3 w-3" /> Launch
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="bg-muted/30 p-8 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">Interactive Tool Integrations</h2>
          <p className="mb-6 text-muted-foreground">
            This section will host interactive tools that can be used directly in the platform.
            These integrations allow researchers to perform analyses without leaving the platform.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
              <div className="mb-4 flex justify-center">
                <Cpu className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Genome Browser</h3>
              <p className="text-muted-foreground mb-4">
                IGV.js integration for visualizing genomic data directly in the browser.
              </p>
              <Button variant="outline">Coming Soon</Button>
            </div>

            <div className="border border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
              <div className="mb-4 flex justify-center">
                <BarChart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Expression Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Interactive analysis and visualization of gene expression data.
              </p>
              <Button variant="outline">Coming Soon</Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Tools;
