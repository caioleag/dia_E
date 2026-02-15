import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const sizeClass = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-24 h-24 text-xl",
};

export default function Avatar({
  src,
  alt,
  size = "md",
  className,
}: AvatarProps) {
  const px = sizeMap[size];
  const initial = alt?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex-shrink-0",
        "bg-gradient-brand p-[2px]",
        sizeClass[size],
        className
      )}
      role="img"
      aria-label={alt}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-bg-elevated flex items-center justify-center">
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={px}
            height={px}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <span className="font-sans font-semibold text-text-primary">
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}
