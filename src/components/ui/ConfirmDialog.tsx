import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Destructive-action confirm (delete etc.). Not used for create/upload. */
export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} open={open} setOpen={(v) => !v && onCancel()} size="max-w-md">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={loading}
          onClick={onConfirm}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
