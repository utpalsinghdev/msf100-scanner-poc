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
import { enhancedFingerKey, enhancedImageSrc } from '@/lib/enhanceFingerprint';
import { FlipHorizontal2, Info } from 'lucide-react';

export type FingerKey =
  | 'finger1'
  | 'finger2'
  | 'finger3'
  | 'finger4'
  | 'finger5';

const FINGER_KEYS: FingerKey[] = ['finger1', 'finger2', 'finger3', 'finger4', 'finger5'];

type Props = {
  open: boolean;
  onClose: () => void;
  studentId: string;
  fingerKey: FingerKey;
  fingerLabel: string;
  imageBase64: string;
  enhancedBase64?: string;
  allFingerData: Partial<Record<FingerKey, { imageBase64?: string; enhancedBase64?: string }>>;
  onSaved: (updates: Record<string, string>) => void;
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
  enhancedBase64,
  allFingerData,
  onSaved,
}: Props) {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_IMAGE_ADJUSTMENTS);
  const [saving, setSaving] = useState(false);
  const [applyMirrorToAll, setApplyMirrorToAll] = useState(true);

  // use enhanced image as the edit base if available
  const displayBase64 = enhancedBase64?.trim() ? enhancedBase64 : imageBase64;

  useEffect(() => {
    if (open) {
      setAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
      setApplyMirrorToAll(true);
    }
  }, [open, displayBase64]);

  async function handleSave() {
    setSaving(true);
    try {
      const currentUpdated = await renderAdjustedImageBase64(displayBase64, adjustments);
      const saveKey = enhancedBase64?.trim()
        ? enhancedFingerKey(fingerKey)
        : fingerKey;
      const updates: Record<string, string> = {
        [saveKey]: currentUpdated,
      };

      // Optionally mirror all student fingerprints, preferring enhanced images.
      if (applyMirrorToAll && adjustments.mirrored !== DEFAULT_IMAGE_ADJUSTMENTS.mirrored) {
        const mirrorOnlyAdjustments: ImageAdjustments = {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          mirrored: adjustments.mirrored,
        };

        for (const key of FINGER_KEYS) {
          if (key === fingerKey) continue;

          const fingerData = allFingerData[key];
          const targetSrc = fingerData?.enhancedBase64?.trim()
            ? fingerData.enhancedBase64
            : fingerData?.imageBase64;
          if (!targetSrc?.trim()) continue;

          const targetKey = fingerData?.enhancedBase64?.trim()
            ? enhancedFingerKey(key)
            : key;
          updates[targetKey] = await renderAdjustedImageBase64(targetSrc, mirrorOnlyAdjustments);
        }
      }

      await Api.put(`api/student/${studentId}`, updates);
      onSaved(updates);
      toast.success(
        applyMirrorToAll && adjustments.mirrored !== DEFAULT_IMAGE_ADJUSTMENTS.mirrored
          ? `${fingerLabel} saved, mirror applied to all`
          : `${fingerLabel} saved`,
      );
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save fingerprint';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const filter = adjustmentsFilter(adjustments);
  const hasChanges =
    adjustments.brightness !== DEFAULT_IMAGE_ADJUSTMENTS.brightness ||
    adjustments.contrast !== DEFAULT_IMAGE_ADJUSTMENTS.contrast ||
    adjustments.saturation !== DEFAULT_IMAGE_ADJUSTMENTS.saturation ||
    adjustments.mirrored !== DEFAULT_IMAGE_ADJUSTMENTS.mirrored;

  const previewSrc = enhancedBase64?.trim()
    ? enhancedImageSrc(enhancedBase64)
    : fingerprintImageSrc(imageBase64);

  return (
    <Modal
      open={open}
      setOpen={(value) => !value && onClose()}
      title={`Edit ${fingerLabel}`}
      size="max-w-xl"
    >
      <div className="space-y-6">
        <div className="relative flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={previewSrc}
            alt={fingerLabel}
            className="max-h-[min(50vh,360px)] max-w-full object-contain"
            style={{
              filter,
              transform: adjustments.mirrored ? 'scaleX(-1)' : undefined,
            }}
            draggable={false}
          />
        </div>

        <div className="space-y-4">
          <AdjustmentSlider
            label="Brightness"
            value={adjustments.brightness}
            min={40}
            max={200}
            disabled={saving}
            onChange={(brightness) => setAdjustments((prev) => ({ ...prev, brightness }))}
          />
          <AdjustmentSlider
            label="Contrast"
            value={adjustments.contrast}
            min={40}
            max={200}
            disabled={saving}
            onChange={(contrast) => setAdjustments((prev) => ({ ...prev, contrast }))}
          />
          <AdjustmentSlider
            label="Saturation"
            value={adjustments.saturation}
            min={0}
            max={200}
            disabled={saving}
            onChange={(saturation) => setAdjustments((prev) => ({ ...prev, saturation }))}
          />

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FlipHorizontal2 className="h-4 w-4" />
              Mirror image
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                setAdjustments((prev) => ({ ...prev, mirrored: !prev.mirrored }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                adjustments.mirrored ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  adjustments.mirrored ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
              checked={applyMirrorToAll}
              disabled={saving}
              onChange={(e) => setApplyMirrorToAll(e.target.checked)}
            />
            Apply mirror change to all images
          </label>
          <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs text-indigo-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Only mirror is applied globally; brightness, contrast, and saturation stay
              per-image.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setAdjustments(DEFAULT_IMAGE_ADJUSTMENTS)}
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
            disabled={saving || !hasChanges}
            onClick={handleSave}
            className="min-w-[120px]"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
