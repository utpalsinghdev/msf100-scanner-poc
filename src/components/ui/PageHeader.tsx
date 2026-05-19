import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="w-full shrink-0 sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
