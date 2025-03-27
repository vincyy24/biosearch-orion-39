
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import { fetchResearchProjects, createResearchProject } from "@/services/researchService";
import { ResearchProject } from "@/types/common";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Users, Lock, Unlock, Calendar } from "lucide-react";
import { format } from "date-fns";

const ResearchProjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectIsPublic, setNewProjectIsPublic] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetchResearchProjects();
      setProjects(response.results);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load research projects."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProjectTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please enter a title for your research project."
      });
      return;
    }

    try {
      setIsCreating(true);
      await createResearchProject({
        title: newProjectTitle,
        description: newProjectDescription,
        is_public: newProjectIsPublic
      });

      toast({
        title: "Project created",
        description: "Your research project has been created successfully."
      });

      // Reset form and close dialog
      setNewProjectTitle("");
      setNewProjectDescription("");
      setNewProjectIsPublic(false);
      setShowCreateDialog(false);

      // Reload projects
      loadProjects();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: error.message || "Failed to create research project."
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Research Projects</h1>
            <p className="text-muted-foreground">
              Manage your research projects and collaborations
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Research Project</DialogTitle>
                <DialogDescription>
                  Create a new research project for your experiments and collaborations.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="Enter project title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Describe your research project"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={newProjectIsPublic}
                    onCheckedChange={setNewProjectIsPublic}
                  />
                  <Label htmlFor="public">Make project public</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description || "No description provided"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-y-2 text-sm">
                    <div className="flex items-center w-full space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center w-full space-x-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{project.collaborators?.length || 0} collaborators</span>
                    </div>
                    <div className="flex items-center w-full space-x-2 text-muted-foreground">
                      {project.is_public ? (
                        <>
                          <Unlock className="h-4 w-4" />
                          <span>Public project</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Private project</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => navigate(`/research/projects/${project.id}`)}
                  >
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No Research Projects</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't created any research projects yet.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ResearchProjects;
