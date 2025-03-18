
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Share, BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const VoltammetryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plotType, setPlotType] = useState("potential-current");
  const [scanRate, setScanRate] = useState("100");
  const [normalize, setNormalize] = useState("no");
  const [technique, setTechnique] = useState("cyclic");

  // This would be fetched from an API in a real application
  const experimentData = {
    id: id || "exp-123",
    title: "Cyclic Voltammetry Analysis of Redox-Active Compounds",
    description: "Investigation of electrochemical properties of novel redox-active materials for energy storage applications.",
    date: "2023-09-15",
    technique: "Cyclic Voltammetry",
    scanRate: "100 mV/s",
    electrodes: "Glassy Carbon (working), Pt wire (counter), Ag/AgCl (reference)",
    electrolyte: "0.1 M TBAPF6 in acetonitrile",
    temperature: "25°C",
    author: "Dr. Emily Chen",
    institution: "BiomediResearch Institute",
    relatedPublications: [
      {
        id: "pub-456",
        title: "Novel Redox Materials for Energy Storage",
        journal: "Journal of Electrochemical Energy",
        year: 2023
      }
    ]
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/data-browser">Data Browser</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Voltammetry</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{experimentData.id}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{experimentData.title}</h1>
            <p className="text-muted-foreground mt-2">{experimentData.description}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Download Data
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share className="h-4 w-4" /> Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" /> View Publication
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Voltammetry Visualization</CardTitle>
                <CardDescription>
                  Interactive visualization of voltammetry data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium mb-1">Technique</label>
                      <Select value={technique} onValueChange={setTechnique}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select technique" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cyclic">Cyclic Voltammetry</SelectItem>
                          <SelectItem value="differential_pulse">Differential Pulse</SelectItem>
                          <SelectItem value="square_wave">Square Wave</SelectItem>
                          <SelectItem value="linear_sweep">Linear Sweep</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium mb-1">Plot Type</label>
                      <Select value={plotType} onValueChange={setPlotType}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select plot type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="potential-current">Potential vs. Current</SelectItem>
                          <SelectItem value="time-current">Time vs. Current</SelectItem>
                          <SelectItem value="time-potential">Time vs. Potential</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium mb-1">Scan Rate (mV/s)</label>
                      <Select value={scanRate} onValueChange={setScanRate}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select scan rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50 mV/s</SelectItem>
                          <SelectItem value="100">100 mV/s</SelectItem>
                          <SelectItem value="200">200 mV/s</SelectItem>
                          <SelectItem value="500">500 mV/s</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium mb-1">Normalize Y-Axis</label>
                      <Select value={normalize} onValueChange={setNormalize}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Normalize" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-muted/30 rounded-md flex justify-center items-center">
                      <p className="text-muted-foreground">
                        Voltammetry plot visualization will be displayed here.<br />
                        This will integrate with backend Plotly/Dash visualization.
                      </p>
                    </div>
                  )}

                  <Alert>
                    <AlertTitle>Visualization Guide</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">This interactive visualization shows {technique === "cyclic" ? "cyclic" : technique === "differential_pulse" ? "differential pulse" : technique === "square_wave" ? "square wave" : "linear sweep"} voltammetry data.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Oxidation peaks appear in the positive current region</li>
                        <li>Reduction peaks appear in the negative current region</li>
                        <li>Peak separation indicates reaction reversibility</li>
                        <li>Scan rate affects peak height and position</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Experiment Details</CardTitle>
                <CardDescription>
                  Metadata and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Technique</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.technique}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Scan Rate</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.scanRate}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Electrodes</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.electrodes}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Electrolyte</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.electrolyte}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Temperature</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.temperature}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Date</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.date}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Author</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.author}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Institution</h3>
                    <p className="text-sm text-muted-foreground">{experimentData.institution}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Related Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {experimentData.relatedPublications.map((pub) => (
                    <li key={pub.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <a href="#" className="text-sm font-medium hover:underline">{pub.title}</a>
                      <p className="text-xs text-muted-foreground">{pub.journal}, {pub.year}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VoltammetryPage;
