import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { Button, Card, CardContent, CardHeader } from "@repo/ui";

export default function EmailVerificationPage() {
  const navigate = useNavigate();

  const handleResendEmail = () => {
    // Handle resend email logic here
    console.log("Resending verification email...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          {/* <MetMeLogo size="lg" className="mx-auto mb-4" /> */}
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="relative">
                  <Mail className="h-10 w-10 text-primary" />
                  <CheckCircle className="h-5 w-5 text-green-500 absolute -top-1 -right-1 bg-card rounded-full" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Check Your Inbox
            </h1>
            <p className="text-muted-foreground">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to verify your account.
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
                onClick={handleResendEmail}
                variant="outline"
                className="w-full rounded-xl h-12 text-base font-medium border-primary/30 hover:bg-primary/5"
              >
                Resend Verification Email
              </Button>

              <Button
                onClick={() => navigate("/auth/calendar-connect")}
                className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90"
              >
                Continue Setup
              </Button>
            </div>

            {/* Back Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <button
                onClick={() => navigate("/auth/signup")}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign Up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
