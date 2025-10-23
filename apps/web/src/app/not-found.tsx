/**
 * 404 Not Found Page
 * Custom 404 page for the MeetMe application
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8">
          {/* 404 Illustration */}
          <div className="text-9xl font-bold text-primary mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might
            have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/" className="block">
            <Button size="lg" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            You might be looking for:
          </p>
          <div className="space-y-2">
            <Link
              href="/login"
              className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
