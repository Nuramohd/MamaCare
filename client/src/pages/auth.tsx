import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { signInWithGoogle, handleRedirectResult, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Heart, Shield, Users, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLocation("/");
      }
    });

    // Handle redirect result from Firebase auth
    handleRedirectResult()
      .then((result) => {
        if (result) {
          // User signed in successfully, create/update user profile
          createUserProfile(result.user);
        }
      })
      .catch((error) => {
        console.error("Auth redirect error:", error);
        setError("Authentication failed. Please try again.");
        setLoading(false);
      });

    return () => unsubscribe();
  }, [setLocation]);

  const createUserProfile = async (firebaseUser: any) => {
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Create user profile in our database
      await apiRequest('POST', '/api/users/profile', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        idToken
      });

      setLocation("/");
    } catch (error) {
      console.error("Profile creation error:", error);
      setError("Failed to create user profile. Please try again.");
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* App Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-app-title">MamaCare</h1>
            <p className="text-xl text-primary font-semibold">Kenya</p>
            <p className="text-muted-foreground mt-2">
              Your trusted companion for maternal and child health
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/50 backdrop-blur rounded-lg p-3 text-center">
            <Shield className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-xs font-medium">Vaccination</p>
            <p className="text-xs text-muted-foreground">Tracking</p>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-lg p-3 text-center">
            <Calendar className="w-6 h-6 text-secondary mx-auto mb-1" />
            <p className="text-xs font-medium">ANC Care</p>
            <p className="text-xs text-muted-foreground">Reminders</p>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-lg p-3 text-center">
            <Users className="w-6 h-6 text-accent mx-auto mb-1" />
            <p className="text-xs font-medium">Community</p>
            <p className="text-xs text-muted-foreground">Support</p>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-lg p-3 text-center">
            <Heart className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-medium">AI Health</p>
            <p className="text-xs text-muted-foreground">Guidance</p>
          </div>
        </div>

        {/* Sign In Card */}
        <Card className="backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Welcome to MamaCare</CardTitle>
            <CardDescription>
              Sign in to access your personalized maternal and child health dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" data-testid="alert-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleSignIn} 
              disabled={loading} 
              className="w-full bg-white text-gray-900 border hover:bg-gray-50"
              data-testid="button-sign-in-google"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="text-xs text-center text-muted-foreground space-y-2">
              <p>
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
              <div className="flex items-center justify-center space-x-4">
                <span>🇰🇪 Made for Kenya</span>
                <span>🏥 WHO Guidelines</span>
                <span>🤱 Mom-Focused</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Benefits */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-center mb-3">Why MamaCare?</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Track Kenya EPI vaccination schedule</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Get ANC reminders for tetanus & IFAS</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Connect with other Kenyan mothers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>AI-powered health guidance</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
