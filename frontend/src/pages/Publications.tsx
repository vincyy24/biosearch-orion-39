
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import PlotlyVisualization from "@/components/visualizations/PlotlyVisualization";
import { fetchPublicationsData } from "@/services/api";
import PublicationCard from "@/components/publications/PublicationCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { searchPublicationsByDOI } from "@/services/doiService";

// Sample DOIs for testing
const SAMPLE_DOIS = [
  "10.1021/jacs.0c01924",
  "10.1038/s41586-020-2649-2",
  "10.1126/science.abc7520",
  "10.1002/anie.202003102",
  "10.1021/acscatal.0c01605"
];

interface Publication {
  id: number;
  title: string;
  author: string;
  year: number;
  citations: number;
}

const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [doiPublications, setDoiPublications] = useState<any[]>([]);
  const [loadingDoi, setLoadingDoi] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load placeholder data first
        const data = await fetchPublicationsData();
        setPublications(data);
        setLoading(false);
        
        // Now load real data from DOIs
        setLoadingDoi(true);
        const doiData = await searchPublicationsByDOI(SAMPLE_DOIS);
        setDoiPublications(doiData);
        setLoadingDoi(false);
      } catch (error) {
        console.error("Failed to load publications:", error);
        setLoading(false);
        setLoadingDoi(false);
      }
    };

    loadData();
  }, []);

  const filteredPublications = publications.filter(
    (pub) =>
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for Plotly visualization
  const plotlyData: Plotly.Data[] = [
    {
      x: publications.map(pub => pub.year),
      y: publications.map(pub => pub.citations),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 12,
        color: publications.map(pub => pub.citations),
        colorscale: 'Viridis',
        showscale: true
      },
      text: publications.map(pub => pub.title),
      hoverinfo: 'x+y+text'
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Publications</h1>
            <p className="text-muted-foreground">
              Browse and search through research publications
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search publications..."
                className="w-full md:w-[300px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="ml-2">Filter</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PlotlyVisualization
            title="Publication Citations by Year"
            description="Interactive visualization of research impact over time"
            data={plotlyData}
            layout={{
              title: 'Citations by Publication Year',
              xaxis: { title: 'Year' },
              yaxis: { title: 'Citations' }
            }}
          />

          <PlotlyVisualization
            title="Research Focus Areas"
            description="Distribution of publications across research domains"
            data={[
              {
                labels: ['Genomics', 'Clinical Research', 'Oncology', 'Neuroscience', 'Immunology'],
                values: [25, 18, 22, 15, 20],
                type: 'pie'
              }
            ]}
          />
        </div>

        {/* DOI Publications Grid */}
        <h2 className="text-2xl font-bold mb-4">Recent Publications with DOI</h2>
        {loadingDoi ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading publications from Crossref...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doiPublications.map((pub, index) => (
              <PublicationCard
                key={index}
                id={index.toString()}
                title={pub.title}
                authors={pub.authors.map(a => a.name).join(", ")}
                journal={pub.journal}
                year={pub.year}
                doi={pub.doi}
                isVerified={true}
                abstract={pub.abstract?.substring(0, 150) + (pub.abstract?.length > 150 ? "..." : "")}
                hasDataset={index % 3 === 0} // Just for demo purposes
              />
            ))}
            {doiPublications.length === 0 && !loadingDoi && (
              <div className="col-span-full text-center py-12 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">
                  No publications found from Crossref. Please try again later.
                </p>
              </div>
            )}
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Publication List</CardTitle>
            <CardDescription>
              Showing {filteredPublications.length} of {publications.length} publications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading publications...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-center">Year</TableHead>
                    <TableHead className="text-center">Citations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPublications.length > 0 ? (
                    filteredPublications.map((pub) => (
                      <TableRow key={pub.id}>
                        <TableCell className="font-medium">{pub.title}</TableCell>
                        <TableCell>{pub.author}</TableCell>
                        <TableCell className="text-center">{pub.year}</TableCell>
                        <TableCell className="text-center">{pub.citations}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No publications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Publications;
