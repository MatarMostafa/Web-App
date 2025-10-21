"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Users, Sparkles } from "lucide-react";
import { Button, Input, Label, Card, CardContent, CardHeader } from "@repo/ui";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({
        email: formData.email,
        username: formData.userName,
        password: formData.password,
      });
      router.push("/email-verification");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          {/* <ERPLogo size="lg" className="mx-auto mb-4" /> */}
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm p-5 ">
          <CardHeader className="text-center space-y-2 pb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome to ERP!
            </h1>
            <p className="text-mforeground">
              Create your account to start using System
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Illustration Area */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="relative">
                  <Users className="h-8 w-8 text-primary" />
                  <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
                </div>
              </div>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                  className="rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="rounded-xl border-border/50 focus:border-primary pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mforeground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90"
              >
                Create Account
              </Button>
            </form>

            {/* Terms Link */}
            <p className="text-center text-sm text-mforeground">
              By signing up, you agree to our{" "}
              <button className="text-primary hover:underline font-medium">
                Terms & Conditions
              </button>
            </p>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-mforeground">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
