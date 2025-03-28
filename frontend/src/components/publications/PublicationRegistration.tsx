
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyDOI } from "@/services/doiService";

const publicationSchema = z.object({
  doi: z.string().min(1, { message: "DOI is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  journal: z.string().min(1, { message: "Journal name is required" }),
  year: z.string().regex(/^\d{4}$/, { message: "Year must be a 4-digit number" }),
  abstract: z.string().optional(),
  isPublic: z.boolean().default(false),
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

  const form = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      doi: "",
      title: "",
      journal: "",
      year: new Date().getFullYear().toString(),
      abstract: "",
      isPublic: true,
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
      form.setValue("title", doiData.title || "");
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

  const onSubmit = async (data: PublicationFormValues) => {
    setIsSubmitting(true);
    try {
      // This would typically be an API call to register the publication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    } catch (error) {
      console.error("Error registering publication:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "There was an error registering your publication.",
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="doi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOI (Digital Object Identifier)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g., 10.1038/s41586-020-2649-2"
                          {...field}
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleVerifyDOI}
                        disabled={isVerifying || !field.value}
                      >
                        {isVerifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                    <FormDescription>
                      Enter the DOI to automatically fetch publication details
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {verificationSuccess && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    DOI verification successful. Publication details have been filled automatically.
                  </AlertDescription>
                </Alert>
              )}

              {verificationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
              )}

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
                    <FormLabel>Abstract</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the publication abstract"
                        rows={4}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
      </CardContent>
    </Card>
  );
};

export default PublicationRegistration;
