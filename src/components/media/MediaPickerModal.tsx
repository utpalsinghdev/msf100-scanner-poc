import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/Loader';
import Api from '@/lib/api';
import toast from 'react-hot-toast';
import { FingerprintImage } from '@/components/ui/FingerprintImage';
import type { MediaRecord } from '@/types/media';
import { ImageIcon } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (imageBase64: string) => void;
  title?: string;
};

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  title = 'Select from media',
}: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaRecord[]>([]);

  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      try {
        const res = await Api.get('api/media');
        setItems(res.data.data ?? []);
      } catch {
        toast.error('Failed to load media library');
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open]);

  return (
    <Modal
      open={open}
      setOpen={(value) => !value && onClose()}
      title={title}
      size="max-w-3xl"
    >
      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <ImageIcon className="h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-600">No images in your media library yet.</p>
          <p className="text-xs text-slate-500">
            Upload fingerprint images from the Media page, then pick them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.image);
                onClose();
              }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <FingerprintImage src={item.image} alt={item.name} />
              <span className="w-full truncate text-center text-xs font-medium text-slate-700">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
