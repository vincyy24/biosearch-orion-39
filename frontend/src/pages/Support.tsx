
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";

const Support = () => {
  const faqs = [
    {
      question: "How do I access the genomic databases?",
      answer: "You can access our genomic databases through the Data Browser page. Navigate there through the sidebar menu, then use the search and filter functions to find specific datasets. You may need to register or log in for accessing certain premium datasets."
    },
    {
      question: "What file formats are supported for data upload?",
      answer: "Our platform supports common bioinformatics file formats including FASTA, FASTQ, VCF, BAM, SAM, BED, and GTF. For detailed specifications about size limits and additional formats, please refer to the Documentation section."
    },
    {
      question: "How can I cite data or tools from this platform?",
      answer: "Every dataset and tool has a 'Citation Information' button that provides the correct format for citation in various academic styles (APA, MLA, Chicago, etc.). We also provide DOIs for permanent reference."
    },
    {
      question: "Is there an API available for programmatic access?",
      answer: "Yes, we provide a comprehensive REST API that allows programmatic access to most of our data and tools. Visit the API Documentation page for details on endpoints, authentication, rate limits, and code examples in Python, R, and JavaScript."
    },
    {
      question: "How do I collaborate with other researchers on the platform?",
      answer: "You can create or join research groups through the Community section. Groups provide shared workspaces, collaborative tools, and private communication channels. You can also directly share datasets or analysis results with colleagues using the 'Share' function."
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Get assistance with using the platform and find answers to your questions
          </p>
        </div>

        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Find answers to common questions about the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Contact our support team.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>Reach out to our technical support team for assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" type="email" placeholder="Your email address" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input id="subject" placeholder="Brief description of your issue" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea id="message" placeholder="Detailed description of your issue or question" rows={5} />
                  </div>
                  <Button type="submit">Submit Request</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Support
                  </CardTitle>
                  <CardDescription>Get help via email</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Our support team typically responds within 24 hours on business days.</p>
                  <p className="text-sm font-medium">Email address:</p>
                  <p className="text-sm">support@biomediresearch.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Phone Support
                  </CardTitle>
                  <CardDescription>Talk to a support specialist</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Available Monday through Friday, 9 AM to 5 PM EST.</p>
                  <p className="text-sm font-medium">Phone number:</p>
                  <p className="text-sm">+1 (800) 555-1234</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Live Chat
                  </CardTitle>
                  <CardDescription>Get real-time assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Available for premium members during business hours.</p>
                  <Button className="w-full">Start Chat</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Support;
