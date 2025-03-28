
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, FileDown } from "lucide-react";
import PublicationDetail from "@/components/publications/PublicationDetail";
import { verifyDOI, formatDOIMetadata } from "@/services/doiService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PublicationDetailPage = () => {
  const { doi } = useParams();
  const [publication, setPublication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicationData = async () => {
      if (!doi) {
        setError("No DOI specified");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const doiMetadata = await verifyDOI(doi);
        
        if (!doiMetadata) {
          setError("Could not find publication with the specified DOI");
          setPublication(null);
        } else {
          const formattedMetadata = formatDOIMetadata(doiMetadata);
          setPublication(formattedMetadata);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching publication:", err);
        setError("An error occurred while fetching the publication data");
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicationData();
  }, [doi]);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/publications" className="inline-flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Publications
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading publication details...</span>
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please check the DOI and try again. If the problem persists, the publication may not be available.</p>
              <Button asChild className="mt-4">
                <Link to="/publications">Return to Publications</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <PublicationDetail publication={publication} />

            <Tabs defaultValue="datasets" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="datasets">Datasets</TabsTrigger>
                <TabsTrigger value="citations">Citations</TabsTrigger>
                <TabsTrigger value="researchers">Researchers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="datasets" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Associated Datasets</CardTitle>
                    <CardDescription>
                      Data related to this publication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileDown className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No datasets available for this publication yet</p>
                      <Button variant="outline" className="mt-4">
                        Upload dataset for this publication
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="citations" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Citation Information</CardTitle>
                    <CardDescription>
                      Citation details and metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Cite this publication</h3>
                        <div className="bg-muted p-3 rounded-md text-sm">
                          {publication?.authors.map(a => a.name).join(", ")} ({publication?.year}). {publication?.title}. <i>{publication?.journal}</i>. DOI: {publication?.doi}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Citation Metrics</h3>
                        <p className="text-muted-foreground">
                          Citation metrics are currently unavailable for this publication.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="researchers" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Researchers</CardTitle>
                    <CardDescription>
                      Researchers involved in this publication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {publication?.authors.map((author, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 border rounded-md">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium">{author.name}</h3>
                            {author.isMain && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Main Author
                              </span>
                            )}
                            {author.affiliation && (
                              <p className="text-sm text-muted-foreground mt-1">{author.affiliation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PublicationDetailPage;
