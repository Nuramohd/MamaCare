import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChildCard } from "@/components/child-card";
import { PregnancyCard } from "@/components/pregnancy-card";
import { Calendar, MapPin, Plus, Users, CircleHelp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PregnancyWheel } from "@/components/ui/pregnancy-wheel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [pregnancyWheelOpen, setPregnancyWheelOpen] = useState(false);
  const [lmpDate, setLmpDate] = useState("");
  const [calculatedWeeks, setCalculatedWeeks] = useState({ weeks: 0, days: 0 });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user profile data
  const { data: userProfile } = useQuery({
    queryKey: ['/api/users/profile'],
    enabled: !!firebaseUser,
  });

  // Fetch children data
  const { data: children = [] } = useQuery({
    queryKey: ['/api/children'],
    enabled: !!firebaseUser,
  });

  // Fetch active pregnancy
  const { data: activePregnancy } = useQuery({
    queryKey: ['/api/pregnancies/active'],
    enabled: !!firebaseUser,
  });

  // Fetch upcoming reminders
  const { data: reminders = [] } = useQuery({
    queryKey: ['/api/reminders/upcoming'],
    enabled: !!firebaseUser,
  });

  // Fetch health tips
  const { data: healthTips = [] } = useQuery({
    queryKey: ['/api/health-tips'],
    enabled: !!firebaseUser,
  });

  // Fetch community highlights
  const { data: communityPosts = [] } = useQuery({
    queryKey: ['/api/community/highlights'],
    enabled: !!firebaseUser,
  });

  const calculatePregnancyWeeks = (lmpDateString: string) => {
    if (!lmpDateString) return { weeks: 0, days: 0 };
    
    const today = new Date();
    const lmp = new Date(lmpDateString);
    const diffTime = Math.abs(today.getTime() - lmp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    return { weeks, days };
  };

  useEffect(() => {
    if (lmpDate) {
      setCalculatedWeeks(calculatePregnancyWeeks(lmpDate));
    }
  }, [lmpDate]);

  const calculateDueDate = (lmpDateString: string) => {
    if (!lmpDateString) return "";
    const lmp = new Date(lmpDateString);
    const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000)); // Add 280 days
    return dueDate.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-heart text-primary-foreground text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">MamaCare</h1>
              <p className="text-xs text-muted-foreground">Kenya</p>
            </div>
          </div>
          <Button variant="outline" size="icon" data-testid="button-profile-header">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Welcome Section */}
        <div className="p-4 bg-gradient-to-r from-primary to-accent text-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold" data-testid="text-greeting">
                  Habari, {userProfile?.firstName || firebaseUser.displayName?.split(' ')[0] || 'Mama'}!
                </h2>
                <p className="text-primary-foreground/80 text-sm">Here's your family's health overview</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-bold" data-testid="stat-reminders">{reminders.length}</div>
                <div className="text-xs opacity-90">Upcoming Reminders</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-bold" data-testid="stat-children">{children.length}</div>
                <div className="text-xs opacity-90">Children Tracked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="bg-card border border-border rounded-xl p-4 h-auto text-left shadow-sm hover:shadow-md transition-shadow"
              data-testid="button-add-reminder"
            >
              <div className="w-full">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mb-3">
                  <Plus className="text-secondary text-lg" />
                </div>
                <h4 className="font-medium text-card-foreground">Add Reminder</h4>
                <p className="text-xs text-muted-foreground mt-1">Set vaccination or ANC visit</p>
              </div>
            </Button>
            
            <Dialog open={pregnancyWheelOpen} onOpenChange={setPregnancyWheelOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-card border border-border rounded-xl p-4 h-auto text-left shadow-sm hover:shadow-md transition-shadow"
                  data-testid="button-pregnancy-wheel"
                >
                  <div className="w-full">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-3">
                      <CircleHelp className="text-accent text-lg" />
                    </div>
                    <h4 className="font-medium text-card-foreground">Pregnancy Wheel</h4>
                    <p className="text-xs text-muted-foreground mt-1">Calculate weeks from LMP</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" data-testid="dialog-pregnancy-wheel">
                <DialogHeader>
                  <DialogTitle>Pregnancy Wheel Calculator</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="text-center">
                    <PregnancyWheel 
                      weeks={calculatedWeeks.weeks} 
                      days={calculatedWeeks.days} 
                      size="md" 
                      className="mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lmp-date">Last Menstrual Period (LMP)</Label>
                      <Input
                        id="lmp-date"
                        type="date"
                        value={lmpDate}
                        onChange={(e) => setLmpDate(e.target.value)}
                        data-testid="input-lmp-date"
                      />
                    </div>
                    
                    {lmpDate && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Due Date:</span>
                              <div className="font-medium" data-testid="text-due-date">
                                {calculateDueDate(lmpDate)}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Trimester:</span>
                              <div className="font-medium" data-testid="text-trimester">
                                {calculatedWeeks.weeks <= 13 ? 'First' : 
                                 calculatedWeeks.weeks <= 27 ? 'Second' : 'Third'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Button 
                      className="w-full" 
                      disabled={!lmpDate}
                      data-testid="button-save-pregnancy"
                    >
                      Save & Update Profile
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              className="bg-card border border-border rounded-xl p-4 h-auto text-left shadow-sm hover:shadow-md transition-shadow"
              data-testid="button-find-facilities"
            >
              <div className="w-full">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="text-primary text-lg" />
                </div>
                <h4 className="font-medium text-card-foreground">Find Facilities</h4>
                <p className="text-xs text-muted-foreground mt-1">Nearby dispensaries & hospitals</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="bg-card border border-border rounded-xl p-4 h-auto text-left shadow-sm hover:shadow-md transition-shadow"
              data-testid="button-community"
            >
              <div className="w-full">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Users className="text-emerald-500 text-lg" />
                </div>
                <h4 className="font-medium text-card-foreground">Community</h4>
                <p className="text-xs text-muted-foreground mt-1">Share experiences</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Children & Pregnancy Tracking */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Family</h3>
            <Button variant="ghost" size="sm" data-testid="button-add-child">
              <Plus className="w-4 h-4 mr-1" />
              Add Child
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Active Pregnancy Card */}
            {activePregnancy && (
              <PregnancyCard pregnancy={activePregnancy} />
            )}

            {/* Children Cards */}
            {children.map((child: any) => (
              <ChildCard key={child.id} child={child} />
            ))}
            
            {children.length === 0 && !activePregnancy && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">No children or pregnancies tracked yet</p>
                    <Button className="mt-4" data-testid="button-add-first-child">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Child
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        {reminders.length > 0 && (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Upcoming Reminders</h3>
            <div className="space-y-3">
              {reminders.slice(0, 3).map((reminder: any) => (
                <Card key={reminder.id} className={reminder.priority === 'urgent' ? 'border-destructive' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        reminder.priority === 'urgent' ? 'bg-destructive' : 
                        reminder.priority === 'high' ? 'bg-yellow-500' : 'bg-primary'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${
                            reminder.priority === 'urgent' ? 'text-destructive' : 'text-card-foreground'
                          }`}>
                            {reminder.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reminder.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{reminder.description}</p>
                        {reminder.priority === 'urgent' && (
                          <Button size="sm" className="mt-2" data-testid={`button-urgent-${reminder.id}`}>
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Health Education Section */}
        {healthTips.length > 0 && (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Health Tips for You</h3>
            <div className="space-y-3">
              {healthTips.slice(0, 2).map((tip: any) => (
                <Card key={tip.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-lightbulb text-white"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-2">{tip.title}</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">{tip.content}</p>
                        <Button variant="ghost" size="sm" className="mt-3 text-blue-600 p-0 h-auto">
                          Read More →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Community Highlights */}
        {communityPosts.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Community Highlights</h3>
              <Button variant="ghost" size="sm" data-testid="button-view-community">
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {communityPosts.slice(0, 2).map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {post.author?.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-card-foreground">
                            {post.author?.firstName || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{post.content}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                            ❤️ {post.likesCount || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                            💬 {post.commentsCount || 0}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
