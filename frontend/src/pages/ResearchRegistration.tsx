import React from "react";
import AppLayout from "@/components/layouts/AppLayout";
import ResearchRegistrationComponent from "@/components/research/ResearchRegistration";

const ResearchRegistrationPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Create Research Project</h1>
        <p className="text-muted-foreground mb-8">
          Set up a new research project to organize your experiments and collaborate with others
        </p>

        <div className="max-w-3xl mx-auto">
          <ResearchRegistrationComponent />
        </div>
      </div>
    </AppLayout>
  );
};

export default ResearchRegistrationPage;
