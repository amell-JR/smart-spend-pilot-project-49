import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Eye, EyeOff, Mail, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface AuthError {
  message: string;
}

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const { toast } = useToast();

  // Simplified connection check that doesn't rely on direct fetch to Supabase URL
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test connection by attempting to get session from Supabase
        // This is a more reliable way to check if Supabase is accessible
        await supabase.withRetry(async (client) => client.auth.getSession());
        setNetworkError(false);
      } catch (error) {
        console.warn('Connection check failed:', error);
        // Only set network error for actual network issues, not auth issues
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          setNetworkError(true);
        }
      }
    };

    // Check connection immediately
    checkConnection();

    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // Redirect to home if user is already authenticated
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleError = (error: any) => {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      setNetworkError(true);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the service. Please check your internet connection.",
        variant: "destructive",
      });
    } else if (error.message?.includes('has been blocked by CORS policy')) {
      setNetworkError(true);
      toast({
        title: "Service Unavailable",
        description: "The service is temporarily unavailable. Please try again later.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Authentication failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setNetworkError(false);

    try {
      if (isLogin) {
        const { error } = await supabase.withRetry(async (client) =>
          client.auth.signInWithPassword({
            email,
            password,
          })
        );

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        const { error } = await supabase.withRetry(async (client) =>
          client.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })
        );

        if (error) throw error;

        setConfirmationSent(true);
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }
    } catch (error: unknown) {
      const authError = error as AuthError;
      handleError(authError);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setNetworkError(false);
    try {
      const { error } = await supabase.withRetry(async (client) =>
        client.auth.resend({
          type: 'signup',
          email: email,
        })
      );

      if (error) throw error;

      toast({
        title: "Email sent",
        description: "We've sent another confirmation email to your inbox.",
      });
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: "Failed to resend email",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              We've sent a confirmation link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Click the link in the email to confirm your account and start using SpendWise.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                variant="outline"
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend confirmation email"
                )}
              </Button>
              <Button
                onClick={() => {
                  setConfirmationSent(false);
                  setIsLogin(true);
                }}
                variant="ghost"
                className="w-full"
              >
                Back to sign in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      {networkError && (
        <Alert variant="destructive" className="fixed top-4 left-4 right-4 max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            Unable to connect to the service. Please check your connection.
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            {isLogin ? "Welcome back" : "Create account"}
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-300">
            {isLogin ? "Sign in to your account" : "Sign up to get started with SpendWise"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={authLoading}
            >
              {authLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;