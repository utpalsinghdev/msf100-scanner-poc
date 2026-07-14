import { cn } from "@/lib/utils";
import { Label } from "./label";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string | null;
};

function Select({
  id,
  label,
  name,
  error,
  required,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <Label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </Label>
      )}
      <select
        id={id || name}
        name={name}
        required={required}
        className={cn(
          "block h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-colors",
          "hover:border-slate-300",
          "focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
          error && "border-red-300 focus:ring-red-500/20",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

export default Select;
