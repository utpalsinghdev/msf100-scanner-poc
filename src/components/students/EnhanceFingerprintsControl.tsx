import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const ENHANCE_PASS_OPTIONS = [2, 5, 10] as const;
export type EnhancePasses = (typeof ENHANCE_PASS_OPTIONS)[number];

type LegacyProps = {
  mode?: 'legacy';
  onEnhance: (passes: EnhancePasses) => Promise<void>;
  disabled?: boolean;
};

type AdvancedProps = {
  mode: 'advanced';
  onEnhance: () => Promise<void>;
  disabled?: boolean;
};

type Props = LegacyProps | AdvancedProps;

export default function EnhanceFingerprintsControl(props: Props) {
  const { disabled } = props;
  const isAdvanced = props.mode === 'advanced';
  const [open, setOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [running, setRunning] = useState(false);

  const passes = ENHANCE_PASS_OPTIONS[sliderIndex];

  async function handleRun() {
    setRunning(true);
    try {
      if (isAdvanced) {
        await props.onEnhance();
      } else {
        await props.onEnhance(passes);
      }
      setOpen(false);
    } finally {
      setRunning(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" disabled={disabled || running} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {running
            ? 'Enhancing…'
            : isAdvanced
              ? 'Enhance fingerprints (AI)'
              : 'Enhance fingerprints'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900">
              {isAdvanced ? 'AI enhancement pipeline' : 'Enhance fingerprints'}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              {isAdvanced
                ? 'Python service: contrast, denoise, 4× upscale, ridge cleanup. Original + enhanced saved in uploads/.'
                : 'Choose intensity. Higher values run more enhancement passes on each print.'}
            </p>
          </div>

          {!isAdvanced && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Intensity</span>
                <span className="font-bold text-indigo-600">{passes}x</span>
              </div>
              <input
                type="range"
                min={0}
                max={ENHANCE_PASS_OPTIONS.length - 1}
                step={1}
                value={sliderIndex}
                onChange={(e) => setSliderIndex(Number(e.target.value))}
                disabled={running}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs font-medium text-slate-500">
                {ENHANCE_PASS_OPTIONS.map((n) => (
                  <span
                    key={n}
                    className={passes === n ? 'text-indigo-600' : undefined}
                  >
                    {n}x
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button
            type="button"
            className="w-full gap-2"
            disabled={running}
            onClick={handleRun}
          >
            <Sparkles className="h-4 w-4" />
            {isAdvanced ? 'Run AI enhancement' : `Run ${passes}x enhancement`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
