import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import Api from '@/lib/api';
import toast from 'react-hot-toast';
import { fingerprintImageSrc } from '@/lib/fingerprintImage';
import {
  adjustmentsFilter,
  DEFAULT_IMAGE_ADJUSTMENTS,
  renderAdjustedImageBase64,
  type ImageAdjustments,
} from '@/lib/applyImageAdjustments';
import {
  DEFAULT_CLIPART_SETTINGS,
  renderClipartBase64,
  type ClipartSettings,
} from '@/lib/clipartFingerprint';
import { cn } from '@/lib/utils';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export type FingerKey =
  | 'finger1'
  | 'finger2'
  | 'finger3'
  | 'finger4'
  | 'finger5';

type EditorMode = 'adjust' | 'clipart';

type Props = {
  open: boolean;
  onClose: () => void;
  studentId: string;
  fingerKey: FingerKey;
  fingerLabel: string;
  imageBase64: string;
  onSaved: (fingerKey: FingerKey, imageBase64: string) => void;
};

function AdjustmentSlider({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold tabular-nums text-indigo-600">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 disabled:opacity-50"
      />
    </div>
  );
}

export default function FingerprintEditorModal({
  open,
  onClose,
  studentId,
  fingerKey,
  fingerLabel,
  imageBase64,
  onSaved,
}: Props) {
  const [mode, setMode] = useState<EditorMode>('adjust');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(
    DEFAULT_IMAGE_ADJUSTMENTS,
  );
  const [clipartSettings, setClipartSettings] = useState<ClipartSettings>(
    DEFAULT_CLIPART_SETTINGS,
  );
  const [clipartPreview, setClipartPreview] = useState<string | null>(null);
  const [clipartLoading, setClipartLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('adjust');
      setAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
      setClipartSettings(DEFAULT_CLIPART_SETTINGS);
      setClipartPreview(null);
    }
  }, [open, imageBase64]);

  useEffect(() => {
    if (!open || mode !== 'clipart') return;

    let cancelled = false;
    setClipartLoading(true);

    const timer = window.setTimeout(() => {
      renderClipartBase64(imageBase64, clipartSettings)
        .then((result) => {
          if (!cancelled) setClipartPreview(result);
        })
        .catch(() => {
          if (!cancelled) toast.error('Could not generate clipart preview');
        })
        .finally(() => {
          if (!cancelled) setClipartLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, mode, imageBase64, clipartSettings]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated =
        mode === 'clipart'
          ? (clipartPreview ?? (await renderClipartBase64(imageBase64, clipartSettings)))
          : await renderAdjustedImageBase64(imageBase64, adjustments);

      const res = await Api.put(`api/student/${studentId}`, {
        [fingerKey]: updated,
      });
      onSaved(fingerKey, updated);
      toast.success(
        res.data.message ??
          (mode === 'clipart' ? `${fingerLabel} saved as clipart` : `${fingerLabel} saved`),
      );
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to save fingerprint';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const filter = adjustmentsFilter(adjustments);
  const adjustHasChanges =
    adjustments.brightness !== DEFAULT_IMAGE_ADJUSTMENTS.brightness ||
    adjustments.contrast !== DEFAULT_IMAGE_ADJUSTMENTS.contrast ||
    adjustments.saturation !== DEFAULT_IMAGE_ADJUSTMENTS.saturation;

  const canSave =
    mode === 'adjust'
      ? adjustHasChanges
      : Boolean(clipartPreview) && !clipartLoading;

  const previewSrc =
    mode === 'clipart' && clipartPreview
      ? fingerprintImageSrc(clipartPreview)
      : fingerprintImageSrc(imageBase64);

  return (
    <Modal
      open={open}
      setOpen={(value) => !value && onClose()}
      title={`Edit ${fingerLabel}`}
      size="max-w-xl"
    >
      <div className="space-y-6">
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('adjust')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
              mode === 'adjust'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Adjust
          </button>
          <button
            type="button"
            onClick={() => setMode('clipart')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
              mode === 'clipart'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <Sparkles className="h-4 w-4" />
            Clipart
          </button>
        </div>

        <p className="text-sm text-slate-500">
          {mode === 'adjust'
            ? 'Adjust brightness, contrast, and saturation.'
            : 'Clean black-and-white clipart — few colors, reduced noise, smooth ridge lines (like vectorizer clipart mode).'}
        </p>

        <div className="relative flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {mode === 'clipart' && clipartLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 text-sm font-medium text-slate-600">
              Generating clipart…
            </div>
          )}
          <img
            src={previewSrc}
            alt={fingerLabel}
            className="max-h-[min(50vh,360px)] max-w-full object-contain"
            style={mode === 'adjust' ? { filter } : undefined}
            draggable={false}
          />
        </div>

        {mode === 'adjust' ? (
          <div className="space-y-4">
            <AdjustmentSlider
              label="Brightness"
              value={adjustments.brightness}
              min={40}
              max={200}
              disabled={saving}
              onChange={(brightness) =>
                setAdjustments((prev) => ({ ...prev, brightness }))
              }
            />
            <AdjustmentSlider
              label="Contrast"
              value={adjustments.contrast}
              min={40}
              max={200}
              disabled={saving}
              onChange={(contrast) =>
                setAdjustments((prev) => ({ ...prev, contrast }))
              }
            />
            <AdjustmentSlider
              label="Saturation"
              value={adjustments.saturation}
              min={0}
              max={200}
              disabled={saving}
              onChange={(saturation) =>
                setAdjustments((prev) => ({ ...prev, saturation }))
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <AdjustmentSlider
              label="Detail"
              value={clipartSettings.detail}
              min={40}
              max={100}
              disabled={saving || clipartLoading}
              onChange={(detail) =>
                setClipartSettings((prev) => ({ ...prev, detail }))
              }
            />
            <AdjustmentSlider
              label="Smoothness"
              value={clipartSettings.smoothness}
              min={0}
              max={100}
              disabled={saving || clipartLoading}
              onChange={(smoothness) =>
                setClipartSettings((prev) => ({ ...prev, smoothness }))
              }
            />
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving || clipartLoading}
            onClick={() => {
              if (mode === 'adjust') {
                setAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
              } else {
                setClipartSettings(DEFAULT_CLIPART_SETTINGS);
              }
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving || !canSave}
            onClick={handleSave}
            className="min-w-[120px]"
          >
            {saving
              ? 'Saving…'
              : mode === 'clipart'
                ? 'Save clipart'
                : 'Save changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
