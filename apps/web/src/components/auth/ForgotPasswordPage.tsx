"use client";
import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, Send, Loader2, Clock } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const { t, ready } = useTranslation();
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      setIsSubmitted(true);
      setLastSentTime(Date.now());
      setCooldownTime(300); // 5 minutes
      toast.success(t("auth.resetLinkSentSuccess"));
    } catch (error: any) {
      const errorMessage = error.message || t("auth.failedToSendResetEmail");
      toast.error(errorMessage);

      // If error mentions waiting time, set cooldown
      if (errorMessage.includes("5 minutes") || errorMessage.includes("wait")) {
        setCooldownTime(300);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitted(false);
    await handleSubmit(new Event("submit") as any);
  };

  const isResendDisabled = isLoading || cooldownTime > 0;

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
                {t("auth.resetLinkSent")}
              </h1>
              <p className="text-mforeground">
                {t("auth.resetLinkSentMessage")} <strong>{email}</strong>. {t("auth.checkInboxMessage")}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-accent/20 rounded-xl p-4 text-center">
                <p className="text-sm text-foreground/80">
                  {t("auth.cantFindEmail")}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  variant="outline"
                  className={`w-full rounded-xl h-12 text-base font-medium transition-colors ${
                    isResendDisabled
                      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed hover:bg-gray-50 hover:border-gray-200"
                      : "border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("auth.sending")}
                    </>
                  ) : cooldownTime > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      {t("auth.resendIn")} {formatTime(cooldownTime)}
                    </>
                  ) : (
                    t("auth.sendAnotherLink")
                  )}
                </Button>

                {cooldownTime > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700">
                      {t("auth.pleaseWait")} {formatTime(cooldownTime)} {t("auth.beforeRequesting")}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => router.push("/login")}
                  className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90"
                >
                  {t("auth.backToSignIn")}
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
              {t("auth.forgotPasswordTitle")}
            </h1>
            <p className="text-mforeground">
              {t("auth.forgotPasswordSubtitle")}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.emailAddress")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.enterYourEmail")}
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
                    {t("auth.sending")}
                  </>
                ) : (
                  t("auth.sendResetLink")
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
                {t("auth.backToSignIn")}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
