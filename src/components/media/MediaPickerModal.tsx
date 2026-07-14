import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/Loader';
import Api from '@/lib/api';
import toast from 'react-hot-toast';
import { FingerprintImage } from '@/components/ui/FingerprintImage';
import type { MediaRecord } from '@/types/media';
import { ImageIcon, Upload } from 'lucide-react';
import { filesToMediaItems } from '@/lib/fileToBase64';
import { resolveToBase64 } from '@/lib/fingerprintImage';
import { useAuth } from '@/contexts/AuthContext';
import { canPerform } from '@/lib/permissions';

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
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [items, setItems] = useState<MediaRecord[]>([]);
  const hasLoadedRef = useRef(false);
  const canUpload = canPerform(user, 'add');

  async function loadMedia() {
    // Stale-while-revalidate: keep showing last list; only spinner on first load.
    if (!hasLoadedRef.current) setLoading(true);
    try {
      const res = await Api.get('api/media');
      setItems(res.data.data ?? []);
      hasLoadedRef.current = true;
    } catch {
      toast.error('Failed to load media library');
      if (!hasLoadedRef.current) setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadMedia();
  }, [open]);

  async function pickImage(imageSrc: string) {
    setSelecting(true);
    try {
      const base64 = await resolveToBase64(imageSrc);
      onSelect(base64);
      onClose();
    } catch {
      toast.error('Failed to load selected image');
    } finally {
      setSelecting(false);
    }
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    try {
      const payload = await filesToMediaItems(fileList);
      const res = await Api.post('api/media/bulk', { items: payload });
      const created = (res.data.data ?? []) as MediaRecord[];
      setItems((prev) => [...created, ...prev]);
      hasLoadedRef.current = true;
      toast.success(res.data.message ?? 'Image uploaded to media');

      const uploaded = created[0];
      if (uploaded?.image) {
        await pickImage(uploaded.image);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Upload failed');
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Modal
      open={open}
      setOpen={(value) => !value && onClose()}
      title={title}
      size="max-w-3xl"
    >
      {canUpload && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".bmp,.png,.jpg,.jpeg,image/bmp,image/png,image/jpeg"
            className="hidden"
            disabled={uploading || selecting}
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Upload your own image</p>
              <p className="text-xs text-slate-500">
                Saved to Media and selected for this finger.
              </p>
            </div>
            <Button
              type="button"
              className="gap-2"
              disabled={loading || uploading || selecting}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload image'}
            </Button>
          </div>
        </>
      )}

      {loading && !hasLoadedRef.current ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <ImageIcon className="h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-600">No images in your media library yet.</p>
          <p className="text-xs text-slate-500">
            {canUpload
              ? 'Upload an image above, or add images from the Media page.'
              : 'Upload fingerprint images from the Media page, then pick them here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={selecting || uploading}
              onClick={() => pickImage(item.image)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
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
        <Button type="button" variant="outline" onClick={onClose} disabled={selecting}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
