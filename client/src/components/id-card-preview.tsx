import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Teacher } from "@shared/schema";
import IdCardCanvas from "@/components/id-card-canvas";
import { generateIdCardPNG, generateIdCardPDF } from "@/lib/id-card-generator";

interface IdCardPreviewProps {
  teacher: Teacher | null;
  template: string;
  onTemplateChange: (template: string) => void;
}


const templateDisplayInfo = [
  { id: "classic-blue", name: "ক্লাসিক ব্লু", gradient: "from-blue-600 via-purple-600 to-blue-800" },
  { id: "modern-gradient", name: "আধুনিক গ্রেডিয়েন্ট", gradient: "from-indigo-600 via-pink-600 to-purple-600" },
  { id: "nature-green", name: "প্রকৃতি সবুজ", gradient: "from-green-600 to-teal-600" },
  { id: "minimal-white", name: "সাদা মিনিমাল", gradient: "from-gray-800 to-gray-600" },
  { id: "royal-red", name: "রাজকীয় লাল", gradient: "from-red-600 to-pink-600" },
  { id: "deep-blue", name: "গাঢ় নীল", gradient: "from-indigo-600 to-blue-600" },
  { id: "corporate-gold", name: "কর্পোরেট গোল্ড", gradient: "from-yellow-600 to-orange-600" },
  { id: "tech-purple", name: "টেক পার্পল", gradient: "from-purple-600 to-violet-600" },
];

export default function IdCardPreview({ teacher, template, onTemplateChange }: IdCardPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPNG = async () => {
    if (!teacher) return;
    
    setIsGenerating(true);
    try {
      await generateIdCardPNG(teacher, template);
    } catch (error) {
      console.error("Failed to generate PNG:", error);
    }
    setIsGenerating(false);
  };

  const handleDownloadPDF = async () => {
    if (!teacher) return;
    
    setIsGenerating(true);
    try {
      await generateIdCardPDF(teacher, template);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
    setIsGenerating(false);
  };

  const selectedTemplate = templateDisplayInfo.find(t => t.id === template) || templateDisplayInfo[0];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <i className="fas fa-eye text-primary"></i>
            </div>
            <h2 className="text-lg font-semibold text-foreground">লাইভ প্রিভিউ</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" data-testid="button-mobile-view">
              <i className="fas fa-mobile-alt mr-1"></i>
              মোবাইল
            </Button>
            <Button size="sm" variant="outline" data-testid="button-desktop-view">
              <i className="fas fa-desktop mr-1"></i>
              ডেস্কটপ
            </Button>
          </div>
        </div>

        {/* ID Card Preview */}
        <div className="flex justify-center">
          <IdCardCanvas teacher={teacher} template={template} />
        </div>

        {/* Download Options */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            className="flex-1" 
            onClick={handleDownloadPNG}
            disabled={!teacher || isGenerating}
            data-testid="button-download-png"
          >
            <i className="fas fa-download mr-2"></i>
            {isGenerating ? "তৈরি হচ্ছে..." : "PNG ডাউনলোড করুন"}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleDownloadPDF}
            disabled={!teacher || isGenerating}
            data-testid="button-download-pdf"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            {isGenerating ? "তৈরি হচ্ছে..." : "PDF ডাউনলোড করুন"}
          </Button>
        </div>
      </div>

      {/* Template Options */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">টেমপ্লেট নির্বাচন</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {templateDisplayInfo.map((tmpl) => (
            <div 
              key={tmpl.id}
              className="relative cursor-pointer group"
              onClick={() => onTemplateChange(tmpl.id)}
            >
              <div className={`w-full h-24 bg-gradient-to-br ${tmpl.gradient} rounded-lg border-2 ${
                template === tmpl.id ? 'border-primary' : 'border-border'
              } shadow-sm`}></div>
              <div className={`absolute inset-0 bg-black/20 rounded-lg transition-opacity flex items-center justify-center ${
                template === tmpl.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                {template === tmpl.id && <i className="fas fa-check text-white text-xl"></i>}
              </div>
              <p className={`text-sm text-center mt-2 ${
                template === tmpl.id ? 'font-medium' : ''
              }`} data-testid={`text-template-${tmpl.id}`}>
                {tmpl.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
