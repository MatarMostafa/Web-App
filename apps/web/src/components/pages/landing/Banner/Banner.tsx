"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Users2, Database } from "lucide-react";

const Banner = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left side - Hero text */}
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Enterprise Resource Planning{" "}
              <span className="text-blue-600">Simplified</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your business operations with our comprehensive ERP
              solution. Manage resources, track performance, and make
              data-driven decisions all in one place.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="#features"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Right side - Feature highlights */}
          <div className="lg:w-1/2">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <BarChart2 className="h-8 w-8 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Performance Tracking
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Monitor KPIs and employee performance with real-time analytics
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <Users2 className="h-8 w-8 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Employee Management
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Streamline HR processes and team collaboration
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <Database className="h-8 w-8 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Resource Planning
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Optimize resource allocation and project management
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <BarChart2 className="h-8 w-8 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Analytics Dashboard
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Make data-driven decisions with comprehensive insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
