import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PregnancyWheel } from "@/components/ui/pregnancy-wheel";
import { PregnancyCard } from "@/components/pregnancy-card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPregnancySchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Heart, Calendar, Pill, Shield, AlertTriangle } from "lucide-react";

const pregnancyFormSchema = insertPregnancySchema.extend({
  lmpDate: z.string().min(1, "LMP date is required"),
});

type PregnancyFormValues = z.infer<typeof pregnancyFormSchema>;

export default function Pregnancy() {
  const [addPregnancyOpen, setAddPregnancyOpen] = useState(false);
  const { toast } = useToast();

  const { data: activePregnancy, isLoading } = useQuery({
    queryKey: ['/api/pregnancies/active'],
  });

  const { data: ancVisits = [] } = useQuery({
    queryKey: ['/api/anc-visits'],
    enabled: !!activePregnancy,
  });

  const { data: pregnancyGuidelines } = useQuery({
    queryKey: ['/api/pregnancy/guidelines'],
  });

  const form = useForm<PregnancyFormValues>({
    resolver: zodResolver(pregnancyFormSchema),
    defaultValues: {
      lmpDate: "",
      isActive: true,
      tetanusVaccinated: false,
    },
  });

  const addPregnancyMutation = useMutation({
    mutationFn: async (data: PregnancyFormValues) => {
      // Calculate expected due date (280 days from LMP)
      const lmp = new Date(data.lmpDate);
      const expectedDueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000));
      
      // Calculate current weeks and days
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lmp.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const currentWeeks = Math.floor(diffDays / 7);
      const currentDays = diffDays % 7;

      const response = await apiRequest('POST', '/api/pregnancies', {
        ...data,
        expectedDueDate: expectedDueDate.toISOString().split('T')[0],
        currentWeeks,
        currentDays,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pregnancies/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/upcoming'] });
      setAddPregnancyOpen(false);
      form.reset();
      toast({
        title: "Pregnancy Added Successfully",
        description: "We've created your ANC schedule and reminders.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Add Pregnancy",
        description: error.message || "Please try again",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="bg-muted rounded-xl h-48 mb-6"></div>
            <div className="space-y-4">
              <div className="bg-muted rounded-xl h-24"></div>
              <div className="bg-muted rounded-xl h-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="text-page-title">Pregnancy Care</h1>
              <p className="text-xs text-muted-foreground">ANC visits & health tracking</p>
            </div>
          </div>
          {!activePregnancy && (
            <Dialog open={addPregnancyOpen} onOpenChange={setAddPregnancyOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-pregnancy-header">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pregnancy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" data-testid="dialog-add-pregnancy">
                <DialogHeader>
                  <DialogTitle>Track New Pregnancy</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit((data) => addPregnancyMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="lmpDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Menstrual Period (LMP)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-lmp-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setAddPregnancyOpen(false)}
                        className="flex-1"
                        data-testid="button-cancel-add-pregnancy"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addPregnancyMutation.isPending}
                        className="flex-1"
                        data-testid="button-save-pregnancy"
                      >
                        {addPregnancyMutation.isPending ? "Saving..." : "Start Tracking"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {activePregnancy ? (
          <div className="space-y-6">
            {/* Active Pregnancy Card */}
            <PregnancyCard pregnancy={activePregnancy} />

            {/* Pregnancy Progress */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Pregnancy Progress</h3>
                <div className="text-center mb-6">
                  <PregnancyWheel 
                    weeks={activePregnancy.currentWeeks || 0} 
                    days={activePregnancy.currentDays || 0}
                    size="lg"
                    className="mx-auto"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <div className="font-medium" data-testid="text-due-date">
                      {new Date(activePregnancy.expectedDueDate).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trimester:</span>
                    <div className="font-medium" data-testid="text-trimester">
                      {(activePregnancy.currentWeeks || 0) <= 13 ? 'First' : 
                       (activePregnancy.currentWeeks || 0) <= 27 ? 'Second' : 'Third'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ANC Care Requirements */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-purple-900 mb-4">Kenya ANC Care Guidelines</h3>
                <div className="space-y-3">
                  {/* Tetanus Vaccination */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-purple-700" />
                      <div>
                        <p className="font-medium text-purple-900">Tetanus Vaccine</p>
                        <p className="text-xs text-purple-700">Recommended: 27-36 weeks</p>
                      </div>
                    </div>
                    <Badge 
                      className={activePregnancy.tetanusVaccinated 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                      }
                      data-testid="status-tetanus"
                    >
                      {activePregnancy.tetanusVaccinated ? "✓ Done" : "Pending"}
                    </Badge>
                  </div>

                  {/* IFAS Supplements */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Pill className="w-5 h-5 text-purple-700" />
                      <div>
                        <p className="font-medium text-purple-900">IFAS Supplements</p>
                        <p className="text-xs text-purple-700">Iron & Folic Acid daily</p>
                      </div>
                    </div>
                    <Badge 
                      className={activePregnancy.ifasStartDate 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-red-100 text-red-800"
                      }
                      data-testid="status-ifas"
                    >
                      {activePregnancy.ifasStartDate ? "Taking" : "Not Started"}
                    </Badge>
                  </div>

                  {/* Detailed Information */}
                  <div className="mt-4 p-3 bg-white/60 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Why These Matter:</h4>
                    <div className="space-y-2 text-xs text-purple-800">
                      <p>• <strong>Tetanus vaccine</strong> protects both you and your baby from tetanus infection</p>
                      <p>• <strong>IFAS supplements</strong> prevent anemia and support baby's brain development</p>
                      <p>• Take IFAS with Vitamin C foods (oranges, tomatoes) for better absorption</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ANC Visits Schedule */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  ANC Visits Schedule
                </h3>
                <div className="space-y-3">
                  {ancVisits.length > 0 ? (
                    ancVisits.map((visit: any) => (
                      <div key={visit.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">Visit {visit.visitNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {visit.gestationalWeeks && `${visit.gestationalWeeks} weeks`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{new Date(visit.scheduledDate).toLocaleDateString()}</p>
                          <Badge 
                            className={visit.status === 'completed' 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {visit.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No ANC visits scheduled yet</p>
                      <Button className="mt-4" data-testid="button-schedule-anc">
                        Schedule First Visit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Health Tips */}
            {pregnancyGuidelines && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Health Tips for Week {activePregnancy.currentWeeks}
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        At {activePregnancy.currentWeeks} weeks, your baby is developing rapidly. 
                        Continue taking your IFAS supplements daily and stay hydrated. 
                        Regular gentle exercise like walking is beneficial for both you and baby.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 mt-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">No Active Pregnancy</h2>
              <p className="text-muted-foreground mb-6">
                Track your pregnancy journey with personalized ANC care reminders and Kenya health guidelines.
              </p>
              <Dialog open={addPregnancyOpen} onOpenChange={setAddPregnancyOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-start-tracking">
                    <Plus className="w-5 h-5 mr-2" />
                    Start Tracking Pregnancy
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            
            {/* Benefits */}
            <Card className="text-left">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">When you track your pregnancy, you'll get:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>ANC visit reminders based on Kenya guidelines</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span>Tetanus vaccination tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-accent" />
                    <span>IFAS supplement reminders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    <span>Week-by-week pregnancy guidance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
