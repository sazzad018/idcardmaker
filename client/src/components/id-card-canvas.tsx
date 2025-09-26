import { useEffect, useRef } from "react";
import { Teacher } from "@shared/schema";

interface IdCardCanvasProps {
  teacher: Teacher | null;
  template: string;
}

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

export default function IdCardCanvas({ teacher, template }: IdCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 320;
    canvas.height = 500;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get template colors
    const colors = templates[template as keyof typeof templates] || templates["classic-blue"];

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);

    // Draw background with rounded corners
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 12);
    ctx.fill();

    // Draw decorative elements
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.arc(canvas.width - 32, 32, 64, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(32, canvas.height - 32, 48, 0, 2 * Math.PI);
    ctx.fill();

    // Set text properties
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    // Institution header
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 70, 32, 0, 2 * Math.PI);
    ctx.fill();

    // Institution icon (graduation cap)
    ctx.fillStyle = "white";
    ctx.font = "24px FontAwesome";
    ctx.fillText("🎓", canvas.width / 2, 78);

    // Institution name
    ctx.font = "bold 18px Arial";
    ctx.fillText(teacher?.institution || "ঢাকা উচ্চ বিদ্যালয়", canvas.width / 2, 110);

    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText("শিক্ষক পরিচয়পত্র", canvas.width / 2, 130);

    // Photo placeholder
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, canvas.width / 2 - 48, 150, 96, 96, 8);
    ctx.fill();
    ctx.stroke();

    if (teacher?.photoUrl) {
      // Load and draw teacher photo
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        // Create clipping path for rounded photo
        drawRoundedRect(ctx, canvas.width / 2 - 48, 150, 96, 96, 8);
        ctx.clip();
        ctx.drawImage(img, canvas.width / 2 - 48, 150, 96, 96);
        ctx.restore();
      };
      img.src = teacher.photoUrl;
    } else {
      // Photo placeholder icon
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "48px Arial";
      ctx.fillText("👤", canvas.width / 2, 210);
    }

    // Teacher information
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(teacher?.name || "মোহাম্মদ আব্দুল করিম", canvas.width / 2, 280);

    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(teacher?.designation || "সহকারী শিক্ষক", canvas.width / 2, 300);

    // Information box
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    drawRoundedRect(ctx, 20, 320, canvas.width - 40, 100, 8);
    ctx.fill();

    // Information details
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";

    ctx.fillText("বিভাগ:", 30, 340);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(teacher?.department || "গণিত", canvas.width - 30, 340);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("আইডি:", 30, 360);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(teacher?.employeeId || "EMP001234", canvas.width - 30, 360);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("মোবাইল:", 30, 380);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(teacher?.phone || "০১৭xxxxxxxx", canvas.width - 30, 380);

    // QR Code placeholder
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width / 2 - 32, 440, 64, 64);
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("QR", canvas.width / 2, 475);

    // Date information
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "10px Arial";
    ctx.fillText("জারি তারিখ: ০১/০১/২০২৪", canvas.width / 2, 450);
    ctx.fillText("মেয়াদ: ৩১/১২/২০২৪", canvas.width / 2, 465);

  }, [teacher, template]);

  // Helper function to draw rounded rectangles
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

  return (
    <div className="w-80 h-[500px] bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl shadow-2xl relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-xl"
        data-testid="canvas-id-card"
      />
    </div>
  );
}
