
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/layouts/AppLayout";
import { BookOpen, FileText, Video } from "lucide-react";

const Documentation = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Documentation</h1>
          <p className="text-muted-foreground">
            Learn how to use the BiomediResearch platform and tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>Platform overview and basic usage guides</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Platform Overview</li>
                <li>Account Setup</li>
                <li>Navigation Guide</li>
                <li>Search Functionality</li>
                <li>Data Access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Technical Documentation
              </CardTitle>
              <CardDescription>Detailed technical guides and API references</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>API Reference</li>
                <li>Data Formats</li>
                <li>Integration Guides</li>
                <li>Tool Documentation</li>
                <li>Code Examples</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Video Tutorials
              </CardTitle>
              <CardDescription>Learn by watching step-by-step video guides</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Platform Introduction</li>
                <li>Data Analysis Workflows</li>
                <li>Visualization Techniques</li>
                <li>Advanced Search Functions</li>
                <li>Tool Usage Tutorials</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Documentation;
