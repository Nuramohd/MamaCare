import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, AlertTriangle, Clock } from "lucide-react";
import type { Child, Vaccination } from "@shared/schema";

interface ChildCardProps {
  child: Child & {
    nextVaccination?: Vaccination;
    age: string;
  };
  onScheduleVaccination?: (childId: string) => void;
  onViewDetails?: (childId: string) => void;
}

export function ChildCard({ child, onScheduleVaccination, onViewDetails }: ChildCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (vaccination?: Vaccination) => {
    if (!vaccination) return "bg-muted text-muted-foreground";
    
    const today = new Date();
    const scheduledDate = new Date(vaccination.scheduledDate);
    
    if (vaccination.status === 'administered') {
      return "bg-emerald-100 text-emerald-800";
    }
    
    if (scheduledDate < today) {
      return "bg-destructive/10 text-destructive";
    }
    
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (vaccination?: Vaccination) => {
    if (!vaccination) return "No upcoming vaccines";
    
    const today = new Date();
    const scheduledDate = new Date(vaccination.scheduledDate);
    
    if (vaccination.status === 'administered') {
      return "Up to date";
    }
    
    if (scheduledDate < today) {
      const daysOverdue = Math.floor((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysOverdue} days overdue`;
    }
    
    const daysUntil = Math.floor((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil === 0) return "Due today";
    if (daysUntil < 7) return `${daysUntil} days`;
    if (daysUntil < 30) return `${Math.floor(daysUntil / 7)} weeks`;
    return `${Math.floor(daysUntil / 30)} months`;
  };

  const getStatusIcon = (vaccination?: Vaccination) => {
    if (!vaccination) return <Clock className="w-4 h-4" />;
    
    const today = new Date();
    const scheduledDate = new Date(vaccination.scheduledDate);
    
    if (vaccination.status === 'administered') {
      return <Clock className="w-4 h-4" />;
    }
    
    if (scheduledDate < today) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    
    return <Clock className="w-4 h-4" />;
  };

  const isOverdue = child.nextVaccination && 
    new Date(child.nextVaccination.scheduledDate) < new Date() && 
    child.nextVaccination.status !== 'administered';

  return (
    <Card className="shadow-sm" data-testid={`card-child-${child.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Child profile image placeholder */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg" data-testid={`text-initials-${child.id}`}>
              {getInitials(child.firstName, child.lastName)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-card-foreground" data-testid={`text-name-${child.id}`}>
                {child.firstName} {child.lastName}
              </h4>
              <Badge variant="secondary" className="text-xs" data-testid={`text-age-${child.id}`}>
                {child.age}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next Vaccination</span>
                <span className="font-medium text-card-foreground" data-testid={`text-next-vaccine-${child.id}`}>
                  {child.nextVaccination 
                    ? `${child.nextVaccination.vaccineName} - Dose ${child.nextVaccination.doseNumber}`
                    : "No upcoming vaccines"
                  }
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">Due:</span>
                <Badge className={`ml-2 text-xs ${getStatusColor(child.nextVaccination)}`} data-testid={`status-vaccine-${child.id}`}>
                  {getStatusIcon(child.nextVaccination)}
                  <span className="ml-1">{getStatusText(child.nextVaccination)}</span>
                </Badge>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-3">
              {isOverdue ? (
                <Button 
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                  onClick={() => onScheduleVaccination?.(child.id)}
                  data-testid={`button-schedule-urgent-${child.id}`}
                >
                  Schedule Now
                </Button>
              ) : child.nextVaccination && child.nextVaccination.status !== 'administered' ? (
                <Button 
                  className="flex-1" 
                  onClick={() => onScheduleVaccination?.(child.id)}
                  data-testid={`button-schedule-${child.id}`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              ) : (
                <Button 
                  className="flex-1" 
                  variant="outline" 
                  disabled
                  data-testid={`button-up-to-date-${child.id}`}
                >
                  Up to Date
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onViewDetails?.(child.id)}
                data-testid={`button-view-details-${child.id}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
