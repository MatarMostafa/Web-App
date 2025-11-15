"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, X, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function ResetPasswordPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error(t("auth.invalidResetLink"));
      router.push("/forgot-password");
    }
  }, [token, router, t]);

  const passwordRequirements = [
    { text: t("auth.atLeast8Characters"), met: formData.password.length >= 8 },
    { text: t("auth.containsUppercase"), met: /[A-Z]/.test(formData.password) },
    { text: t("auth.containsLowercase"), met: /[a-z]/.test(formData.password) },
    { text: t("auth.containsNumber"), met: /\d/.test(formData.password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequirementsMet || !passwordsMatch || !token) return;

    setIsLoading(true);

    try {
      await api.resetPassword(token, formData.password);
      toast.success(t("auth.passwordResetSuccessful"));
      router.push("/login");
    } catch (error: any) {
      const errorMessage = error.message || t("auth.failedToResetPassword");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("auth.resetYourPassword")}
            </h1>
            <p className="text-mforeground">{t("auth.enterNewPasswordBelow")}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.createNewPassword")}
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

              {/* Password Requirements */}
              {formData.password && (
                <div className="bg-accent/20 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {t("auth.passwordRequirements")}
                  </p>
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-mforeground" />
                      )}
                      <span
                        className={
                          req.met ? "text-green-600" : "text-mforeground"
                        }
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmNewPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("auth.confirmYourNewPassword")}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="rounded-xl border-border/50 focus:border-primary pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mforeground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive">
                    {t("auth.passwordsDoNotMatch")}
                  </p>
                )}
                {passwordsMatch && formData.confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("auth.passwordsMatch")}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!allRequirementsMet || !passwordsMatch || isLoading}
                className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("auth.resetting")}
                  </>
                ) : (
                  t("auth.resetPasswordButton")
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-mforeground">
                {t("auth.rememberPassword")}{" "}
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
