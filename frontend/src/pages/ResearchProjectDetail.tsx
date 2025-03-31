import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchResearchProjectDetails } from "@/services/researchService";
import AppLayout from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  FileText,
  Users,
  Database,
  Clock,
  BarChart3,
  Settings,
  History,
  Download,
  CalendarDays,
  Lock,
  Globe
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import ResearchVersionHistory from "@/components/research/ResearchVersionHistory";

const ResearchProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await fetchResearchProjectDetails(id);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast({
          title: "Error",
          description: "Failed to load research project details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [id, toast]);

  const handleBack = () => {
    navigate("/research");
  };

  const downloadDataset = (datasetId) => {
    window.open(`/api/download/${datasetId}`, "_blank");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container py-8 max-w-7xl">
          <Button variant="ghost" className="mb-4" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>

          <div className="mb-6">
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>

          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="container py-8 max-w-7xl">
          <Button variant="ghost" className="mb-4" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>

          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Project Not Found</AlertTitle>
            <AlertDescription>
              The research project you're looking for doesn't exist or you don't have permission to view it.
            </AlertDescription>
          </Alert>

          <Button onClick={handleBack}>Return to Projects</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 max-w-7xl">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>

        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}
                >
                  {project.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={project.is_public ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}
                >
                  <span className="flex items-center">
                    {project.is_public ? (
                      <><Globe className="w-3 h-3 mr-1" /> Public</>
                    ) : (
                      <><Lock className="w-3 h-3 mr-1" /> Private</>
                    )}
                  </span>
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <CalendarDays className="w-3 h-3 mr-1" />
                  Created {format(new Date(project.created_at), "MMM dd, yyyy")}
                </span>
              </div>
            </div>

            <Button variant="outline" onClick={() => navigate(`/research/${id}/edit`)}>
              <Settings className="mr-2 h-4 w-4" /> Manage Project
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <FileText className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="datasets">
              <Database className="h-4 w-4 mr-2" /> Datasets
            </TabsTrigger>
            <TabsTrigger value="experiments">
              <Clock className="h-4 w-4 mr-2" /> Experiments
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <BarChart3 className="h-4 w-4 mr-2" /> Analysis
            </TabsTrigger>
            <TabsTrigger value="versions">
              <History className="h-4 w-4 mr-2" /> Versions
            </TabsTrigger>
            <TabsTrigger value="collaborators">
              <Users className="h-4 w-4 mr-2" /> Collaborators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{project.description || "No description provided."}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Project ID:</dt>
                      <dd className="text-muted-foreground">{project.project_id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Status:</dt>
                      <dd className="text-muted-foreground capitalize">{project.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Visibility:</dt>
                      <dd className="text-muted-foreground">{project.is_public ? "Public" : "Private"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Created:</dt>
                      <dd className="text-muted-foreground">
                        {format(new Date(project.created_at), "PPP")}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Last Updated:</dt>
                      <dd className="text-muted-foreground">
                        {format(new Date(project.updated_at), "PPP")}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Datasets:</dt>
                      <dd className="text-muted-foreground">{project.datasets?.length || 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Experiments:</dt>
                      <dd className="text-muted-foreground">{project.experiments?.length || 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Collaborators:</dt>
                      <dd className="text-muted-foreground">{project.collaborators?.length || 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Version History:</dt>
                      <dd className="text-muted-foreground">{project.versions?.length || 0} versions</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Datasets</CardTitle>
                <CardDescription>
                  View and download datasets associated with this research project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.datasets && project.datasets.length > 0 ? (
                  <div className="space-y-4">
                    {project.datasets.map((dataset) => (
                      <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{dataset.title}</h4>
                          <p className="text-sm text-muted-foreground">{dataset.description || "No description"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {dataset.file_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(dataset.file_size / 1024).toFixed(2)} KB
                            </span>
                            <Badge
                              variant="outline"
                              className={dataset.is_public ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}
                            >
                              {dataset.is_public ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDataset(dataset.id)}
                        >
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No datasets yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your first dataset to this research project
                    </p>
                    <Button onClick={() => navigate("/upload", { state: { projectId: id } })}>
                      Upload Dataset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experiments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Experiments</CardTitle>
                <CardDescription>
                  View and manage experiments associated with this research project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.experiments && project.experiments.length > 0 ? (
                  <div className="space-y-4">
                    {project.experiments.map((experiment) => (
                      <div key={experiment.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{experiment.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {experiment.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {experiment.experiment_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created on {format(new Date(experiment.created_at), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/voltammetry/${experiment.experiment_id}`)}
                          >
                            View Experiment
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No experiments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add experiments to this research project
                    </p>
                    <Button onClick={() => navigate("/voltammetry")}>
                      Create Experiment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Analysis</CardTitle>
                <CardDescription>
                  Analyze and compare datasets within this research project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analysis Tools</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new comparison or analyze existing datasets
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/research/projects/${id}/comparisons`)}
                    >
                      View Comparisons
                    </Button>
                    <Button onClick={() => navigate(`/research/comparisons/new?project=${id}`)}>
                      Create New Comparison
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Track changes and versions of this research project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResearchVersionHistory projectId={id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Collaborators</CardTitle>
                  <CardDescription>
                    Manage who has access to this research project
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" /> Invite Collaborator
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground font-medium">
                          {project.head_researcher.name && project.head_researcher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium">{project.head_researcher.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.head_researcher.email}</p>
                        </div>
                      </div>
                      <Badge>Lead Researcher</Badge>
                    </div>
                  </div>

                  {project.collaborators && project.collaborators.length > 0 ? (
                    project.collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground font-medium">
                              {collaborator.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium">{collaborator.user.name}</h4>
                              <p className="text-sm text-muted-foreground">{collaborator.user.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{collaborator.role}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No collaborators yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ResearchProjectDetail;