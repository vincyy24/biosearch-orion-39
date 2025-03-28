
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Check, Info, Plus, Trash } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DOIVerification from "./DOIVerification";
import { verifyDOI } from "@/services/doiService";
import axios from "axios";
import { Badge } from "../ui/badge";
import MainLayout from "../layouts/AppLayout";

const publicationSchema = z.object({
  doi: z.string().min(1, { message: "DOI is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  journal: z.string().min(1, { message: "Journal name is required" }),
  year: z.string().regex(/^\d{4}$/, { message: "Year must be a 4-digit number" }),
  abstract: z.string().optional(),
  isPublic: z.boolean().default(false),
  researchers: z.array(
    z.object({
      name: z.string().min(1, { message: "Name is required" }),
      institution: z.string().optional(),
      email: z.string().email({ message: "Invalid email" }).optional(),
      orcid_id: z.string().optional(),
      is_primary: z.boolean().default(false),
    })
  ).min(1, { message: "At least one researcher is required" }),
});

type PublicationFormValues = z.infer<typeof publicationSchema>;

interface PublicationRegistrationProps {
  onComplete?: () => void;
}

const PublicationRegistration = ({ onComplete }: PublicationRegistrationProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [doiVerified, setDoiVerified] = useState(false);
  const [doiAlreadyExists, setDoiAlreadyExists] = useState(false);

  const form = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      doi: "",
      title: "",
      journal: "",
      year: new Date().getFullYear().toString(),
      abstract: "",
      isPublic: true,
      researchers: [
        {
          name: "",
          institution: "",
          email: "",
          orcid_id: "",
          is_primary: true,
        }
      ],
    },
  });

  const handleVerifyDOI = async () => {
    const doi = form.getValues("doi");
    
    if (!doi) {
      form.setError("doi", { message: "Please enter a DOI to verify" });
      return;
    }
    
    setIsVerifying(true);
    setVerificationSuccess(false);
    setVerificationError(null);
    
    try {
      const doiData = await verifyDOI(doi);
      
      if (!doiData) {
        setVerificationError("DOI not found or invalid. Please check and try again.");
        return;
      }
      
      // Success - populate form with DOI data
      form.setValue("title", doiData.title[0] || "");
      form.setValue("journal", doiData.journal || doiData.publisher || "");
      form.setValue("year", doiData.year || new Date().getFullYear().toString());
      form.setValue("abstract", doiData.abstract || "");
      
      setVerificationSuccess(true);
      
      toast({
        title: "DOI Verification Successful",
        description: "Publication details have been populated from the DOI data.",
      });
    } catch (error) {
      console.error("Error verifying DOI:", error);
      setVerificationError("Error verifying DOI. Please try again or enter details manually.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDoiVerified = (metadata: any) => {
    // Update the form with the verified metadata
    form.setValue("doi", metadata.doi);
    form.setValue("title", metadata.title);
    form.setValue("journal", metadata.journal);
    form.setValue("year", metadata.year.toString());
    form.setValue("abstract", metadata.abstract || "");
    
    // Update researchers if available
    if (metadata.authors && metadata.authors.length > 0) {
      const researchers = metadata.authors.map((author: any, index: number) => ({
        name: author.name,
        institution: author.affiliation || "",
        email: "",
        orcid_id: author.ORCID || "",
        is_primary: author.isMain || index === 0,
      }));
      
      form.setValue("researchers", researchers);
    }
    
    setDoiVerified(true);
    
    toast({
      title: "DOI Verification Successful",
      description: "Publication details have been populated from Crossref data.",
    });
  };

  const handleDoiAlreadyExists = (doi: string, metadata: any) => {
    setDoiAlreadyExists(true);
  };

  const handleAddResearcher = () => {
    const currentResearchers = form.getValues("researchers") || [];
    form.setValue("researchers", [
      ...currentResearchers,
      {
        name: "",
        institution: "",
        email: "",
        orcid_id: "",
        is_primary: false,
      }
    ]);
  };

  const handleRemoveResearcher = (index: number) => {
    const currentResearchers = form.getValues("researchers");
    if (currentResearchers.length <= 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one researcher is required",
      });
      return;
    }

    // Check if removing primary researcher
    const isRemovingPrimary = currentResearchers[index].is_primary;
    
    // Remove the researcher
    const updatedResearchers = currentResearchers.filter((_, i) => i !== index);
    
    // If removing the primary researcher, make the first one primary
    if (isRemovingPrimary && updatedResearchers.length > 0) {
      updatedResearchers[0].is_primary = true;
    }
    
    form.setValue("researchers", updatedResearchers);
  };

  const handleSetPrimary = (index: number) => {
    const currentResearchers = form.getValues("researchers");
    
    // Update all researchers to non-primary first
    const updatedResearchers = currentResearchers.map((researcher, i) => ({
      ...researcher,
      is_primary: i === index,
    }));
    
    form.setValue("researchers", updatedResearchers);
  };

  const onSubmit = async (data: PublicationFormValues) => {
    setIsSubmitting(true);
    try {
      // API call to register the publication
      const response = await axios.post("/api/publications/register/", {
        doi: data.doi,
        title: data.title,
        abstract: data.abstract || "",
        journal: data.journal,
        volume: "",
        issue: "",
        pages: "",
        year: parseInt(data.year),
        publisher: "",
        url: `https://doi.org/${data.doi}`,
        is_public: data.isPublic,
        is_peer_reviewed: true,
        researchers: data.researchers,
      });
      
      toast({
        title: "Publication Registered",
        description: "Your publication has been successfully registered.",
      });
      
      if (onComplete) {
        onComplete();
      } else {
        // Navigate to the publication page
        navigate(`/publications/${data.doi}`);
      }
    } catch (error: any) {
      console.error("Error registering publication:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.response?.data?.error || "There was an error registering your publication.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Register Publication</CardTitle>
          <CardDescription>
            Register your publication to associate datasets and track research impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doiAlreadyExists ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A publication with this DOI already exists in our system. Please use the existing publication.
              </AlertDescription>
            </Alert>
          ) : doiVerified ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="doi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DOI (Digital Object Identifier)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 10.1038/s41586-020-2649-2"
                            {...field}
                            readOnly={doiVerified}
                            className={doiVerified ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter the full title of your publication"
                            {...field}
                            readOnly={doiVerified}
                            className={doiVerified ? "bg-muted" : ""}
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
                          <FormLabel>Journal or Publisher</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Journal or publisher name"
                              {...field}
                              readOnly={doiVerified}
                              className={doiVerified ? "bg-muted" : ""}
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
                          <FormLabel>Publication Year</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="YYYY"
                              {...field}
                              readOnly={doiVerified}
                              className={doiVerified ? "bg-muted" : ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="abstract"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Abstract
                          {doiVerified && !field.value && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-4 px-0 ml-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">
                                    Abstract data is missing from Crossref. You can add it manually
                                    or contact support for assistance.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the publication abstract"
                            rows={4}
                            {...field}
                            value={field.value || ""}
                            readOnly={doiVerified && !!field.value}
                            className={doiVerified && field.value ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Researchers</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddResearcher}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Researcher
                      </Button>
                    </div>
                    {form.watch("researchers")?.map((_, index) => (
                      <div key={index} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            Researcher {index + 1}
                            {form.watch(`researchers.${index}.is_primary`) && (
                              <Badge className="ml-2" variant="secondary">Primary</Badge>
                            )}
                          </h4>
                          <div className="flex items-center gap-2">
                            {!form.watch(`researchers.${index}.is_primary`) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPrimary(index)}
                              >
                                Set as Primary
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveResearcher(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
      
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`researchers.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full name" {...field} />
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
                                  <Input placeholder="Institution/Organization" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
      
                          <FormField
                            control={form.control}
                            name={`researchers.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Email address" type="email" {...field} />
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
                                  <Input placeholder="ORCID identifier" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Public Visibility</FormLabel>
                          <FormDescription>
                            Make this publication visible to other researchers on the platform
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Publication"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <DOIVerification
              onVerified={handleDoiVerified}
              onDOIAlreadyExists={handleDoiAlreadyExists}
            />
          )}
        </CardContent>
      </Card>
  );
};

export default PublicationRegistration;
