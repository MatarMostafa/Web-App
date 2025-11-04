"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ConfirmEmail() {
  const { t, ready } = useTranslation();
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="border-0 shadow-xl bg-card/80 backdrop-blur-sm rounded-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("auth.invalidVerificationLink"));
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await api.verifyEmail(token);
        setStatus("success");
        setMessage(result.message || t("auth.emailVerifiedSuccessfully"));
        toast.success(t("auth.emailVerifiedSuccessfully"));
        setTimeout(() => router.push("/login"), 2000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || t("auth.verificationFailedError"));
        toast.error(t("auth.verificationFailedError"));
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                {status === "loading" && (
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                )}
                {status === "success" && (
                  <CheckCircle className="h-10 w-10 text-green-500" />
                )}
                {status === "error" && (
                  <XCircle className="h-10 w-10 text-red-500" />
                )}
              </div>
            </div>

            {status === "loading" && (
              <>
                <h1 className="text-2xl font-bold text-foreground">
                  {t("auth.verifyingEmail")}
                </h1>
                <p className="text-muted-foreground">
                  {t("auth.pleaseWaitVerifying")}
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <h1 className="text-2xl font-bold text-green-600">
                  {t("auth.emailVerified")}
                </h1>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <h1 className="text-2xl font-bold text-red-600">
                  {t("auth.verificationFailed")}
                </h1>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">
                  {t("auth.redirectingToLogin")}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-red-700">
                    {t("auth.tryAgainOrContact")}
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="block w-full text-center bg-primary text-pforeground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t("auth.backToSignUp")}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
