import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { registerPublication, searchCrossRefByDOI, verifyDOI } from "@/services/publicationService";
import { CrossrefApiResponse, CrossrefPublicationItem } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Search } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  doi: z.string().min(1, "DOI is required"), // Ensure DOI is required
  title: z.string().min(1, "Title is required"),
  abstract: z.string().optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  year: z.coerce.number().optional(),
  publisher: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_public: z.boolean().default(false),
  is_peer_reviewed: z.boolean().default(false),
  researchers: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      institution: z.string().optional(),
      email: z.string().email("Invalid email").optional().or(z.literal("")),
      orcid_id: z.string().optional(),
    })
  ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PublicationRegistrationProps {
  onComplete?: () => void;
}

const PublicationRegistration: React.FC<PublicationRegistrationProps> = ({
  onComplete,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifyingDOI, setIsVerifyingDOI] = useState(false);
  const [doiVerificationResult, setDoiVerificationResult] = useState<CrossrefPublicationItem | null>(null);
  const [showDoiPreviewDialog, setShowDoiPreviewDialog] = useState(false);
  const [existingPublicationDoi, setExistingPublicationDoi] = useState("");
  const [showExistingPublicationDialog, setShowExistingPublicationDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doi: "",
      title: "",
      abstract: "",
      journal: "",
      volume: "",
      issue: "",
      pages: "",
      publisher: "",
      url: "",
      is_public: false,
      is_peer_reviewed: false,
      researchers: [{ name: "", institution: "", email: "", orcid_id: "" }],
    },
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await registerPublication(data);

      toast({
        title: "Publication registered",
        description: "Your publication has been successfully registered.",
      });

      if (onComplete) {
        onComplete();
      } else {
        navigate(`/publications/${response.doi.replace("/", "_")}`);
      }
    } catch (errorResponse) {
      const {error, exists, doi} = errorResponse.response.data;
      if (error.includes("already exists")) {
        const match = doi.match(/10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])[!-~])+/);
        if (match && match[0]) {
          setExistingPublicationDoi(match[0]);
          setShowExistingPublicationDialog(true);
        } else {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: error,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error,
        });
      }
    }
  };

  const handleDOIVerification = async () => {
    const doi = form.getValues("doi");
    if (!doi) {
      toast({
        variant: "destructive",
        title: "DOI Required",
        description: "Please enter a DOI to verify",
      });
      return;
    }

    setIsVerifyingDOI(true);
    try {
      const response: CrossrefApiResponse = await searchCrossRefByDOI(doi);

      if (response?.message?.items && response.message.items.length > 0) {
        const publication = response.message.items[0];
        setDoiVerificationResult(publication);
        setShowDoiPreviewDialog(true);
      } else {
        toast({
          variant: "destructive",
          title: "DOI Not Found",
          description: "The provided DOI could not be found in the CrossRef database.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
    } finally {
      setIsVerifyingDOI(false);
    }
  };

  const applyDoiData = () => {
    if (!doiVerificationResult) return;

    const publication = doiVerificationResult;

    const researchers = publication.author?.map(author => ({
      name: `${author.given} ${author.family}`,
      institution: author.affiliation && author.affiliation.length > 0 ? author.affiliation[0].name : "",
      email: "",
      orcid_id: author.ORCID ? author.ORCID.replace("http://orcid.org/", "") : "",
    })) || [];

    form.setValue("title", publication.title[0] || "");
    form.setValue("abstract", publication.abstract || "");
    form.setValue("journal", publication["container-title"]?.[0] || "");
    form.setValue("volume", publication.volume || "");
    form.setValue("issue", publication.issue || "");
    form.setValue("pages", publication.page || "");
    form.setValue("year", publication.published?.["date-parts"]?.[0]?.[0] || undefined);
    form.setValue("publisher", publication.publisher || "");
    form.setValue("url", publication.URL || "");
    form.setValue("researchers", researchers);

    setShowDoiPreviewDialog(false);

    toast({
      title: "Data Applied",
      description: "Publication data has been filled in from CrossRef.",
    });
  };

  const addResearcher = () => {
    const researchers = form.getValues("researchers") || [];
    form.setValue("researchers", [
      ...researchers,
      { name: "", institution: "", email: "", orcid_id: "" },
    ]);
  };

  const removeResearcher = (index: number) => {
    const researchers = form.getValues("researchers") || [];
    if (researchers.length > 1) {
      researchers.splice(index, 1);
      form.setValue("researchers", [...researchers]);
    }
  };

  console.log(doiVerificationResult);
  

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="doi"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>DOI</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10.xxxx/xxxxx"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the Digital Object Identifier for your publication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDOIVerification}
                  disabled={isVerifyingDOI || isSubmitting}
                  className=""
                >
                  {isVerifyingDOI ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Verify DOI
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Publication title"
                          {...field}
                          disabled={isSubmitting || Boolean(doiVerificationResult)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Publication abstract"
                          {...field}
                          disabled={isSubmitting || Boolean(doiVerificationResult)}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="journal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Journal</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Journal name"
                            {...field}
                            disabled={isSubmitting || Boolean(doiVerificationResult)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publisher</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Publisher name"
                            {...field}
                            disabled={isSubmitting || Boolean(doiVerificationResult)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Vol."
                            {...field}
                            disabled={isSubmitting || Boolean(doiVerificationResult)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Issue"
                            {...field}
                            disabled={isSubmitting || Boolean(doiVerificationResult)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pages</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 123-145"
                            {...field}
                            disabled={isSubmitting || Boolean(doiVerificationResult)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Year"
                            {...field}
                            disabled={isSubmitting || Boolean(doiVerificationResult)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/publication"
                          {...field}
                          disabled={isSubmitting || Boolean(doiVerificationResult)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Researchers</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResearcher}
                  disabled={isSubmitting}
                >
                  Add Researcher
                </Button>
              </div>

              <div className="space-y-6">
                {form.watch("researchers")?.map((_, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Researcher {index + 1}
                        {index === 0 && " (Primary)"}
                      </h4>
                      {/* {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResearcher(index)}
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      )} */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`researchers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Full name"
                                {...field}
                                disabled={isSubmitting || (Boolean(doiVerificationResult) && index < (doiVerificationResult.author?.length || 0))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`researchers.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Institution name"
                                {...field}
                                disabled={isSubmitting || (Boolean(doiVerificationResult) && index < (doiVerificationResult.author?.length || 0))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`researchers.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`researchers.${index}.orcid_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ORCID ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0000-0000-0000-0000"
                                {...field}
                                disabled={isSubmitting || (Boolean(doiVerificationResult) && index < (doiVerificationResult.author?.length || 0))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Settings</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public</FormLabel>
                        <FormDescription>
                          Make this publication visible to all users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_peer_reviewed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Peer Reviewed</FormLabel>
                        <FormDescription>
                          Indicate that this publication has undergone peer review
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Publication"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showDoiPreviewDialog} onOpenChange={setShowDoiPreviewDialog}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Publication Data from CrossRef</AlertDialogTitle>
            <AlertDialogDescription>
              The following information was found for DOI: {form.getValues("doi")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {doiVerificationResult && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="authors">Authors</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Title</h4>
                  <p>{doiVerificationResult.title[0]}</p>
                </div>

                {doiVerificationResult.abstract && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Abstract</h4>
                    <p className="text-sm">{doiVerificationResult.abstract}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Journal</h4>
                    <p>{doiVerificationResult["container-title"]?.[0] || "N/A"}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Publisher</h4>
                    <p>{doiVerificationResult.publisher || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Volume</h4>
                    <p>{doiVerificationResult.volume || "N/A"}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Issue</h4>
                    <p>{doiVerificationResult.issue || "N/A"}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Pages</h4>
                    <p>{doiVerificationResult.page || "N/A"}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Year</h4>
                    <p>{doiVerificationResult.published?.["date-parts"]?.[0]?.[0] || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">URL</h4>
                  <p>
                    <a href={doiVerificationResult.URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {doiVerificationResult.URL}
                    </a>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="authors" className="space-y-4 py-4">
                {doiVerificationResult.author?.map((author, i) => (
                  <div key={i} className="p-3 border rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Name</h4>
                        <p>{author.given} {author.family}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Sequence</h4>
                        <p>{author.sequence === "first" ? "Primary" : author.sequence}</p>
                      </div>
                    </div>

                    {author.affiliation && author.affiliation.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <h4 className="font-semibold text-sm">Affiliation</h4>
                        <p>{author.affiliation.map(aff => aff.name).join(", ")}</p>
                      </div>
                    )}

                    {author.ORCID && (
                      <div className="mt-2 space-y-2">
                        <h4 className="font-semibold text-sm">ORCID</h4>
                        <p>
                          <a href={author.ORCID} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {author.ORCID.replace("http://orcid.org/", "")}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )) || <p>No author information available</p>}
              </TabsContent>

              <TabsContent value="additional" className="space-y-4 py-4">
                {doiVerificationResult.funder && doiVerificationResult.funder.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Funders</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {doiVerificationResult.funder.map((funder, i) => (
                        <li key={i}>
                          {funder.name}
                          {funder.award && funder.award.length > 0 && (
                            <span className="text-sm text-muted-foreground ml-1">
                              (Award: {funder.award.join(", ")})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doiVerificationResult.link && doiVerificationResult.link.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Additional Links</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {doiVerificationResult.link.map((link, i) => (
                        <li key={i}>
                          <a href={link.URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {link["content-type"]} ({link["intended-application"]})
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">References Count</h4>
                    <p>{doiVerificationResult["references-count"] || "N/A"}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Cited By Count</h4>
                    <p>{doiVerificationResult["is-referenced-by-count"] || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Type</h4>
                  <p>{doiVerificationResult.type}</p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyDoiData}>Use This Data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExistingPublicationDialog} onOpenChange={setShowExistingPublicationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publication Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              A publication with DOI <span className="font-medium">{existingPublicationDoi}</span> is already registered in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can view the existing publication or try registering a different one.
              </AlertDescription>
            </Alert>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowExistingPublicationDialog(false);
              navigate(`/publications/${existingPublicationDoi.replace("/", "_")}`);
            }}>
              View Publication
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublicationRegistration;
