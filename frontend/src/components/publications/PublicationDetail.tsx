
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Users, BookOpen } from "lucide-react";
import { DOIMetadata } from "@/services/doiService";

interface PublicationDetailProps {
  publication: any;
  isLoading?: boolean;
}

const PublicationDetail: React.FC<PublicationDetailProps> = ({ publication, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="animate-pulse bg-muted h-8 w-3/4 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-muted h-4 w-1/2 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-muted h-4 w-full rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!publication) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Publication Not Found</CardTitle>
          <CardDescription>
            The requested publication could not be found or data is incomplete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please check the DOI or try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{publication.title}</CardTitle>
            <CardDescription className="mt-2">
              Published in {publication.journal}, {publication.year}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {publication.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authors Section */}
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Users className="mr-2 h-5 w-5" /> Authors
          </h3>
          <div className="mt-2 space-y-2">
            {publication.authors.map((author, idx) => (
              <div key={idx} className="flex items-center">
                <span className={author.isMain ? "font-semibold" : ""}>
                  {author.name}
                </span>
                {author.isMain && (
                  <Badge className="ml-2" variant="secondary">
                    Main Author
                  </Badge>
                )}
                {author.affiliation && (
                  <span className="text-muted-foreground text-sm ml-2">
                    ({author.affiliation})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Abstract Section */}
        {publication.abstract && (
          <>
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Abstract
              </h3>
              <p className="mt-2 text-muted-foreground">{publication.abstract}</p>
            </div>
            <Separator />
          </>
        )}

        {/* Keywords/Subjects */}
        {publication.subjects && publication.subjects.length > 0 && (
          <>
            <div>
              <h3 className="text-lg font-semibold">Keywords</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {publication.subjects.map((subject, idx) => (
                  <Badge key={idx} variant="outline">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Publication Details */}
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <BookOpen className="mr-2 h-5 w-5" /> Publication Details
          </h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">DOI:</span> {publication.doi}
            </div>
            <div>
              <span className="font-medium">Publisher:</span> {publication.publisher}
            </div>
            <div>
              <span className="font-medium">Year:</span> {publication.year}
            </div>
            <div>
              <span className="font-medium">References:</span> {publication.referenceCount}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="outline" onClick={() => window.open(publication.url, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" /> View Original
          </Button>
          {publication.datasets && publication.datasets.length > 0 && (
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download Datasets
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicationDetail;
