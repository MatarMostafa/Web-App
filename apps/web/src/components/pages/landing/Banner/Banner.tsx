"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Users2, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from '@/hooks/useTranslation';

const Banner = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <div className="bg-linear-to-b from-gray-50 to-white min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left side - Hero text */}
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {t('landing.hero.title')}{" "}
              <span className="text-gray-600">{t('landing.hero.titleHighlight')}</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t('landing.hero.subtitle')}
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button
                onClick={() => router.push("/login")}
                className="bg-gray-600 hover:bg-gray-700"
              >
                {t('landing.hero.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="#features"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {t('landing.hero.learnMore')} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Right side - Feature highlights */}
          <div className="lg:w-1/2">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <BarChart2 className="h-8 w-8 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t('landing.features.performanceTracking.title')}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {t('landing.features.performanceTracking.description')}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <Users2 className="h-8 w-8 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t('landing.features.employeeManagement.title')}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {t('landing.features.employeeManagement.description')}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <Database className="h-8 w-8 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t('landing.features.resourcePlanning.title')}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {t('landing.features.resourcePlanning.description')}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-center gap-4">
                  <BarChart2 className="h-8 w-8 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t('landing.features.analyticsDashboard.title')}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {t('landing.features.analyticsDashboard.description')}
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
