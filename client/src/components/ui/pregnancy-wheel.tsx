import { cn } from "@/lib/utils";

interface PregnancyWheelProps {
  weeks: number;
  days?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PregnancyWheel({ weeks, days = 0, size = "md", className }: PregnancyWheelProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-48 h-48",
    lg: "w-64 h-64"
  };

  const innerSizeClasses = {
    sm: "inset-2",
    md: "inset-8",
    lg: "inset-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-2xl",
    lg: "text-3xl"
  };

  // Calculate rotation angle based on weeks (40 weeks = 360 degrees)
  const rotationAngle = (weeks / 40) * 360;

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outer wheel with gradient segments */}
      <div 
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(from 0deg, 
            hsl(187 85% 53%) 0deg 27deg,    
            hsl(24 95% 53%) 27deg 54deg,     
            hsl(262 83% 58%) 54deg 81deg,    
            hsl(142 76% 36%) 81deg 108deg,   
            hsl(187 85% 53%) 108deg 135deg,  
            hsl(24 95% 53%) 135deg 162deg,   
            hsl(262 83% 58%) 162deg 189deg,  
            hsl(142 76% 36%) 189deg 216deg,  
            hsl(187 85% 53%) 216deg 243deg,  
            hsl(24 95% 53%) 243deg 270deg,   
            hsl(262 83% 58%) 270deg 297deg,  
            hsl(142 76% 36%) 297deg 324deg,  
            hsl(187 85% 53%) 324deg 351deg,  
            hsl(24 95% 53%) 351deg 360deg)`
        }}
      />
      
      {/* Inner circle with week display */}
      <div className={cn(
        "absolute bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg",
        innerSizeClasses[size]
      )}>
        <div className="text-center">
          <div className={cn("font-bold text-purple-900", textSizeClasses[size])}>{weeks}</div>
          <div className="text-sm text-purple-700">weeks</div>
          {days > 0 && (
            <div className="text-xs text-purple-600 mt-1">{days} days</div>
          )}
        </div>
      </div>
      
      {/* Pointer indicator */}
      <div 
        className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-white rounded-full shadow-lg"
        style={{
          transform: `translateX(-50%) rotate(${rotationAngle}deg)`,
          transformOrigin: 'center bottom'
        }}
      />
    </div>
  );
}
