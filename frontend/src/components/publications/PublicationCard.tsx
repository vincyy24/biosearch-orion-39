import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Eye, Download, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useToast } from "@/hooks/use-toast";
import { Publication } from "@/types/common";

interface PublicationCardProps {
  publication: Publication;
  onView: () => void
}

const PublicationCard = ({
  publication: {
    id,
    title,
    researchers,
    journal,
    year,
    doi,
    abstract
  },
  onView
}: PublicationCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const { incrementSavedItems } = useAnalytics();
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      incrementSavedItems();
      toast({
        title: "Publication saved",
        description: "Added to your research library",
      });
    } else {
      toast({
        title: "Publication removed",
        description: "Removed from your research library",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          {doi && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800">
              <Check className="h-3 w-3" /> DOI Verified
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-1">
          {researchers?.map(({ name }) => name)} • {journal} • {year}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {abstract && <p className="text-sm text-muted-foreground line-clamp-3">{abstract}</p>}
        <div className="mt-4 text-xs">
          <span className="font-semibold">DOI:</span> {doi}
        </div>
        {/* {hasDataset && (
          <Badge variant="secondary" className="mt-2">
            Has Datasets
          </Badge>
        )} */}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onView()}>
            <ExternalLink className="h-4 w-4 mr-1" /> View
          </Button>
          {/* {hasDataset && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Data
            </Button>
          )} */}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={isSaved ? "text-primary" : ""}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PublicationCard;
