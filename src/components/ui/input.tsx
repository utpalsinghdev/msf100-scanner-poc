import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  isError?: boolean;
  errorText?: string;
  boxSize?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, boxSize = "w-full", type, label, isError, errorText, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col items-start gap-1.5", boxSize)}>
        {label && (
          <Label className="text-sm font-medium text-slate-700">{label}</Label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-colors",
            "placeholder:text-slate-400",
            "hover:border-slate-300",
            "focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
            isError && "border-red-300 focus-visible:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {isError && errorText && (
          <p className="text-xs font-medium text-red-600">{errorText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
