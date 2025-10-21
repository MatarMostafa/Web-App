"use client";
import React, { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Button, Input, Label, Card, CardContent, CardHeader } from "@repo/ui";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

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
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full rounded-xl h-12 text-base font-medium border-primary/30 hover:bg-primary/5"
                >
                  Send Another Link
                </Button>

                <Button
                  onClick={() => router.push("/auth/signin")}
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
                className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90"
              >
                Send Reset Link
              </Button>
            </form>

            {/* Back Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <button
                onClick={() => router.push("/auth/signin")}
                className="inline-flex items-center gap-2 text-sm text-mforeground hover:text-foreground transition-colors"
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
