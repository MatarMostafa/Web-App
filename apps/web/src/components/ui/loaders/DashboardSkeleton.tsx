import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../card";
import { Skeleton } from "../skeleton";
import { Users, Bell, Calendar, MapPin, Tag, Briefcase } from "lucide-react";

const ContactCardSkeleton = () => (
  <Card className="h-68">
    <CardContent className="p-4 h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex items-center space-x-2 mt-auto">
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => {
  return (
    <div className="py-6 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Contacts Card */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-lovable-primary" />
                <CardTitle className="text-lg font-display">
                  Recent Contacts
                </CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <ContactCardSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reminders Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-lovable-accent" />
                <CardTitle className="text-lg font-display">
                  Reminders
                </CardTitle>
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-3 rounded-lg border"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Next 2 Weeks Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-display">
                Your Next 2 Weeks
              </CardTitle>
            </div>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[...Array(2)].map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, dayIndex) => (
                    <Skeleton key={dayIndex} className="h-20 w-full rounded" />
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Associated Projects Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg font-display">
                Associated Projects
              </CardTitle>
            </div>
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contacts by Location Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg font-display">
                Contacts by Location
              </CardTitle>
            </div>
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
              <div className="flex justify-center py-10">
                <Skeleton className="h-16 w-48 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags Overview Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg font-display">
                Tags Overview
              </CardTitle>
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
