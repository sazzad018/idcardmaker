import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateIdCardPNG } from "@/lib/id-card-generator";
import { Teacher } from "@shared/schema";

interface BatchTeacher {
  name: string;
  designation: string;
  department: string;
  employeeId: string;
  phone: string;
  email: string;
  institution: string;
  photoUrl?: string;
}

export default function BatchPage() {
  const [teachers, setTeachers] = useState<BatchTeacher[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("classic-blue");
  const [isGenerating, setIsGenerating] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const { toast } = useToast();

  const templateOptions = [
    { id: "classic-blue", name: "ক্লাসিক ব্লু" },
    { id: "modern-gradient", name: "আধুনিক গ্রেডিয়েন্ট" },
    { id: "nature-green", name: "প্রকৃতি সবুজ" },
    { id: "minimal-white", name: "সাদা মিনিমাল" },
    { id: "royal-red", name: "রাজকীয় লাল" },
    { id: "deep-blue", name: "গাঢ় নীল" },
    { id: "corporate-gold", name: "কর্পোরেট গোল্ড" },
    { id: "tech-purple", name: "টেক পার্পল" },
  ];

  const addTeacher = () => {
    setTeachers([...teachers, {
      name: "",
      designation: "",
      department: "",
      employeeId: "",
      phone: "",
      email: "",
      institution: ""
    }]);
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const updateTeacher = (index: number, field: keyof BatchTeacher, value: string) => {
    const updatedTeachers = teachers.map((teacher, i) => 
      i === index ? { ...teacher, [field]: value } : teacher
    );
    setTeachers(updatedTeachers);
  };

  const parseCsvInput = () => {
    const lines = csvInput.trim().split('\n');
    if (lines.length < 2) {
      toast({
        title: "ত্রুটি",
        description: "CSV ডাটাতে কমপক্ষে হেডার এবং একটি ডাটা রো থাকতে হবে",
        variant: "destructive"
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const newTeachers: BatchTeacher[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const teacher: BatchTeacher = {
        name: "",
        designation: "",
        department: "",
        employeeId: "",
        phone: "",
        email: "",
        institution: ""
      };

      headers.forEach((header, index) => {
        switch (header) {
          case 'name':
          case 'নাম':
            teacher.name = values[index];
            break;
          case 'designation':
          case 'পদবী':
            teacher.designation = values[index];
            break;
          case 'department':
          case 'বিভাগ':
            teacher.department = values[index];
            break;
          case 'employeeid':
          case 'employee_id':
          case 'কর্মচারী_আইডি':
            teacher.employeeId = values[index];
            break;
          case 'phone':
          case 'মোবাইল':
            teacher.phone = values[index];
            break;
          case 'email':
          case 'ইমেইল':
            teacher.email = values[index];
            break;
          case 'institution':
          case 'প্রতিষ্ঠান':
            teacher.institution = values[index];
            break;
        }
      });

      if (teacher.name && teacher.employeeId) {
        newTeachers.push(teacher);
      }
    }

    setTeachers(newTeachers);
    setCsvInput("");
    toast({
      title: "সফল",
      description: `${newTeachers.length}টি শিক্ষকের তথ্য লোড করা হয়েছে`,
    });
  };

  const generateBatchCards = async () => {
    if (teachers.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "কমপক্ষে একটি শিক্ষকের তথ্য প্রদান করুন",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    let successCount = 0;

    try {
      for (const teacher of teachers) {
        if (teacher.name && teacher.employeeId) {
          const teacherData: Teacher = {
            id: Date.now().toString() + Math.random(),
            template: selectedTemplate,
            createdAt: new Date(),
            ...teacher,
            designation: teacher.designation || null,
            phone: teacher.phone || null,
            institution: teacher.institution || null,
            photoUrl: teacher.photoUrl || null
          };
          
          await generateIdCardPNG(teacherData, selectedTemplate);
          successCount++;
          
          // Small delay to prevent browser freezing
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      toast({
        title: "সফল",
        description: `${successCount}টি আইডি কার্ড তৈরি এবং ডাউনলোড হয়েছে`,
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "আইডি কার্ড তৈরিতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
                <i className="fas fa-layer-group text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">ব্যাচ আইডি কার্ড তৈরি</h1>
                <p className="text-sm text-muted-foreground">একসাথে একাধিক আইডি কার্ড তৈরি করুন</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* CSV Import */}
            <Card>
              <CardHeader>
                <CardTitle>CSV ডাটা ইমপোর্ট</CardTitle>
                <CardDescription>
                  CSV ফরমেটে শিক্ষকদের তথ্য পেস্ট করুন। প্রথম লাইনে হেডার থাকতে হবে।
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="name,designation,department,employeeId,phone,email,institution&#10;মোহাম্মদ আলী,সহকারী শিক্ষক,গণিত,EMP001,01712345678,ali@school.edu,ঢাকা উচ্চ বিদ্যালয়&#10;ফাতিমা খাতুন,প্রধান শিক্ষক,প্রশাসন,EMP002,01823456789,fatima@school.edu,ঢাকা উচ্চ বিদ্যালয়"
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="min-h-32"
                  data-testid="textarea-csv-input"
                />
                <Button onClick={parseCsvInput} disabled={!csvInput.trim()} data-testid="button-parse-csv">
                  CSV পার্স করুন
                </Button>
              </CardContent>
            </Card>

            {/* Manual Input */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>শিক্ষকের তালিকা ({teachers.length}টি)</CardTitle>
                    <CardDescription>
                      ম্যানুয়ালি শিক্ষকদের তথ্য যোগ করুন
                    </CardDescription>
                  </div>
                  <Button onClick={addTeacher} variant="outline" size="sm" data-testid="button-add-teacher">
                    <i className="fas fa-plus mr-2"></i>
                    শিক্ষক যোগ করুন
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teachers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    এখনো কোন শিক্ষকের তথ্য যোগ করা হয়নি
                  </p>
                ) : (
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {teachers.map((teacher, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 relative">
                        <button
                          onClick={() => removeTeacher(index)}
                          className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 rounded-full w-8 h-8 flex items-center justify-center"
                          data-testid={`button-remove-teacher-${index}`}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                          <div>
                            <Label htmlFor={`name-${index}`}>নাম *</Label>
                            <Input
                              id={`name-${index}`}
                              value={teacher.name}
                              onChange={(e) => updateTeacher(index, 'name', e.target.value)}
                              placeholder="শিক্ষকের নাম"
                              data-testid={`input-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`designation-${index}`}>পদবী</Label>
                            <Input
                              id={`designation-${index}`}
                              value={teacher.designation}
                              onChange={(e) => updateTeacher(index, 'designation', e.target.value)}
                              placeholder="সহকারী শিক্ষক"
                              data-testid={`input-designation-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`department-${index}`}>বিভাগ</Label>
                            <Input
                              id={`department-${index}`}
                              value={teacher.department}
                              onChange={(e) => updateTeacher(index, 'department', e.target.value)}
                              placeholder="গণিত"
                              data-testid={`input-department-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`employeeId-${index}`}>কর্মচারী আইডি *</Label>
                            <Input
                              id={`employeeId-${index}`}
                              value={teacher.employeeId}
                              onChange={(e) => updateTeacher(index, 'employeeId', e.target.value)}
                              placeholder="EMP001234"
                              data-testid={`input-employeeId-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phone-${index}`}>মোবাইল</Label>
                            <Input
                              id={`phone-${index}`}
                              value={teacher.phone}
                              onChange={(e) => updateTeacher(index, 'phone', e.target.value)}
                              placeholder="01712345678"
                              data-testid={`input-phone-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`institution-${index}`}>প্রতিষ্ঠান</Label>
                            <Input
                              id={`institution-${index}`}
                              value={teacher.institution}
                              onChange={(e) => updateTeacher(index, 'institution', e.target.value)}
                              placeholder="ঢাকা উচ্চ বিদ্যালয়"
                              data-testid={`input-institution-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generation Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>টেমপ্লেট নির্বাচন</CardTitle>
                <CardDescription>
                  সব আইডি কার্ডের জন্য একটি টেমপ্লেট বেছে নিন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ব্যাচ জেনারেশন</CardTitle>
                <CardDescription>
                  একসাথে সব আইডি কার্ড তৈরি করুন
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• মোট শিক্ষক: {teachers.length}টি</p>
                  <p>• নির্বাচিত টেমপ্লেট: {templateOptions.find(t => t.id === selectedTemplate)?.name}</p>
                  <p>• প্রতিটি কার্ড আলাদা ফাইল হিসেবে ডাউনলোড হবে</p>
                </div>
                
                <Button 
                  onClick={generateBatchCards}
                  disabled={teachers.length === 0 || isGenerating}
                  className="w-full"
                  data-testid="button-generate-batch"
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      সব কার্ড ডাউনলোড করুন
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}