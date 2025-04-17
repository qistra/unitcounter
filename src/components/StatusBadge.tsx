
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "success" | "error" | "processing";
  text: string;
  className?: string;
}

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-green-100 text-green-800": status === "success",
          "bg-red-100 text-red-800": status === "error",
          "bg-blue-100 text-blue-800": status === "processing",
        },
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full mr-1.5", {
          "bg-green-400": status === "success",
          "bg-red-400": status === "error",
          "bg-blue-400": status === "processing",
        })}
      ></span>
      {text}
    </span>
  );
}
