import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  value: string;
  label: string;
  description: string;
}

const StatCard = ({ value, label, description }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
          {value}
        </div>
        <div className="text-xl font-medium mb-1">{label}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
