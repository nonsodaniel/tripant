import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ hoverable, padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-surface rounded-2xl border border-border shadow-card",
        hoverable && "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150",
        padding === "none" && "p-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
