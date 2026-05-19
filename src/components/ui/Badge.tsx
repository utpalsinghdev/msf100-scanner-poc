import { cn } from "@/lib/utils";

export const enums = {
  GRAY: "GRAY",
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE",
} as const;

type BadgeType = (typeof enums)[keyof typeof enums];

const styles: Record<BadgeType, string> = {
  GRAY: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  RED: "bg-red-50 text-red-700 ring-1 ring-red-200/60 hover:bg-red-100",
  GREEN: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 hover:bg-emerald-100",
  BLUE: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60 hover:bg-indigo-100",
};

function Badge({
  children,
  type = enums.GRAY,
  className,
  ...rest
}: {
  children: React.ReactNode;
  type?: BadgeType;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        styles[type],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Badge;
