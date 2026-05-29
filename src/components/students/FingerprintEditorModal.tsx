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

export type FingerKey =
  | 'finger1'
  | 'finger2'
  | 'finger3'
  | 'finger4'
  | 'finger5';

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
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(
    DEFAULT_IMAGE_ADJUSTMENTS,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
    }
  }, [open, imageBase64]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await renderAdjustedImageBase64(imageBase64, adjustments);
      const res = await Api.put(`api/student/${studentId}`, {
        [fingerKey]: updated,
      });
      onSaved(fingerKey, updated);
      toast.success(res.data.message ?? `${fingerLabel} saved`);
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
  const hasChanges =
    adjustments.brightness !== DEFAULT_IMAGE_ADJUSTMENTS.brightness ||
    adjustments.contrast !== DEFAULT_IMAGE_ADJUSTMENTS.contrast ||
    adjustments.saturation !== DEFAULT_IMAGE_ADJUSTMENTS.saturation;

  return (
    <Modal
      open={open}
      setOpen={(value) => !value && onClose()}
      title={`Edit ${fingerLabel}`}
      size="max-w-xl"
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-500">
          Adjust brightness, contrast, and saturation. Changes are applied when you save.
        </p>

        <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={fingerprintImageSrc(imageBase64)}
            alt={fingerLabel}
            className="max-h-[min(50vh,360px)] max-w-full object-contain"
            style={{ filter }}
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
