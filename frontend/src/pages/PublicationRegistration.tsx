import React from "react";
import MainLayout from "@/components/layouts/AppLayout";
import PublicationRegistrationComponent from "@/components/publications/PublicationRegistration";

const PublicationRegistrationPage = () => {
    return (
        <MainLayout>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-2">Register Publication</h1>
                <p className="text-muted-foreground mb-8">
                    Register your publication to associate datasets and track research impact
                </p>
                <div className="max-w-3xl mx-auto">
                    <PublicationRegistrationComponent />
                </div>
            </div>
        </MainLayout>
    );
};

export default PublicationRegistrationPage;
