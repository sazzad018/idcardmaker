import { useEffect, useRef } from "react";
import { Teacher } from "@shared/schema";
import { drawIdCard } from "@/lib/id-card-generator";

interface IdCardCanvasProps {
  teacher: Teacher | null;
  template: string;
}

export default function IdCardCanvas({ teacher, template }: IdCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderCard = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = 320;
      canvas.height = 500;

      // Use the unified drawing function from the generator
      await drawIdCard(ctx, teacher, template, canvas.width, canvas.height);
    };

    renderCard();
  }, [teacher, template]);


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
