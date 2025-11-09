"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Award, Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useSkillsStore } from "@/store/skillsStore";
import { useTranslation } from "@/hooks/useTranslation";
import AddQualificationModal from "./AddQualificationModal";
import EditQualificationModal from "./EditQualificationModal";
import DeleteQualificationModal from "./DeleteQualificationModal";
import { Qualification } from "@/types/skills";

const QualificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showInactive, setShowInactive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  const [deletingQualification, setDeletingQualification] = useState<Qualification | null>(null);

  const {
    allQualifications,
    categories,
    loading,
    fetchAllQualifications,
    fetchCategories,
  } = useSkillsStore();

  useEffect(() => {
    fetchAllQualifications();
    fetchCategories();
  }, [fetchAllQualifications, fetchCategories]);

  const filteredQualifications = allQualifications.filter(qual => {
    const matchesSearch = qual.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         qual.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || qual.category === selectedCategory;
    const matchesStatus = showInactive || qual.isActive;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = [...new Set(allQualifications.map(q => q.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.qualifications.title')}</h1>
          <p className="text-muted-foreground">{t('admin.qualifications.subtitle')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.qualifications.addNew')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t('admin.qualifications.manage')} ({filteredQualifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('admin.qualifications.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">{t('admin.qualifications.allCategories')}</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => setShowInactive(!showInactive)}
              className="flex items-center gap-2"
            >
              {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showInactive ? t('admin.qualifications.hideInactive') : t('admin.qualifications.showInactive')}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">{t('admin.qualifications.loading')}</p>
            </div>
          ) : filteredQualifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('admin.qualifications.noQualifications')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQualifications.map((qualification) => (
                <div
                  key={qualification.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 ${!qualification.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{qualification.name}</h3>
                      {qualification.category && (
                        <Badge variant="outline" className="mt-1">
                          {qualification.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingQualification(qualification)}
                        className="px-2 py-1 h-8"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingQualification(qualification)}
                        className="px-2 py-1 h-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={qualification.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {qualification.isActive ? t('admin.qualifications.active') : t('admin.qualifications.inactive')}
                    </Badge>
                  </div>

                  {qualification.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {qualification.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {t('admin.qualifications.created')}: {new Date(qualification.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddQualificationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchAllQualifications();
        }}
      />

      {editingQualification && (
        <EditQualificationModal
          isOpen={!!editingQualification}
          qualification={editingQualification}
          onClose={() => setEditingQualification(null)}
          onSuccess={() => {
            setEditingQualification(null);
            fetchAllQualifications();
          }}
        />
      )}

      {deletingQualification && (
        <DeleteQualificationModal
          isOpen={!!deletingQualification}
          qualification={deletingQualification}
          onClose={() => setDeletingQualification(null)}
          onSuccess={() => {
            setDeletingQualification(null);
            fetchAllQualifications();
          }}
        />
      )}
    </div>
  );
};

export default QualificationsPage;