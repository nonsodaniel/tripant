import { forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full h-10 rounded-xl border border-border bg-surface text-text-primary text-sm",
              "placeholder:text-text-tertiary",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
              "transition-all duration-150",
              icon && "pl-9",
              rightElement && "pr-10",
              !icon && "pl-3",
              error && "border-red-400 focus:ring-red-400",
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
