import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import TeacherForm from "@/components/teacher-form";
import IdCardPreview from "@/components/id-card-preview";
import { Teacher } from "@shared/schema";

export default function Home() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("classic-blue");

  const { data: recentTeachers = [] as Teacher[] } = useQuery({
    queryKey: ["/api/teachers/recent"],
  });

  const { data: stats = {} as any } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-id-card text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">শিক্ষক আইডি কার্ড জেনারেটর</h1>
                <p className="text-sm text-muted-foreground">সহজেই আইডি কার্ড তৈরি করুন</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/teachers">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors"
                  data-testid="link-teachers"
                >
                  <i className="fas fa-users mr-2"></i>
                  শিক্ষক ডাটাবেস
                </button>
              </Link>
              <Link href="/batch">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors"
                  data-testid="link-batch"
                >
                  <i className="fas fa-layer-group mr-2"></i>
                  ব্যাচ প্রসেসিং
                </button>
              </Link>
              <button className="inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors">
                <i className="fas fa-history mr-2"></i>
                ইতিহাস
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                <i className="fas fa-cog mr-2"></i>
                সেটিংস
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TeacherForm 
            onTeacherCreated={setSelectedTeacher}
            recentTeachers={recentTeachers as Teacher[]}
          />
          <IdCardPreview 
            teacher={selectedTeacher}
            template={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">মোট আইডি কার্ড</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-cards">
                  {stats.totalCards || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-id-card text-primary"></i>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">আজকে তৈরি</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-today-cards">
                  {stats.todayCards || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar-day text-primary"></i>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">সক্রিয় শিক্ষক</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-teachers">
                  {stats.activeTeachers || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary"></i>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">গড় সময়</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-avg-time">
                  {stats.avgTime || "২.৫সে"}
                </p>
              </div>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
