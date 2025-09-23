import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChildCard } from "@/components/child-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChildSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Baby, Calendar, Shield } from "lucide-react";

const childFormSchema = insertChildSchema.extend({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender",
  }),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

export default function Children() {
  const [addChildOpen, setAddChildOpen] = useState(false);
  const { toast } = useToast();

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['/api/children'],
  });

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      birthWeight: undefined,
      placeOfBirth: "",
    },
  });

  const addChildMutation = useMutation({
    mutationFn: async (data: ChildFormValues) => {
      const response = await apiRequest('POST', '/api/children', {
        ...data,
        birthWeight: data.birthWeight ? parseInt(data.birthWeight.toString()) : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/upcoming'] });
      setAddChildOpen(false);
      form.reset();
      toast({
        title: "Child Added Successfully",
        description: "We've created a vaccination schedule based on Kenya EPI guidelines.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Add Child",
        description: error.message || "Please try again",
      });
    },
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} years, ${months} months` : `${years} years`;
    }
  };

  const childrenWithAge = children.map((child: any) => ({
    ...child,
    age: calculateAge(child.dateOfBirth),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-xl h-32"></div>
              </div>
            ))}
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
              <Baby className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="text-page-title">My Children</h1>
              <p className="text-xs text-muted-foreground">Track vaccination schedules</p>
            </div>
          </div>
          <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-child-header">
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-testid="dialog-add-child">
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit((data) => addChildMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-date-of-birth" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Weight (grams, optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 3200"
                            {...field} 
                            data-testid="input-birth-weight" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Birth (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Kenyatta National Hospital"
                            {...field} 
                            data-testid="input-place-of-birth" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setAddChildOpen(false)}
                      className="flex-1"
                      data-testid="button-cancel-add-child"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addChildMutation.isPending}
                      className="flex-1"
                      data-testid="button-save-child"
                    >
                      {addChildMutation.isPending ? "Saving..." : "Add Child"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Kenya EPI Information */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Kenya EPI Schedule 2024</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  We follow Kenya's Expanded Programme on Immunisation guidelines to ensure your children 
                  receive all recommended vaccines at the right time. All vaccines are free at public health facilities.
                </p>
                <Button variant="ghost" size="sm" className="mt-3 text-blue-600 p-0 h-auto">
                  Learn More About EPI →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children List */}
        {childrenWithAge.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Children ({childrenWithAge.length})</h2>
            {childrenWithAge.map((child: any) => (
              <ChildCard 
                key={child.id} 
                child={child} 
                onScheduleVaccination={(childId) => {
                  // TODO: Navigate to vaccination scheduling
                  console.log('Schedule vaccination for child:', childId);
                }}
                onViewDetails={(childId) => {
                  // TODO: Navigate to child details
                  console.log('View details for child:', childId);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center space-y-6 mt-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Baby className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">No Children Added Yet</h2>
              <p className="text-muted-foreground mb-6">
                Add your children to start tracking their vaccination schedules according to Kenya's EPI guidelines.
              </p>
              <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-add-first-child">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Child
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            
            {/* Benefits of adding children */}
            <Card className="text-left">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">When you add a child, you'll get:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Automated Kenya EPI vaccination schedule</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span>Reminders for upcoming vaccinations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Baby className="w-4 h-4 text-accent" />
                    <span>Age-appropriate health guidance</span>
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
