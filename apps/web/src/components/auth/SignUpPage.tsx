"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Users, Sparkles, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function SignUpPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
  });

  // Validation functions
  const validateName = (name: string) => {
    if (!name || name.length < 2) return t("auth.nameMinLength");
    if (!/^[a-zA-Z\s]+$/.test(name)) return t("auth.nameLettersOnly");
    return "";
  };

  const validateUsername = (username: string) => {
    if (!username || username.length < 3) return t("auth.usernameMinLength");
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) return t("auth.usernameInvalidChars");
    if (/\s/.test(username)) return t("auth.usernameNoSpaces");
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return t("auth.emailRequired");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t("auth.enterValidEmail");
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password || password.length < 8)
      return t("auth.passwordMinLength");
    return "";
  };

  // Check if form is valid
  const isFormValid =
    validateName(formData.name || "") === "" &&
    validateUsername(formData.userName || "") === "" &&
    validateEmail(formData.email || "") === "" &&
    (formData.password || "").length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.register({
        name: formData.name,
        email: formData.email,
        username: formData.userName,
        password: formData.password,
      });
      router.push(
        `/email-verification?email=${encodeURIComponent(formData.email)}`
      );
    } catch (error: any) {
      const errorMessage =
        error.message || t("auth.registrationFailed");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation - only show errors if user has started typing
    let error = "";
    if (value.length > 0) {
      if (field === "name") {
        error = validateName(value);
      } else if (field === "userName") {
        error = validateUsername(value);
      } else if (field === "email") {
        error = validateEmail(value);
      } else if (field === "password") {
        error = validatePassword(value);
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm p-5">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          {/* <ERPLogo size="lg" className="mx-auto mb-4" /> */}
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm p-5 ">
          <CardHeader className="text-center space-y-2 pb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {t("auth.welcomeToERP")}
            </h1>
            <p className="text-mforeground">
              {t("auth.createAccountSubtitle")}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("auth.fullName")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("auth.enterFullName")}
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      handleInputChange("name", value);
                    }}
                    className={`rounded-xl border-border/50 focus:border-primary ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName">{t("auth.username")}</Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder={t("auth.enterUsername")}
                    value={formData.userName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9._-]/g, "");
                      handleInputChange("userName", value);
                    }}
                    className={`rounded-xl border-border/50 focus:border-primary ${
                      errors.userName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.userName && (
                    <p className="text-sm text-red-500">{errors.userName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.enterEmail")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`rounded-xl border-border/50 focus:border-primary ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.createPassword")}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`rounded-xl border-border/50 focus:border-primary pr-12 ${
                      errors.password ? "border-red-500" : ""
                    }`}
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
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("auth.creatingAccount")}
                  </>
                ) : (
                  t("auth.createAccount")
                )}
              </Button>
            </form>

            {/* Terms Link */}
            <p className="text-center text-sm text-mforeground">
              {t("auth.bySigningUp")}{" "}
              <button className="text-primary hover:underline font-medium">
                {t("auth.termsConditions")}
              </button>
            </p>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-mforeground">
                {t("auth.alreadyHaveAccountQuestion")}{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-primary hover:underline font-medium"
                >
                  {t("auth.signInLink")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
