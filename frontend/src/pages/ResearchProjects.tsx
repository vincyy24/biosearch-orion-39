import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/AppLayout";
import { fetchResearchProjects } from "@/services/researchService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Microscope, Plus, ArrowRight, Users, Calendar, Lock, Globe } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 hover:bg-green-200",
  completed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  archived: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

const ResearchProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await fetchResearchProjects(page);
        setProjects(response.results || []);
        setTotalPages(Math.ceil(response.count / 10));
      } catch (error) {
        console.error("Error fetching research projects:", error);
        toast({
          title: "Error",
          description: "Failed to load research projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [page, toast]);

  const handleCreateNew = () => {
    navigate("/research/new");
  };

  const handleViewProject = (projectId) => {
    navigate(`/research/${projectId}`);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Research Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and explore your research projects</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={STATUS_COLORS[project.status] || "bg-gray-100"}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>
                        {project.collaborators_count > 0
                          ? `${project.collaborators_count + 1} researchers`
                          : "1 researcher"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Created {format(new Date(project.created_at), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center">
                      {project.is_public ? (
                        <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                      )}
                      <span>{project.is_public ? "Public" : "Private"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewProject(project.id)}
                  >
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Microscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No research projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first research project to start organizing your experiments
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" /> Create Research Project
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResearchProjects;