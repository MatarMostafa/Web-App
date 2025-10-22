"use client";
import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, Send, Loader2, Clock } from "lucide-react";
import { Button, Input, Label, Card, CardContent, CardHeader } from "@repo/ui";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.forgotPassword(email);
      setIsSubmitted(true);
      setLastSentTime(Date.now());
      setCooldownTime(300); // 5 minutes
      toast.success('Reset link sent to your email!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset email';
      toast.error(errorMessage);
      
      // If error mentions waiting time, set cooldown
      if (errorMessage.includes('5 minutes') || errorMessage.includes('wait')) {
        setCooldownTime(300);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitted(false);
    await handleSubmit(new Event('submit') as any);
  };

  const isResendDisabled = isLoading || cooldownTime > 0;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            {/* <ERPLogo size="lg" className="mx-auto mb-4" /> */}
          </div>

          {/* Success Card */}
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm p-5">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Reset Link Sent
              </h1>
              <p className="text-mforeground">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-accent/20 rounded-xl p-4 text-center">
                <p className="text-sm text-foreground/80">
                  Can't find the email? Check your spam folder or try resending
                  it.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  variant="outline"
                  className={`w-full rounded-xl h-12 text-base font-medium transition-colors ${
                    isResendDisabled 
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed hover:bg-gray-50 hover:border-gray-200' 
                      : 'border-primary/30 hover:bg-primary/5 hover:border-primary/50'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : cooldownTime > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Resend in {formatTime(cooldownTime)}
                    </>
                  ) : (
                    'Send Another Link'
                  )}
                </Button>
                
                {cooldownTime > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700">
                      Please wait {formatTime(cooldownTime)} before requesting another reset email.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => router.push("/login")}
                  className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          {/* <ERPLogo size="lg" className="mx-auto mb-4" /> */}
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm p-5">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex  justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Forgot Password?
            </h1>
            <p className="text-mforeground">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  className="rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            {/* Back Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
