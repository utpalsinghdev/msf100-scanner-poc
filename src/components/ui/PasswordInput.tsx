import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { generateNumericPassword } from '@/lib/password';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showGenerate?: boolean;
  boxSize?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      boxSize = 'w-full',
      label,
      showGenerate = false,
      name,
      value,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);

    const handleGenerate = () => {
      const password = generateNumericPassword(6);
      onChange?.({
        target: { name: name ?? '', value: password },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const inputId = id ?? name;

    return (
      <div className={cn('flex flex-col gap-1.5', boxSize)}>
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </Label>
        )}
        <div className="relative">
          <input
            id={inputId}
            name={name}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            ref={ref}
            autoComplete={props.autoComplete ?? 'off'}
            className={cn(
              'flex h-11 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-900 shadow-sm transition-colors',
              'placeholder:text-slate-400',
              'hover:border-slate-300',
              'focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
              showGenerate ? 'pl-3.5 pr-[4.5rem]' : 'pl-3.5 pr-11',
              className,
            )}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1.5">
            {showGenerate && (
              <button
                type="button"
                tabIndex={-1}
                onClick={handleGenerate}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
                title="Generate 6-digit password"
                aria-label="Generate 6-digit password"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible((v) => !v)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              title={visible ? 'Hide password' : 'Show password'}
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
