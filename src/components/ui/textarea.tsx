import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label className="text-sm font-medium text-slate-700">{label}</Label>
        )}
        <textarea
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors",
            "placeholder:text-slate-400",
            "hover:border-slate-300",
            "focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
