
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, FileText } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyDOI } from "@/services/doiService";
import { useToast } from "@/hooks/use-toast";

const publicationSchema = z.object({
  doi: z.string().min(6, { message: "DOI must be at least 6 characters" }),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type PublicationFormValues = z.infer<typeof publicationSchema>;

const PublicationRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [doiVerified, setDoiVerified] = useState(false);
  const [publicationData, setPublicationData] = useState<any>(null);

  const form = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      doi: "",
      description: "",
      isPublic: false,
    },
  });

  const onSubmit = async (data: PublicationFormValues) => {
    if (!doiVerified) {
      toast({
        variant: "destructive",
        title: "DOI Not Verified",
        description: "Please verify the DOI before registering the publication.",
      });
      return;
    }

    try {
      // Here we would typically register the publication with an API
      // For now, show a success message and redirect
      toast({
        title: "Publication Registered",
        description: "Your publication has been successfully registered.",
      });
      
      // Redirect to the new publication page
      navigate(`/publications/${encodeURIComponent(data.doi)}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "There was an error registering your publication.",
      });
    }
  };

  const handleVerifyDOI = async () => {
    const doi = form.getValues("doi");
    if (!doi) {
      form.setError("doi", { message: "Please enter a DOI to verify" });
      return;
    }

    setIsVerifying(true);
    try {
      const doiMetadata = await verifyDOI(doi);
      if (doiMetadata) {
        setDoiVerified(true);
        setPublicationData(doiMetadata);
        toast({
          title: "DOI Verified",
          description: `Found publication: ${doiMetadata.title?.[0] || 'Unknown Title'}`,
        });
      } else {
        setDoiVerified(false);
        toast({
          variant: "destructive",
          title: "Invalid DOI",
          description: "Could not verify this DOI. Please check and try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "There was an error verifying the DOI.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Register Publication</CardTitle>
        <CardDescription>
          Register a publication by its DOI to link your research data
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
                    <FormLabel>Publication DOI</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter DOI (e.g., 10.1000/xyz123)"
                          {...field}
                          disabled={doiVerified}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant={doiVerified ? "secondary" : "outline"}
                        onClick={handleVerifyDOI}
                        disabled={isVerifying || doiVerified}
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying
                          </>
                        ) : doiVerified ? (
                          "Verified ✓"
                        ) : (
                          "Verify DOI"
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {publicationData && (
                <div className="border p-4 rounded-md bg-muted/30">
                  <h3 className="font-semibold text-lg mb-2">Publication Details</h3>
                  <p className="font-medium">{publicationData.title?.[0] || 'Unknown Title'}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {publicationData.author?.map(a => `${a.given} ${a.family}`).join(', ') || 'Unknown Authors'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {publicationData['container-title']?.[0] || 'Unknown Journal'}, 
                    {publicationData.issued?.['date-parts']?.[0]?.[0] || 'Unknown Year'}
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this publication"
                        {...field}
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
                      <p className="text-sm text-muted-foreground">
                        Make this publication visible to other researchers
                      </p>
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

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!doiVerified || form.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                {form.formState.isSubmitting ? (
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
      </CardContent>
    </Card>
  );
};

export default PublicationRegistration;
