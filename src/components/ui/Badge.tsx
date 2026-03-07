import { clsx } from "clsx";

interface BadgeProps {
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", size = "sm", children, className }: BadgeProps) {
  const variants = {
    default: "bg-surface-secondary text-text-secondary border border-border",
    accent: "bg-accent-light text-accent",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-600",
    neutral: "bg-gray-100 text-gray-600",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
