import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Teacher, InsertTeacher } from "@shared/schema";

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<InsertTeacher>>({});
  const { toast } = useToast();

  const { data: teachers = [] as Teacher[], isLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTeacher> }) => {
      return await apiRequest("PATCH", `/api/teachers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsEditDialogOpen(false);
      toast({
        title: "সফল",
        description: "শিক্ষকের তথ্য আপডেট করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "শিক্ষকের তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "সফল",
        description: "শিক্ষক ডিলিট করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "শিক্ষক ডিলিট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const filteredTeachers = teachers.filter((teacher: Teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (teacher.institution?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditData({
      name: teacher.name,
      department: teacher.department,
      employeeId: teacher.employeeId,
      designation: teacher.designation || "",
      phone: teacher.phone || "",
      institution: teacher.institution || "",
      photoUrl: teacher.photoUrl || "",
      template: teacher.template || "classic-blue",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (teacherId: string) => {
    deleteMutation.mutate(teacherId);
  };

  const handleUpdate = () => {
    if (!selectedTeacher) return;
    updateMutation.mutate({ id: selectedTeacher.id, data: editData });
  };

  const handleEditDataChange = (field: keyof InsertTeacher, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "তারিখ নেই";
    return new Date(date).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p className="text-muted-foreground">ডাটা লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <button className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <i className="fas fa-arrow-left text-primary-foreground text-sm"></i>
                </button>
              </Link>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">শিক্ষক ডাটাবেস</h1>
                <p className="text-sm text-muted-foreground">শিক্ষকদের তথ্য ব্যবস্থাপনা</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            <Label htmlFor="search">শিক্ষক অনুসন্ধান</Label>
            <Input
              id="search"
              type="text"
              placeholder="নাম, কর্মচারী আইডি, বিভাগ, পদবী বা প্রতিষ্ঠান দিয়ে অনুসন্ধান করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
              data-testid="input-search"
            />
          </div>
          <div className="flex items-end">
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{filteredTeachers.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "খুঁজে পাওয়া গেছে" : "মোট শিক্ষক"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-search text-6xl text-muted-foreground mb-4"></i>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "কোন শিক্ষক পাওয়া যায়নি" : "কোন শিক্ষক নেই"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `"${searchTerm}" এর জন্য কোন শিক্ষকের তথ্য পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।`
                : "এখনও কোন শিক্ষক যোগ করা হয়নি। নতুন শিক্ষক যোগ করুন।"
              }
            </p>
            <Link href="/">
              <Button data-testid="button-add-first">
                <i className="fas fa-plus mr-2"></i>
                নতুন শিক্ষক যোগ করুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher: Teacher) => (
              <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {teacher.photoUrl ? (
                        <img 
                          src={teacher.photoUrl} 
                          alt={teacher.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-primary"></i>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{teacher.name}</CardTitle>
                        <CardDescription>{teacher.employeeId}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">পদবী:</span>
                      <span>{teacher.designation || "উল্লেখ নেই"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">বিভাগ:</span>
                      <span>{teacher.department}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">প্রতিষ্ঠান:</span>
                      <span>{teacher.institution || "উল্লেখ নেই"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">মোবাইল:</span>
                      <span>{teacher.phone || "উল্লেখ নেই"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">যোগ হয়েছে:</span>
                      <span>{formatDate(teacher.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(teacher)}
                      data-testid={`button-edit-${teacher.id}`}
                    >
                      <i className="fas fa-edit mr-2"></i>
                      সম্পাদনা
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          data-testid={`button-delete-${teacher.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>শিক্ষক ডিলিট করুন</AlertDialogTitle>
                          <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে আপনি <strong>{teacher.name}</strong> কে ডিলিট করতে চান? 
                            এই ক্রিয়া পূর্বাবস্থায় ফেরানো যাবে না।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(teacher.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            ডিলিট করুন
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>শিক্ষকের তথ্য সম্পাদনা</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">নাম *</Label>
              <Input
                id="edit-name"
                value={editData.name || ""}
                onChange={(e) => handleEditDataChange("name", e.target.value)}
                placeholder="শিক্ষকের নাম"
                data-testid="input-edit-name"
              />
            </div>
            <div>
              <Label htmlFor="edit-employeeId">কর্মচারী আইডি *</Label>
              <Input
                id="edit-employeeId"
                value={editData.employeeId || ""}
                onChange={(e) => handleEditDataChange("employeeId", e.target.value)}
                placeholder="EMP001234"
                data-testid="input-edit-employeeId"
              />
            </div>
            <div>
              <Label htmlFor="edit-designation">পদবী</Label>
              <Input
                id="edit-designation"
                value={editData.designation || ""}
                onChange={(e) => handleEditDataChange("designation", e.target.value)}
                placeholder="সহকারী শিক্ষক"
                data-testid="input-edit-designation"
              />
            </div>
            <div>
              <Label htmlFor="edit-department">বিভাগ *</Label>
              <Input
                id="edit-department"
                value={editData.department || ""}
                onChange={(e) => handleEditDataChange("department", e.target.value)}
                placeholder="গণিত"
                data-testid="input-edit-department"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">মোবাইল</Label>
              <Input
                id="edit-phone"
                value={editData.phone || ""}
                onChange={(e) => handleEditDataChange("phone", e.target.value)}
                placeholder="01712345678"
                data-testid="input-edit-phone"
              />
            </div>
            <div>
              <Label htmlFor="edit-institution">প্রতিষ্ঠান</Label>
              <Input
                id="edit-institution"
                value={editData.institution || ""}
                onChange={(e) => handleEditDataChange("institution", e.target.value)}
                placeholder="ঢাকা উচ্চ বিদ্যালয়"
                data-testid="input-edit-institution"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                বাতিল
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}