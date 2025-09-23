import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PregnancyWheel } from "@/components/ui/pregnancy-wheel";
import type { Pregnancy } from "@shared/schema";

interface PregnancyCardProps {
  pregnancy: Pregnancy & {
    nextAncVisit?: {
      scheduledDate: string;
      visitNumber: number;
    };
  };
  onViewDetails?: (pregnancyId: string) => void;
}

export function PregnancyCard({ pregnancy, onViewDetails }: PregnancyCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm" data-testid={`card-pregnancy-${pregnancy.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-purple-900" data-testid="text-pregnancy-title">Current Pregnancy</h4>
            <p className="text-sm text-purple-700" data-testid={`text-pregnancy-weeks-${pregnancy.id}`}>
              {pregnancy.currentWeeks} weeks{pregnancy.currentDays ? `, ${pregnancy.currentDays} days` : ''}
            </p>
          </div>
          <PregnancyWheel 
            weeks={pregnancy.currentWeeks || 0} 
            days={pregnancy.currentDays || 0} 
            size="sm" 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700">Next ANC Visit</span>
            <span className="font-medium text-purple-900" data-testid={`text-next-anc-${pregnancy.id}`}>
              {pregnancy.nextAncVisit 
                ? formatDate(pregnancy.nextAncVisit.scheduledDate)
                : "Not scheduled"
              }
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700">Tetanus Vaccine</span>
            <Badge 
              className={pregnancy.tetanusVaccinated 
                ? "bg-green-100 text-green-800 text-xs" 
                : "bg-yellow-100 text-yellow-800 text-xs"
              }
              data-testid={`status-tetanus-${pregnancy.id}`}
            >
              {pregnancy.tetanusVaccinated ? "Completed" : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700">IFAS Supplements</span>
            <Badge 
              className={pregnancy.ifasStartDate 
                ? "bg-yellow-100 text-yellow-800 text-xs" 
                : "bg-red-100 text-red-800 text-xs"
              }
              data-testid={`status-ifas-${pregnancy.id}`}
            >
              {pregnancy.ifasStartDate ? "Take Daily" : "Not Started"}
            </Badge>
          </div>
        </div>
        
        <Button 
          className="w-full mt-3 bg-white text-purple-900 border border-purple-200 hover:bg-purple-50" 
          variant="outline"
          onClick={() => onViewDetails?.(pregnancy.id)}
          data-testid={`button-view-pregnancy-${pregnancy.id}`}
        >
          View Full Details
        </Button>
      </CardContent>
    </Card>
  );
}
