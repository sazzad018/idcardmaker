import { Teacher } from "@shared/schema";

const templates = {
  "classic-blue": {
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    accent: "#1E40AF",
  },
  "nature-green": {
    primary: "#059669",
    secondary: "#0D9488",
    accent: "#047857",
  },
  "royal-red": {
    primary: "#DC2626",
    secondary: "#EC4899",
    accent: "#B91C1C",
  },
  "deep-blue": {
    primary: "#4F46E5",
    secondary: "#3B82F6",
    accent: "#1E3A8A",
  },
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
  // For PDF generation, we'll use the same canvas approach but convert to PDF
  // This is a simplified version - in production, you might want to use a dedicated PDF library
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = 640;
  canvas.height = 1000;
  ctx.scale(2, 2);

  await drawIdCard(ctx, teacher, template, 320, 500);

  // Convert canvas to image data URL
  const imgData = canvas.toDataURL("image/png");
  
  // Create a simple PDF-like download (in reality, you'd use jsPDF or similar)
  const link = document.createElement("a");
  link.href = imgData;
  link.download = `${teacher.name}_ID_Card.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function drawIdCard(ctx: CanvasRenderingContext2D, teacher: Teacher, template: string, width: number, height: number) {
  // Get template colors
  const colors = templates[template as keyof typeof templates] || templates["classic-blue"];

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.5, colors.secondary);
  gradient.addColorStop(1, colors.accent);

  // Draw background with rounded corners
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, width, height, 12);
  ctx.fill();

  // Draw decorative elements
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.arc(width - 32, 32, 64, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(32, height - 32, 48, 0, 2 * Math.PI);
  ctx.fill();

  // Set text properties
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  // Institution header
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(width / 2, 70, 32, 0, 2 * Math.PI);
  ctx.fill();

  // Institution name
  ctx.fillStyle = "white";
  ctx.font = "bold 18px Arial";
  ctx.fillText(teacher.institution || "ঢাকা উচ্চ বিদ্যালয়", width / 2, 110);

  ctx.font = "14px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("শিক্ষক পরিচয়পত্র", width / 2, 130);

  // Photo placeholder
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, width / 2 - 48, 150, 96, 96, 8);
  ctx.fill();
  ctx.stroke();

  // Load and draw photo if available
  if (teacher.photoUrl) {
    try {
      const img = await loadImage(teacher.photoUrl);
      ctx.save();
      drawRoundedRect(ctx, width / 2 - 48, 150, 96, 96, 8);
      ctx.clip();
      ctx.drawImage(img, width / 2 - 48, 150, 96, 96);
      ctx.restore();
    } catch (error) {
      console.error("Failed to load teacher photo:", error);
      drawUserIcon(ctx, width / 2, 210);
    }
  } else {
    drawUserIcon(ctx, width / 2, 210);
  }

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
  const infoY = 340;
  const lineHeight = 20;

  drawInfoLine(ctx, "বিভাগ:", teacher.department, 30, width - 30, infoY);
  drawInfoLine(ctx, "আইডি:", teacher.employeeId, 30, width - 30, infoY + lineHeight);
  drawInfoLine(ctx, "মোবাইল:", teacher.phone || "N/A", 30, width - 30, infoY + lineHeight * 2);

  // QR Code placeholder
  ctx.fillStyle = "white";
  ctx.fillRect(width / 2 - 32, 440, 64, 64);
  ctx.fillStyle = "#666";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("QR", width / 2, 475);

  // Date information
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "10px Arial";
  ctx.fillText("জারি তারিখ: ০১/০১/২০২৪", width / 2, 450);
  ctx.fillText("মেয়াদ: ৩১/১২/২০২৪", width / 2, 465);
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
