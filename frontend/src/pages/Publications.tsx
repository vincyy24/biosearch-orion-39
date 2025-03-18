
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import PlotlyVisualization from "@/components/visualizations/PlotlyVisualization";
import { fetchPublicationsData } from "@/services/api";

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPublicationsData();
        setPublications(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load publications:", error);
        setLoading(false);
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
  const plotlyData = [
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
      hoverinfo: 'text+x+y'
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
