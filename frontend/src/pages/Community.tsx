
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, Calendar, Globe } from "lucide-react";

const Community = () => {
  const upcomingEvents = [
    {
      title: "Genomic Data Analysis Workshop",
      date: "June 15, 2023",
      location: "Virtual",
      description: "Learn advanced techniques for analyzing genomic data sets."
    },
    {
      title: "Biomedical Research Conference",
      date: "July 8-10, 2023",
      location: "San Francisco, CA",
      description: "Annual conference bringing together leading researchers in biomedical science."
    },
    {
      title: "Computational Biology Hackathon",
      date: "August 20, 2023",
      location: "Boston, MA",
      description: "Collaborative event focused on developing new tools for computational biology."
    }
  ];

  const communityMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Genomics Researcher",
      institution: "Stanford University",
      avatar: "SC"
    },
    {
      name: "Prof. James Wilson",
      role: "Computational Biologist",
      institution: "MIT",
      avatar: "JW"
    },
    {
      name: "Dr. Maria Rodriguez",
      role: "Protein Structure Analyst",
      institution: "Harvard Medical School",
      avatar: "MR"
    },
    {
      name: "Dr. Kenji Tanaka",
      role: "Bioinformatics Specialist",
      institution: "University of Tokyo",
      avatar: "KT"
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow researchers, participate in discussions, and stay updated on events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Discussion Forums
                </CardTitle>
                <CardDescription>Join conversations on various research topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Genome Sequencing Techniques</h3>
                    <p className="text-sm text-muted-foreground mb-2">32 threads • Last active: 2 hours ago</p>
                    <p className="text-sm">Discussion about latest advancements in sequencing technologies.</p>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Protein Structure Prediction</h3>
                    <p className="text-sm text-muted-foreground mb-2">24 threads • Last active: 5 hours ago</p>
                    <p className="text-sm">Sharing methods and tools for predicting protein structures.</p>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Data Visualization Best Practices</h3>
                    <p className="text-sm text-muted-foreground mb-2">18 threads • Last active: 1 day ago</p>
                    <p className="text-sm">Techniques for effectively visualizing complex biological data.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Conferences, workshops, and community meetups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="mr-1 h-4 w-4" /> {event.date} •
                        <Globe className="mx-1 h-4 w-4" /> {event.location}
                      </div>
                      <p className="text-sm">{event.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Featured Members
                </CardTitle>
                <CardDescription>Meet active community contributors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communityMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg`} alt={member.name} />
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join the Community</CardTitle>
                <CardDescription>Share your research and connect with peers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Our community consists of researchers, scientists, and healthcare professionals
                  from around the world who collaborate and share knowledge.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Community Guidelines:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Be respectful and constructive</li>
                    <li>Share knowledge and cite sources</li>
                    <li>Protect confidential information</li>
                    <li>Follow ethical research practices</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Community;
