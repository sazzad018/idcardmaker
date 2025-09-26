import { Teacher } from "@shared/schema";
import QRCode from "qrcode";

export interface IdCardTemplate {
  id: string;
  name: string;
  layout: 'classic' | 'modern' | 'minimal' | 'professional' | 'academic' | 'government' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
  };
  features: {
    hasGradient: boolean;
    hasPattern: boolean;
    hasWatermark: boolean;
    photoShape: 'square' | 'circle' | 'rounded';
    borderStyle: 'solid' | 'dashed' | 'none' | 'double';
  };
}

export const templates: { [key: string]: IdCardTemplate } = {
  "classic-blue": {
    id: "classic-blue",
    name: "ক্লাসিক ব্লু",
    layout: 'classic',
    colors: {
      primary: "#3B82F6",
      secondary: "#8B5CF6",
      accent: "#1E40AF",
    },
    features: {
      hasGradient: true,
      hasPattern: true,
      hasWatermark: false,
      photoShape: 'rounded',
      borderStyle: 'solid'
    }
  },
  "modern-gradient": {
    id: "modern-gradient",
    name: "আধুনিক গ্রেডিয়েন্ট",
    layout: 'modern',
    colors: {
      primary: "#6366F1",
      secondary: "#EC4899",
      accent: "#8B5CF6",
    },
    features: {
      hasGradient: true,
      hasPattern: false,
      hasWatermark: true,
      photoShape: 'circle',
      borderStyle: 'none'
    }
  },
  "nature-green": {
    id: "nature-green",
    name: "প্রকৃতি সবুজ",
    layout: 'academic',
    colors: {
      primary: "#059669",
      secondary: "#0D9488",
      accent: "#047857",
    },
    features: {
      hasGradient: true,
      hasPattern: true,
      hasWatermark: false,
      photoShape: 'rounded',
      borderStyle: 'solid'
    }
  },
  "minimal-white": {
    id: "minimal-white",
    name: "সাদা মিনিমাল",
    layout: 'minimal',
    colors: {
      primary: "#1F2937",
      secondary: "#6B7280",
      accent: "#9CA3AF",
      background: "#FFFFFF"
    },
    features: {
      hasGradient: false,
      hasPattern: false,
      hasWatermark: false,
      photoShape: 'square',
      borderStyle: 'solid'
    }
  },
  "royal-red": {
    id: "royal-red",
    name: "রাজকীয় লাল",
    layout: 'professional',
    colors: {
      primary: "#DC2626",
      secondary: "#EC4899",
      accent: "#B91C1C",
    },
    features: {
      hasGradient: true,
      hasPattern: true,
      hasWatermark: true,
      photoShape: 'rounded',
      borderStyle: 'double'
    }
  },
  "deep-blue": {
    id: "deep-blue",
    name: "গাঢ় নীল",
    layout: 'government',
    colors: {
      primary: "#4F46E5",
      secondary: "#3B82F6",
      accent: "#1E3A8A",
    },
    features: {
      hasGradient: true,
      hasPattern: false,
      hasWatermark: true,
      photoShape: 'rounded',
      borderStyle: 'solid'
    }
  },
  "corporate-gold": {
    id: "corporate-gold",
    name: "কর্পোরেট গোল্ড",
    layout: 'corporate',
    colors: {
      primary: "#D97706",
      secondary: "#F59E0B",
      accent: "#92400E",
    },
    features: {
      hasGradient: true,
      hasPattern: true,
      hasWatermark: true,
      photoShape: 'rounded',
      borderStyle: 'solid'
    }
  },
  "tech-purple": {
    id: "tech-purple",
    name: "টেক পার্পল",
    layout: 'modern',
    colors: {
      primary: "#7C3AED",
      secondary: "#A855F7",
      accent: "#5B21B6",
    },
    features: {
      hasGradient: true,
      hasPattern: false,
      hasWatermark: false,
      photoShape: 'circle',
      borderStyle: 'none'
    }
  }
};

export async function generateIdCardPNG(teacher: Teacher, template: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // Set high resolution for better quality
  canvas.width = 640; // 2x for better quality
  canvas.height = 1000;
  
  // Scale context for high DPI
  ctx.scale(2, 2);

  await drawIdCard(ctx, teacher, template, 320, 500);

  // Convert to blob and download
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${teacher.name}_ID_Card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

export async function generateIdCardPDF(teacher: Teacher, template: string) {
  // Note: This is a temporary implementation that generates PNG data
  // For production, consider using a dedicated PDF library like jsPDF or pdf-lib
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = 640;
  canvas.height = 1000;
  ctx.scale(2, 2);

  await drawIdCard(ctx, teacher, template, 320, 500);

  // Convert to blob and download as PNG (with .png extension for clarity)
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${teacher.name}_ID_Card_PrintReady.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

export async function drawIdCard(ctx: CanvasRenderingContext2D, teacher: Teacher | null, template: string, width: number, height: number) {
  // Early return if no teacher provided
  if (!teacher) {
    // Clear canvas and show placeholder
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("শিক্ষক তথ্য প্রদান করুন", width / 2, height / 2);
    return;
  }

  // Get template configuration
  const templateConfig = templates[template] || templates["classic-blue"];
  const colors = templateConfig.colors;
  const features = templateConfig.features;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw based on layout type
  switch (templateConfig.layout) {
    case 'modern':
      await drawModernLayout(ctx, teacher, templateConfig, width, height);
      break;
    case 'minimal':
      await drawMinimalLayout(ctx, teacher, templateConfig, width, height);
      break;
    case 'professional':
      await drawProfessionalLayout(ctx, teacher, templateConfig, width, height);
      break;
    case 'academic':
      await drawAcademicLayout(ctx, teacher, templateConfig, width, height);
      break;
    case 'government':
      await drawGovernmentLayout(ctx, teacher, templateConfig, width, height);
      break;
    case 'corporate':
      await drawCorporateLayout(ctx, teacher, templateConfig, width, height);
      break;
    default:
      await drawClassicLayout(ctx, teacher, templateConfig, width, height);
  }
}

async function drawClassicLayout(ctx: CanvasRenderingContext2D, teacher: Teacher, templateConfig: IdCardTemplate, width: number, height: number) {
  const colors = templateConfig.colors;
  const features = templateConfig.features;

  // Draw background
  if (features.hasGradient) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = colors.background || colors.primary;
  }

  drawRoundedRect(ctx, 0, 0, width, height, 12);
  ctx.fill();

  // Draw decorative patterns if enabled
  if (features.hasPattern) {
    drawDecorativePattern(ctx, width, height, "classic");
  }

  // Draw watermark if enabled
  if (features.hasWatermark) {
    drawWatermark(ctx, width, height, "classic");
  }

  // Institution header
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(width / 2, 70, 32, 0, 2 * Math.PI);
  ctx.fill();

  // Institution name and title
  ctx.fillStyle = "white";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 110);

  ctx.font = "14px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 130);

  // Draw photo
  await drawPhoto(ctx, teacher, features.photoShape, width / 2 - 48, 150, 96, 96);

  // Teacher information
  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.fillText(teacher.name, width / 2, 280);

  ctx.font = "14px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(teacher.designation || "সহকারী শিক্ষক", width / 2, 300);

  // Information box
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  drawRoundedRect(ctx, 20, 320, width - 40, 100, 8);
  ctx.fill();

  // Information details
  drawInfoSection(ctx, teacher, 30, width - 30, 340, 20);

  // QR Code
  await drawQRCode(ctx, teacher, width / 2 - 32, 440, 64);

  // Date information with expiry
  await drawDateInfo(ctx, teacher, width / 2, 450, 465);
}

async function drawModernLayout(ctx: CanvasRenderingContext2D, teacher: Teacher, templateConfig: IdCardTemplate, width: number, height: number) {
  const colors = templateConfig.colors;
  const features = templateConfig.features;

  // Modern diagonal gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.3, colors.secondary);
  gradient.addColorStop(1, colors.accent);
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.fill();

  // Modern geometric patterns
  if (features.hasPattern) {
    drawDecorativePattern(ctx, width, height, "modern");
  }

  if (features.hasWatermark) {
    drawWatermark(ctx, width, height, "modern");
  }

  // Header section with modern styling
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  drawRoundedRect(ctx, 0, 0, width, 140, 20);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 60);

  ctx.font = "16px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 85);

  // Circular photo
  await drawPhoto(ctx, teacher, 'circle', width / 2 - 50, 160, 100, 100);

  // Name with modern typography
  ctx.fillStyle = "white";
  ctx.font = "bold 24px Arial";
  ctx.fillText(teacher.name, width / 2, 290);

  ctx.font = "16px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(teacher.designation || "সহকারী শিক্ষক", width / 2, 315);

  // Modern info cards
  drawModernInfoCards(ctx, teacher, width, 340);

  // QR Code with modern styling
  await drawQRCode(ctx, teacher, width / 2 - 35, 420, 70);

  // Modern date display
  await drawDateInfo(ctx, teacher, width / 2, 410, 440);
}

async function drawMinimalLayout(ctx: CanvasRenderingContext2D, teacher: Teacher, templateConfig: IdCardTemplate, width: number, height: number) {
  const colors = templateConfig.colors;

  // Clean white/light background
  ctx.fillStyle = colors.background || "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Simple border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Minimalist header
  ctx.fillStyle = colors.primary;
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 50);

  ctx.font = "12px Arial";
  ctx.fillStyle = colors.secondary;
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 70);

  // Square photo
  await drawPhoto(ctx, teacher, 'square', width / 2 - 40, 90, 80, 80);

  // Minimal text styling
  ctx.fillStyle = colors.primary;
  ctx.font = "bold 18px Arial";
  ctx.fillText(teacher.name, width / 2, 200);

  ctx.font = "14px Arial";
  ctx.fillStyle = colors.secondary;
  ctx.fillText(teacher.designation || "সহকারী শিক্ষক", width / 2, 220);

  // Simple info layout
  drawMinimalInfo(ctx, teacher, colors, width, 250);

  // Minimal QR code
  await drawQRCode(ctx, teacher, width / 2 - 30, 380, 60);

  // Simple date
  ctx.fillStyle = colors.accent;
  ctx.font = "10px Arial";
  const currentDate = new Date();
  const expiryDate = new Date(currentDate.getFullYear() + 1, 11, 31);
  ctx.fillText(`জারি: ${formatDateBengali(currentDate)}`, width / 2, 460);
  ctx.fillText(`মেয়াদ: ${formatDateBengali(expiryDate)}`, width / 2, 475);
}

async function drawProfessionalLayout(ctx: CanvasRenderingContext2D, teacher: Teacher, templateConfig: IdCardTemplate, width: number, height: number) {
  const colors = templateConfig.colors;
  const features = templateConfig.features;

  // Professional background with subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.7, colors.secondary);
  gradient.addColorStop(1, colors.accent);
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, width, height, 12);
  ctx.fill();

  if (features.hasPattern) {
    drawDecorativePattern(ctx, width, height, "professional");
  }

  if (features.hasWatermark) {
    drawWatermark(ctx, width, height, "professional");
  }

  // Professional header with border
  if (features.borderStyle === 'double') {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.strokeRect(15, 15, width - 30, height - 30);
  }

  // Institution section
  ctx.fillStyle = "white";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 50);
  
  ctx.font = "14px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 70);

  // Professional photo placement
  await drawPhoto(ctx, teacher, features.photoShape, width / 2 - 45, 90, 90, 90);

  // Name and designation
  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.fillText(teacher.name, width / 2, 210);

  ctx.font = "16px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(teacher.designation || "সহকারী শিক্ষক", width / 2, 230);

  // Professional info layout
  drawProfessionalInfo(ctx, teacher, colors, width, 260);

  // QR Code
  await drawQRCode(ctx, teacher, width / 2 - 32, 380, 64);

  // Date info
  await drawDateInfo(ctx, teacher, width / 2, 370, 450);
}

async function drawAcademicLayout(ctx: CanvasRenderingContext2D, teacher: Teacher, templateConfig: IdCardTemplate, width: number, height: number) {
  const colors = templateConfig.colors;
  const features = templateConfig.features;

  // Academic background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.5, colors.secondary);
  gradient.addColorStop(1, colors.accent);
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, width, height, 15);
  ctx.fill();

  if (features.hasPattern) {
    drawDecorativePattern(ctx, width, height, "academic");
  }

  // Academic header with emblem
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(width / 2, 60, 30, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🎓", width / 2, 70);

  ctx.font = "bold 16px Arial";
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 100);

  ctx.font = "12px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 115);

  // Photo
  await drawPhoto(ctx, teacher, features.photoShape, width / 2 - 45, 130, 90, 90);

  // Academic info
  drawAcademicInfo(ctx, teacher, colors, width, height);

  // QR Code
  await drawQRCode(ctx, teacher, width / 2 - 30, 420, 60);
}

async function drawGovernmentLayout(ctx: CanvasRenderingContext2D, teacher: Teacher, templateConfig: IdCardTemplate, width: number, height: number) {
  const colors = templateConfig.colors;
  const features = templateConfig.features;

  // Government style background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.accent);
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, width, height, 8);
  ctx.fill();

  if (features.hasWatermark) {
    drawWatermark(ctx, width, height, "government");
  }

  // Government header
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("গণপ্রজাতন্ত্রী বাংলাদেশ সরকার", width / 2, 30);
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 50);

  ctx.font = "12px Arial";
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 70);

  // Photo with formal styling
  await drawPhoto(ctx, teacher, 'rounded', width / 2 - 40, 85, 80, 80);

  // Government info format
  drawGovernmentInfo(ctx, teacher, colors, width, height);

  // Security QR code
  await drawQRCode(ctx, teacher, width / 2 - 28, 400, 56);
}

async function drawCorporateLayout(ctx: CanvasRenderingContext2D, teacher: Teacher, templateConfig: IdCardTemplate, width: number, height: number) {
  const colors = templateConfig.colors;
  const features = templateConfig.features;

  // Corporate gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.6, colors.secondary);
  gradient.addColorStop(1, colors.accent);
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, width, height, 18);
  ctx.fill();

  if (features.hasPattern) {
    drawDecorativePattern(ctx, width, height, "corporate");
  }

  if (features.hasWatermark) {
    drawWatermark(ctx, width, height, "corporate");
  }

  // Corporate branding area
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  drawRoundedRect(ctx, 15, 15, width - 30, 100, 12);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 50);

  ctx.font = "14px Arial";
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 70);

  // Professional photo
  await drawPhoto(ctx, teacher, 'rounded', width / 2 - 50, 130, 100, 100);

  // Corporate info styling
  drawCorporateInfo(ctx, teacher, colors, width, height);

  // Corporate QR
  await drawQRCode(ctx, teacher, width / 2 - 35, 410, 70);
}

// Helper functions
async function drawPhoto(ctx: CanvasRenderingContext2D, teacher: Teacher, shape: 'square' | 'circle' | 'rounded', x: number, y: number, w: number, h: number) {
  // Draw placeholder background
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(x + w/2, y + h/2, w/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'square') {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  } else {
    // rounded
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
  }

  // Load and draw photo if available
  if (teacher.photoUrl) {
    try {
      const img = await loadImage(teacher.photoUrl);
      ctx.save();
      
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, w/2, 0, 2 * Math.PI);
        ctx.clip();
      } else if (shape === 'rounded') {
        drawRoundedRect(ctx, x, y, w, h, 8);
        ctx.clip();
      } else {
        ctx.rect(x, y, w, h);
        ctx.clip();
      }
      
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    } catch (error) {
      console.error("Failed to load teacher photo:", error);
      drawUserIcon(ctx, x + w/2, y + h/2);
    }
  } else {
    drawUserIcon(ctx, x + w/2, y + h/2);
  }
}

async function drawQRCode(ctx: CanvasRenderingContext2D, teacher: Teacher, x: number, y: number, size: number) {
  try {
    // Generate QR code data with teacher info
    const qrData = JSON.stringify({
      id: teacher.employeeId,
      name: teacher.name,
      institution: teacher.institution,
      department: teacher.department,
      issued: new Date().toISOString(),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Generate QR code image
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const qrImg = await loadImage(qrDataUrl);
    ctx.drawImage(qrImg, x, y, size, size);
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    // Fallback to placeholder
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#666";
    ctx.font = `${size/4}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("QR", x + size/2, y + size/2 + size/8);
  }
}

// Pattern and decoration functions
function drawDecorativePattern(ctx: CanvasRenderingContext2D, width: number, height: number, style: string) {
  ctx.globalAlpha = 0.1;
  
  switch (style) {
    case 'classic':
      drawCircularPatterns(ctx, width, height);
      break;
    case 'modern':
      drawGeometricPatterns(ctx, width, height);
      break;
    case 'professional':
      drawLinePatterns(ctx, width, height);
      break;
    case 'academic':
      drawAcademicSymbols(ctx, width, height);
      break;
    case 'corporate':
      drawCorporatePatterns(ctx, width, height);
      break;
  }
  
  ctx.globalAlpha = 1;
}

function drawCircularPatterns(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.arc(width - 32, 32, 64, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(32, height - 32, 48, 0, 2 * Math.PI);
  ctx.fill();
}

function drawGeometricPatterns(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  
  // Triangular patterns
  for (let i = 0; i < 5; i++) {
    const x = (width / 5) * i;
    const y = height - 50;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20, y + 30);
    ctx.lineTo(x - 20, y + 30);
    ctx.closePath();
    ctx.fill();
  }
}

function drawLinePatterns(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  
  for (let i = 0; i < width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
}

function drawAcademicSymbols(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  
  const symbols = ["📚", "✏️", "📝", "🎓"];
  for (let i = 0; i < 4; i++) {
    const x = (width / 5) * (i + 1);
    const y = height - 40;
    ctx.fillText(symbols[i], x, y);
  }
}

function drawCorporatePatterns(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  
  // Hexagonal patterns
  const hexSize = 15;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 50 + col * 30;
      const y = height - 100 + row * 25;
      drawHexagon(ctx, x, y, hexSize);
    }
  }
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(hx, hy);
    } else {
      ctx.lineTo(hx, hy);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, style: string) {
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = "white";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 4);
  
  switch (style) {
    case 'government':
      ctx.fillText("সরকারি", 0, 0);
      break;
    case 'professional':
      ctx.fillText("প্রফেশনাল", 0, 0);
      break;
    case 'modern':
      ctx.fillText("আধুনিক", 0, 0);
      break;
    case 'corporate':
      ctx.fillText("কর্পোরেট", 0, 0);
      break;
    default:
      ctx.fillText("অফিসিয়াল", 0, 0);
  }
  
  ctx.restore();
}

// Info section functions
function drawInfoSection(ctx: CanvasRenderingContext2D, teacher: Teacher, leftX: number, rightX: number, y: number, lineHeight: number) {
  drawInfoLine(ctx, "বিভাগ:", teacher.department, leftX, rightX, y);
  drawInfoLine(ctx, "আইডি:", teacher.employeeId, leftX, rightX, y + lineHeight);
  drawInfoLine(ctx, "মোবাইল:", teacher.phone || "N/A", leftX, rightX, y + lineHeight * 2);
}

function drawProfessionalInfo(ctx: CanvasRenderingContext2D, teacher: Teacher, colors: any, width: number, y: number) {
  // Professional info box with better styling
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  drawRoundedRect(ctx, 20, y, width - 40, 90, 10);
  ctx.fill();
  
  const leftX = 35;
  const rightX = width - 35;
  const lineHeight = 18;
  
  drawInfoLine(ctx, "বিভাগ:", teacher.department, leftX, rightX, y + 20);
  drawInfoLine(ctx, "কর্মচারী আইডি:", teacher.employeeId, leftX, rightX, y + 20 + lineHeight);
  drawInfoLine(ctx, "যোগাযোগ:", teacher.phone || "N/A", leftX, rightX, y + 20 + lineHeight * 2);
  drawInfoLine(ctx, "প্রতিষ্ঠান:", teacher.institution || "N/A", leftX, rightX, y + 20 + lineHeight * 3);
}

function drawAcademicInfo(ctx: CanvasRenderingContext2D, teacher: Teacher, colors: any, width: number, height: number) {
  // Academic information layout
  ctx.fillStyle = "white";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.name, width / 2, 250);
  
  ctx.font = "14px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(teacher.designation || "সহকারী শিক্ষক", width / 2, 270);
  
  // Academic details box
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  drawRoundedRect(ctx, 25, 290, width - 50, 100, 8);
  ctx.fill();
  
  const leftX = 40;
  const rightX = width - 40;
  const infoY = 310;
  
  drawInfoLine(ctx, "বিষয়:", teacher.department, leftX, rightX, infoY);
  drawInfoLine(ctx, "শিক্ষক আইডি:", teacher.employeeId, leftX, rightX, infoY + 20);
  drawInfoLine(ctx, "মোবাইল:", teacher.phone || "N/A", leftX, rightX, infoY + 40);
  drawInfoLine(ctx, "ইমেইল:", "N/A", leftX, rightX, infoY + 60);
}

function drawGovernmentInfo(ctx: CanvasRenderingContext2D, teacher: Teacher, colors: any, width: number, height: number) {
  // Government format information
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.name, width / 2, 190);
  
  ctx.font = "12px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(teacher.designation || "সহকারী শিক্ষক", width / 2, 210);
  
  // Government info table
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  drawRoundedRect(ctx, 20, 230, width - 40, 120, 6);
  ctx.fill();
  
  const leftX = 30;
  const rightX = width - 30;
  let infoY = 250;
  const lineHeight = 18;
  
  drawInfoLine(ctx, "বিভাগ/বিষয়:", teacher.department, leftX, rightX, infoY);
  drawInfoLine(ctx, "কর্মচারী আইডি:", teacher.employeeId, leftX, rightX, infoY + lineHeight);
  drawInfoLine(ctx, "যোগদানের তারিখ:", "০১/০১/২০২০", leftX, rightX, infoY + lineHeight * 2);
  drawInfoLine(ctx, "পদবি:", teacher.designation || "সহকারী শিক্ষক", leftX, rightX, infoY + lineHeight * 3);
  drawInfoLine(ctx, "মোবাইল:", teacher.phone || "N/A", leftX, rightX, infoY + lineHeight * 4);
}

function drawCorporateInfo(ctx: CanvasRenderingContext2D, teacher: Teacher, colors: any, width: number, height: number) {
  // Corporate employee information
  ctx.fillStyle = "white";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(teacher.name, width / 2, 260);
  
  ctx.font = "16px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(teacher.designation || "সহকারী শিক্ষক", width / 2, 280);
  
  // Corporate info cards
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  drawRoundedRect(ctx, 25, 300, width - 50, 80, 12);
  ctx.fill();
  
  const leftX = 40;
  const rightX = width - 40;
  const infoY = 325;
  
  drawInfoLine(ctx, "ডিপার্টমেন্ট:", teacher.department, leftX, rightX, infoY);
  drawInfoLine(ctx, "এমপ্লয়ি আইডি:", teacher.employeeId, leftX, rightX, infoY + 20);
  drawInfoLine(ctx, "কন্টাক্ট:", teacher.phone || "N/A", leftX, rightX, infoY + 40);
}

function drawModernInfoCards(ctx: CanvasRenderingContext2D, teacher: Teacher, width: number, y: number) {
  const cardWidth = (width - 60) / 3;
  const cardHeight = 50;
  const spacing = 10;
  
  const info = [
    { label: "বিভাগ", value: teacher.department },
    { label: "আইডি", value: teacher.employeeId },
    { label: "মোবাইল", value: teacher.phone || "N/A" }
  ];
  
  info.forEach((item, index) => {
    const x = 20 + (cardWidth + spacing) * index;
    
    // Card background
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 8);
    ctx.fill();
    
    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(item.label, x + cardWidth/2, y + 15);
    
    // Value
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.fillText(item.value, x + cardWidth/2, y + 35);
  });
}

function drawMinimalInfo(ctx: CanvasRenderingContext2D, teacher: Teacher, colors: any, width: number, y: number) {
  const info = [
    { label: "বিভাগ:", value: teacher.department },
    { label: "আইডি:", value: teacher.employeeId },
    { label: "মোবাইল:", value: teacher.phone || "N/A" }
  ];
  
  ctx.font = "12px Arial";
  ctx.textAlign = "left";
  
  info.forEach((item, index) => {
    const lineY = y + (index * 20);
    
    ctx.fillStyle = colors.secondary;
    ctx.fillText(item.label, 50, lineY);
    
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(item.value, width - 50, lineY);
    
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
  });
}

async function drawDateInfo(ctx: CanvasRenderingContext2D, teacher: Teacher, x: number, issuedY: number, expiryY: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  
  const currentDate = new Date();
  const expiryDate = new Date(currentDate.getFullYear() + 1, 11, 31);
  
  ctx.fillText(`জারি তারিখ: ${formatDateBengali(currentDate)}`, x, issuedY);
  ctx.fillText(`মেয়াদ: ${formatDateBengali(expiryDate)}`, x, expiryY);
}

function formatDateBengali(date: Date): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const day = date.getDate().toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('');
  const month = (date.getMonth() + 1).toString().padStart(2, '0').split('').map(d => bengaliNumerals[parseInt(d)]).join('');
  const year = date.getFullYear().toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('');
  
  return `${day}/${month}/${year}`;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawUserIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("👤", x, y);
}

function drawInfoLine(ctx: CanvasRenderingContext2D, label: string, value: string, leftX: number, rightX: number, y: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "12px Arial";
  ctx.textAlign = "left";
  ctx.fillText(label, leftX, y);
  
  ctx.fillStyle = "white";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "right";
  ctx.fillText(value, rightX, y);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
