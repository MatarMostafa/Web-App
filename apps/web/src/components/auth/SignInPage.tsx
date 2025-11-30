"use client";
import React, { useState } from "react";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage("Authenticating...");

    try {
      const result = await signIn("credentials", {
        identifier: formData.identifier,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        setLoadingMessage("Logging in to dashboard...");
        toast.success("Erfolgreich angemeldet!");

        // Wait for NextAuth to properly set session
        const session = await getSession();

        if (session?.user?.role === "ADMIN") {
          router.push("/dashboard-admin");
        } else if (session?.user?.role === "TEAM_LEADER") {
          router.push("/dashboard-team-leader");
        } else {
          router.push("/dashboard-employee");
        }
        // Don't reset loading state - let redirect handle it
        return;
      } else {
        // Handle different error cases

        // Handle specific error types
        if (result?.error === "RATE_LIMIT") {
          toast.error("Zu viele Anmeldeversuche. Bitte warten Sie, bevor Sie es erneut versuchen.");
        } else if (result?.error === "INVALID_CREDENTIALS") {
          toast.error("Ungültige E-Mail oder Passwort");
        } else if (result?.error === "CredentialsSignin") {
          toast.error("Ungültige E-Mail oder Passwort");
        } else if (result?.error && result.error.includes('blocked')) {
          toast.error(result.error);
        } else if (result?.error) {
          toast.error("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
        } else {
          toast.error("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
        }
        setIsLoading(false);
        setLoadingMessage("");
      }
    } catch (error) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
      
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          {/* <ERPLogo size="lg" className="mx-auto mb-4" /> */}
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm p-5">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Willkommen zurück</h1>
            <p className="text-mforeground">
              Melden Sie sich an, um fortzufahren
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Benutzername oder E-Mail</Label>
                <Input
                  id="identifier"
                  placeholder="Geben Sie Ihren Benutzername oder E-Mail ein"
                  value={formData.identifier}
                  onChange={(e) => handleInputChange("identifier", e.target.value)}
                  className="rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Geben Sie Ihr Passwort ein"
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Passwort vergessen?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.identifier || !formData.password}
                className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {loadingMessage || "Wird angemeldet..."}
                  </>
                ) : (
                  "Anmelden"
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-mforeground">
                Noch kein Konto?{" "}
                <button
                  onClick={() => router.push("/signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Registrieren
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}