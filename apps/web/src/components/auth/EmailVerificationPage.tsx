"use client";
import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, ArrowLeft, Loader2, Clock } from "lucide-react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  const isDisabled = isResending || cooldownTime > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email not found. Please sign up again.");
      return;
    }

    setIsResending(true);
    try {
      const result = await api.resendVerificationEmail(email);
      toast.success("Verification email sent!");
      setLastResendTime(Date.now());
      setCooldownTime(300); // 5 minutes = 300 seconds
    } catch (error: any) {
      console.log("Resend error:", error);
      let errorMessage = "Failed to resend email";

      // Parse error response
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);

      // If error mentions waiting time, set cooldown
      if (errorMessage.includes("5 minutes") || errorMessage.includes("wait")) {
        setCooldownTime(300);
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
            <p className="text-mforeground">
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
                disabled={isDisabled}
                variant="outline"
                className={`w-full rounded-xl h-12 text-base font-medium transition-colors ${
                  isDisabled
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed hover:bg-gray-50 hover:border-gray-200"
                    : "border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                }`}
              >
                {isResending ? (
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
                  "Resend Verification Email"
                )}
              </Button>

              {cooldownTime > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-700">
                    Please wait {formatTime(cooldownTime)} before requesting
                    another email to prevent spam.
                  </p>
                </div>
              )}
            </div>

            {/* Back Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <button
                onClick={() => router.push("/signup")}
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
