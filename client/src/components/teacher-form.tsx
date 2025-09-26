import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTeacherSchema, type InsertTeacher, type Teacher } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface TeacherFormProps {
  onTeacherCreated: (teacher: Teacher) => void;
  recentTeachers: Teacher[];
}

export default function TeacherForm({ onTeacherCreated, recentTeachers }: TeacherFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTeacher>({
    resolver: zodResolver(insertTeacherSchema),
    defaultValues: {
      name: "",
      department: "",
      employeeId: "",
      designation: "",
      phone: "",
      institution: "",
      photoUrl: "",
      template: "classic-blue",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setPhotoUrl(data.photoUrl);
      form.setValue('photoUrl', data.photoUrl);
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ছবি আপলোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: InsertTeacher) => {
      const response = await apiRequest('POST', '/api/teachers', data);
      return response.json();
    },
    onSuccess: (teacher) => {
      toast({
        title: "সফল",
        description: "শিক্ষকের তথ্য সংরক্ষিত হয়েছে",
      });
      onTeacherCreated(teacher);
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "তথ্য সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadMutation.mutate(file);
    }
  };

  const onSubmit = (data: InsertTeacher) => {
    createTeacherMutation.mutate({ ...data, photoUrl });
  };

  const clearForm = () => {
    form.reset();
    setPhotoUrl("");
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <i className="fas fa-user-edit text-primary"></i>
          </div>
          <h2 className="text-lg font-semibold text-foreground">শিক্ষকের তথ্য</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">ছবি আপলোড করুন</Label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-camera text-muted-foreground text-xl"></i>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    data-testid="input-photo"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    data-testid="button-upload-photo"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {uploadMutation.isPending ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF (সর্বোচ্চ ২MB)</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>শিক্ষকের নাম *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="যেমন: মোহাম্মদ আব্দুল করিম" 
                      {...field} 
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>বিভাগ *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-department">
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="বাংলা">বাংলা</SelectItem>
                      <SelectItem value="ইংরেজি">ইংরেজি</SelectItem>
                      <SelectItem value="গণিত">গণিত</SelectItem>
                      <SelectItem value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</SelectItem>
                      <SelectItem value="রসায়ন">রসায়ন</SelectItem>
                      <SelectItem value="জীববিজ্ঞান">জীববিজ্ঞান</SelectItem>
                      <SelectItem value="ইতিহাস">ইতিহাস</SelectItem>
                      <SelectItem value="ভূগোল">ভূগোল</SelectItem>
                      <SelectItem value="রাষ্ট্রবিজ্ঞান">রাষ্ট্রবিজ্ঞান</SelectItem>
                      <SelectItem value="অর্থনীতি">অর্থনীতি</SelectItem>
                      <SelectItem value="কম্পিউটার বিজ্ঞান">কম্পিউটার বিজ্ঞান</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employee ID */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>কর্মচারী আইডি *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="যেমন: EMP001234" 
                      {...field} 
                      data-testid="input-employee-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Designation */}
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পদবী</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-designation">
                        <SelectValue placeholder="পদবী নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="প্রধান শিক্ষক">প্রধান শিক্ষক</SelectItem>
                      <SelectItem value="সহকারী প্রধান শিক্ষক">সহকারী প্রধান শিক্ষক</SelectItem>
                      <SelectItem value="সিনিয়র শিক্ষক">সিনিয়র শিক্ষক</SelectItem>
                      <SelectItem value="সহকারী শিক্ষক">সহকারী শিক্ষক</SelectItem>
                      <SelectItem value="প্রভাষক">প্রভাষক</SelectItem>
                      <SelectItem value="সহযোগী অধ্যাপক">সহযোগী অধ্যাপক</SelectItem>
                      <SelectItem value="অধ্যাপক">অধ্যাপক</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মোবাইল নম্বর</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="যেমন: ০১৭xxxxxxxx" 
                      {...field}
                      value={field.value || ""}
                      data-testid="input-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Institution */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>প্রতিষ্ঠানের নাম</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="যেমন: ঢাকা উচ্চ বিদ্যালয়" 
                      {...field}
                      value={field.value || ""}
                      data-testid="input-institution"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createTeacherMutation.isPending}
                data-testid="button-generate-card"
              >
                <i className="fas fa-magic mr-2"></i>
                {createTeacherMutation.isPending ? "তৈরি হচ্ছে..." : "আইডি কার্ড তৈরি করুন"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={clearForm}
                data-testid="button-clear-form"
              >
                <i className="fas fa-eraser mr-2"></i>
                পরিষ্কার করুন
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Recent ID Cards */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">সাম্প্রতিক আইডি কার্ড</h3>
        <div className="space-y-3">
          {recentTeachers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">এখনো কোনো আইডি কার্ড তৈরি হয়নি</p>
          ) : (
            recentTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-id-card text-primary text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid={`text-teacher-name-${teacher.id}`}>
                      {teacher.name}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-teacher-department-${teacher.id}`}>
                      {teacher.department}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onTeacherCreated(teacher)}
                  data-testid={`button-view-card-${teacher.id}`}
                >
                  <i className="fas fa-eye"></i>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
