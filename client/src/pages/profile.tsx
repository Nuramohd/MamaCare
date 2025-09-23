import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signOutUser, auth } from "@/lib/firebase";
import { useLocation } from "wouter";
import { 
  User, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  Bell, 
  Shield, 
  Heart, 
  Baby, 
  LogOut,
  Settings,
  HelpCircle,
  MessageSquare,
  Star
} from "lucide-react";

const profileFormSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  phoneNumber: true,
  county: true,
  subCounty: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  county: z.string().optional(),
  subCounty: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const kenyanCounties = [
  "Nairobi", "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira"
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { toast } = useToast();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/users/profile'],
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/users/stats'],
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      phoneNumber: userProfile?.phoneNumber || "",
      county: userProfile?.county || "",
      subCounty: userProfile?.subCounty || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest('PATCH', '/api/users/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      setEditProfileOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Please try again",
      });
    },
  });

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setLocation("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Please try again",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted rounded-xl h-32"></div>
            <div className="bg-muted rounded-xl h-24"></div>
            <div className="bg-muted rounded-xl h-24"></div>
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
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="text-page-title">Profile</h1>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-edit-profile">
                <Edit3 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-testid="dialog-edit-profile">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))}
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., +254712345678"
                            {...field} 
                            data-testid="input-phone-number" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-county">
                              <SelectValue placeholder="Select your county" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {kenyanCounties.map((county) => (
                              <SelectItem key={county} value={county}>
                                {county}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subCounty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-County (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Westlands"
                            {...field} 
                            data-testid="input-sub-county" 
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
                      onClick={() => setEditProfileOpen(false)}
                      className="flex-1"
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="flex-1"
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold" data-testid="text-user-initials">
                  {userProfile && getInitials(userProfile.firstName, userProfile.lastName)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold" data-testid="text-user-name">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h2>
                <p className="text-muted-foreground flex items-center mt-1" data-testid="text-user-email">
                  <Mail className="w-4 h-4 mr-2" />
                  {userProfile?.email}
                </p>
                {userProfile?.phoneNumber && (
                  <p className="text-muted-foreground flex items-center mt-1" data-testid="text-user-phone">
                    <Phone className="w-4 h-4 mr-2" />
                    {userProfile.phoneNumber}
                  </p>
                )}
                {userProfile?.county && (
                  <p className="text-muted-foreground flex items-center mt-1" data-testid="text-user-location">
                    <MapPin className="w-4 h-4 mr-2" />
                    {userProfile.county}{userProfile.subCounty && `, ${userProfile.subCounty}`}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Baby className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold" data-testid="stat-children-count">
                  {userStats.childrenCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Children Tracked</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold" data-testid="stat-pregnancies-count">
                  {userStats.pregnanciesCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Pregnancies</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold" data-testid="stat-vaccinations-count">
                  {userStats.vaccinationsCompleted || 0}
                </div>
                <div className="text-xs text-muted-foreground">Vaccinations</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold" data-testid="stat-posts-count">
                  {userStats.communityPosts || 0}
                </div>
                <div className="text-xs text-muted-foreground">Community Posts</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get reminders for vaccinations and ANC visits</p>
              </div>
              <Switch 
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                data-testid="switch-notifications"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Health Data Sharing</p>
                <p className="text-sm text-muted-foreground">Help improve community health insights</p>
              </div>
              <Switch defaultChecked data-testid="switch-data-sharing" />
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>App Version</span>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Kenya EPI Guidelines</span>
              <Badge variant="outline">2024</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Data Source</span>
              <Badge variant="outline">WHO & MOH Kenya</Badge>
            </div>
            
            <Separator />
            
            <Button variant="ghost" className="w-full justify-start" data-testid="button-privacy-policy">
              Privacy Policy
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" data-testid="button-terms-service">
              Terms of Service
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" data-testid="button-help-support">
              Help & Support
            </Button>
          </CardContent>
        </Card>

        {/* Rate App */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Enjoying MamaCare?</h3>
                <p className="text-sm text-yellow-800">Help other mothers discover our app</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                data-testid="button-rate-app"
              >
                Rate App
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleSignOut}
              data-testid="button-sign-out"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
