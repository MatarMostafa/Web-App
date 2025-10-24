"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { api } from "@/lib/api";

export default function ConfirmEmail() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await api.verifyEmail(token);
        setStatus("success");
        setMessage(result.message || "Email verified successfully!");
        toast.success("Email verified successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Verification failed");
        toast.error("Verification failed");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
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
                  Verifying Email
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <h1 className="text-2xl font-bold text-green-600">
                  Email Verified!
                </h1>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <h1 className="text-2xl font-bold text-red-600">
                  Verification Failed
                </h1>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">
                  Redirecting to login page in 2 seconds...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-red-700">
                    Please try again or contact support if the issue persists.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="block w-full text-center bg-primary text-pforeground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Back to Sign Up
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
