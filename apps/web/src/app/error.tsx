/**
 * Global Error Boundary
 * Handles unexpected errors in the application
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);

    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full text-center px-6">
        <div className="mb-8">
          {/* Error Icon */}
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            We encountered an unexpected error. Don't worry, our team has been
            notified and is working on a fix.
          </p>
        </div>

        {/* Error Details in Development */}
        {isDevelopment && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="font-semibold text-red-800 mb-2">
              Error Details (Development Only):
            </h3>
            <p className="text-sm text-red-700 font-mono">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <Button onClick={reset} size="lg" className="w-full">
            Try Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            If this problem persists, please contact support:
          </p>
          <div className="space-y-2">
            <a
              href="mailto:support@meetme.com"
              className="block text-sm text-primary hover:text-primary/80 transition-colors"
            >
              support@erp.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
