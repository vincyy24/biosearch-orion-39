
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import { 
  fetchResearchProjectDetails, 
  updateResearchProject, 
  deleteResearchProject,
  addCollaborator,
  removeCollaborator,
  updateCollaborator,
  assignExperiment
} from "@/services/researchService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { 
  Loader2, 
  Users, 
  Lock, 
  Unlock, 
  Save, 
  Plus, 
  Trash2, 
  User, 
  UserPlus, 
  UserMinus, 
  FileText, 
  Settings, 
  Atom 
} from "lucide-react";
import { fetchVoltammetryData } from "@/services/api";

interface Collaborator {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    has_orcid?: boolean;
  };
  role: string;
  joined_at: string;
}

interface Experiment {
  id: string;
  title: string;
  experiment_type: string;
  date_created: string;
}

const ResearchProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState("active");
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Collaborator state
  const [showAddCollaboratorDialog, setShowAddCollaboratorDialog] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [newCollaboratorRole, setNewCollaboratorRole] = useState("viewer");
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  
  // Experiment state
  const [showAddExperimentDialog, setShowAddExperimentDialog] = useState(false);
  const [availableExperiments, setAvailableExperiments] = useState<any[]>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState("");
  const [isLoadingExperiments, setIsLoadingExperiments] = useState(false);
  const [isAssigningExperiment, setIsAssigningExperiment] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      setIsLoading(true);
      const data = await fetchResearchProjectDetails(projectId!);
      setProject(data);
      
      // Initialize form fields
      setTitle(data.title);
      setDescription(data.description || "");
      setIsPublic(data.is_public);
      setStatus(data.status);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details."
      });
      navigate("/research/projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateResearchProject(projectId!, {
        title,
        description,
        is_public: isPublic,
        status
      });
      
      toast({
        title: "Project updated",
        description: "Project details saved successfully."
      });
      
      loadProjectDetails();
      setIsEditMode(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update project."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteResearchProject(projectId!);
      
      toast({
        title: "Project deleted",
        description: "The research project has been deleted."
      });
      
      navigate("/research/projects");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message || "Failed to delete project."
      });
      setIsDeleting(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email or username."
      });
      return;
    }
    
    try {
      setIsAddingCollaborator(true);
      await addCollaborator(projectId!, {
        username_or_email: newCollaboratorEmail,
        role: newCollaboratorRole
      });
      
      toast({
        title: "Collaborator added",
        description: "The collaborator has been added to the project."
      });
      
      setNewCollaboratorEmail("");
      setNewCollaboratorRole("viewer");
      setShowAddCollaboratorDialog(false);
      loadProjectDetails();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add collaborator",
        description: error.message || "Failed to add collaborator to the project."
      });
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: number) => {
    try {
      await removeCollaborator(projectId!, collaboratorId);
      
      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from the project."
      });
      
      loadProjectDetails();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove collaborator",
        description: error.message || "Failed to remove collaborator from the project."
      });
    }
  };

  const handleUpdateCollaboratorRole = async (collaboratorId: number, newRole: string) => {
    try {
      await updateCollaborator(projectId!, collaboratorId, { role: newRole });
      
      toast({
        title: "Role updated",
        description: "The collaborator's role has been updated."
      });
      
      loadProjectDetails();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: error.message || "Failed to update collaborator's role."
      });
    }
  };

  const loadAvailableExperiments = async () => {
    try {
      setIsLoadingExperiments(true);
      const response = await fetchVoltammetryData();
      
      // Filter out experiments that are already in the project
      const projectExperimentIds = project.experiments.map(exp => exp.id);
      const availableExps = response.experiments.filter(
        exp => !projectExperimentIds.includes(exp.experiment_id)
      );
      
      setAvailableExperiments(availableExps);
      
      // Set the first experiment as selected if available
      if (availableExps.length > 0) {
        setSelectedExperimentId(availableExps[0].experiment_id);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load experiments",
        description: "Error loading available experiments."
      });
    } finally {
      setIsLoadingExperiments(false);
    }
  };

  const handleAddExperiment = async () => {
    if (!selectedExperimentId) {
      toast({
        variant: "destructive",
        title: "No experiment selected",
        description: "Please select an experiment to add."
      });
      return;
    }
    
    try {
      setIsAssigningExperiment(true);
      await assignExperiment(projectId!, selectedExperimentId);
      
      toast({
        title: "Experiment added",
        description: "The experiment has been added to the project."
      });
      
      setShowAddExperimentDialog(false);
      loadProjectDetails();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add experiment",
        description: error.message || "Failed to add experiment to the project."
      });
    } finally {
      setIsAssigningExperiment(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="container py-10">
          <Card>
            <CardHeader>
              <CardTitle>Project Not Found</CardTitle>
              <CardDescription>
                The requested research project could not be found.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate("/research/projects")}>
                Back to Projects
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const canEdit = project.is_head || project.user_role === 'manager';
  
  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {project.title}
                  <div className="flex gap-1">
                    {getStatusBadge(project.status)}
                    {project.is_public ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Unlock className="h-3 w-3" /> Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Private
                      </Badge>
                    )}
                  </div>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              
              {canEdit && !isEditMode && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditMode(true)}>
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Research Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this research project? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Project"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              
              {isEditMode && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {isEditMode ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Edit Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter project title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your research project"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Project Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="public"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                      <Label htmlFor="public">Make project public</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="whitespace-pre-line">
                    {project.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Tabs defaultValue="experiments" className="mb-6">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="experiments">Experiments</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              </TabsList>
              
              <TabsContent value="experiments" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Experiments</CardTitle>
                      {(project.is_head || project.user_role === 'contributor' || project.user_role === 'manager') && (
                        <Dialog 
                          open={showAddExperimentDialog} 
                          onOpenChange={(open) => {
                            setShowAddExperimentDialog(open);
                            if (open) loadAvailableExperiments();
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Experiment
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Experiment to Project</DialogTitle>
                              <DialogDescription>
                                Select an experiment to add to this research project.
                              </DialogDescription>
                            </DialogHeader>
                            
                            {isLoadingExperiments ? (
                              <div className="py-8 flex justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : availableExperiments.length > 0 ? (
                              <div className="py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="experiment">Select Experiment</Label>
                                  <Select value={selectedExperimentId} onValueChange={setSelectedExperimentId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an experiment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableExperiments.map((exp) => (
                                        <SelectItem 
                                          key={exp.experiment_id} 
                                          value={exp.experiment_id}
                                        >
                                          {exp.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ) : (
                              <div className="py-8 text-center text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <p>No unassigned experiments available.</p>
                                <p className="text-sm mt-1">
                                  All your experiments are already assigned to projects.
                                </p>
                              </div>
                            )}
                            
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowAddExperimentDialog(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAddExperiment} 
                                disabled={isAssigningExperiment || !selectedExperimentId}
                              >
                                {isAssigningExperiment ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  "Add to Project"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <CardDescription>
                      Manage experiments in this research project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {project.experiments && project.experiments.length > 0 ? (
                      <div className="space-y-3">
                        {project.experiments.map((experiment: Experiment) => (
                          <div 
                            key={experiment.id} 
                            className="border rounded-md p-3 flex justify-between hover:bg-accent transition-colors"
                          >
                            <div>
                              <h3 className="font-medium">{experiment.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {experiment.experiment_type} · {format(new Date(experiment.date_created), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/voltammetry/${experiment.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No experiments in this project</p>
                        <p className="text-sm mt-1">
                          Add experiments to start collecting research data.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="collaborators" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Collaborators</CardTitle>
                      {(project.is_head || project.user_role === 'manager') && (
                        <Dialog 
                          open={showAddCollaboratorDialog} 
                          onOpenChange={setShowAddCollaboratorDialog}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add Collaborator
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Collaborator</DialogTitle>
                              <DialogDescription>
                                Invite a collaborator to join this research project.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="email">Email or Username</Label>
                                <Input
                                  id="email"
                                  value={newCollaboratorEmail}
                                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                                  placeholder="Enter email or username"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={newCollaboratorRole} onValueChange={setNewCollaboratorRole}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="contributor">Contributor</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Viewers can only view data, contributors can add experiments, managers can edit the project
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowAddCollaboratorDialog(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAddCollaborator} 
                                disabled={isAddingCollaborator}
                              >
                                {isAddingCollaborator ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  "Add Collaborator"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <CardDescription>
                      Manage who has access to this research project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Head Researcher */}
                      <div className="border rounded-md p-3 flex justify-between items-center bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${project.head_researcher.username}.png`} />
                            <AvatarFallback>{project.head_researcher.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {project.head_researcher.username}
                              <Badge className="ml-1">Head Researcher</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {project.head_researcher.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Collaborators */}
                      {project.collaborators && project.collaborators.length > 0 ? (
                        project.collaborators.map((collaborator: Collaborator) => (
                          <div 
                            key={collaborator.id} 
                            className="border rounded-md p-3 flex justify-between items-center"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${collaborator.user.username}.png`} />
                                <AvatarFallback>{collaborator.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium flex items-center gap-1">
                                  {collaborator.user.username}
                                  {collaborator.user.has_orcid && (
                                    <Badge variant="outline" className="flex items-center gap-1 ml-1 text-xs">
                                      <Atom className="h-3 w-3" />
                                      ORCID
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {collaborator.user.email}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {(project.is_head || project.user_role === 'manager') && (
                                <>
                                  <Select 
                                    value={collaborator.role}
                                    onValueChange={(value) => handleUpdateCollaboratorRole(collaborator.id, value)}
                                  >
                                    <SelectTrigger className="w-[130px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="viewer">Viewer</SelectItem>
                                      <SelectItem value="contributor">Contributor</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                                    title="Remove collaborator"
                                  >
                                    <UserMinus className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                              
                              {!(project.is_head || project.user_role === 'manager') && (
                                <Badge variant="outline">
                                  {collaborator.role === 'viewer' ? 'Viewer' : 
                                   collaborator.role === 'contributor' ? 'Contributor' : 'Manager'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No collaborators yet</p>
                          <p className="text-sm mt-1">
                            Invite others to collaborate on this research project.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// Helper function to get the appropriate badge for project status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge>Active</Badge>;
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'archived':
      return <Badge variant="secondary">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default ResearchProjectDetail;
