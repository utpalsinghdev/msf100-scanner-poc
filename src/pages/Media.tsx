import PageHeader from '@/components/ui/PageHeader';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import Api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { canPerform } from '@/lib/permissions';
import { filesToMediaItems } from '@/lib/fileToBase64';
import type { MediaRecord } from '@/types/media';
import { FingerprintImage } from '@/components/ui/FingerprintImage';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function Media() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const canAdd = canPerform(user, 'add');
  const canDelete = canPerform(user, 'delete');

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await Api.get('api/media');
      setItems(res.data.data ?? []);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMedia();
  }, []);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    try {
      const payload = await filesToMediaItems(fileList);
      const res = await Api.post('api/media/bulk', { items: payload });
      toast.success(res.data.message ?? 'Upload complete');
      await fetchMedia();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : 'Upload failed');
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this image from media?')) return;
    try {
      await Api.delete(`api/media/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Image deleted');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Delete failed';
      toast.error(msg);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media"
        subtitle="Upload fingerprint images in bulk and reuse them when adding students"
        action={
          canAdd ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".bmp,.png,.jpg,.jpeg,image/bmp,image/png,image/jpeg"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <Button
                type="button"
                className="gap-2"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    Upload images
                  </>
                )}
              </Button>
            </>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
          <ImagePlus className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-medium text-slate-700">No media yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Upload BMP, PNG, or JPEG fingerprint images to use them when capturing students.
          </p>
          {canAdd && (
            <Button
              type="button"
              variant="outline"
              className="mt-6 gap-2"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Choose files
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <FingerprintImage src={item.image} alt={item.name} />
              <p className="w-full truncate text-center text-xs font-semibold text-slate-700">
                {item.name}
              </p>
              {canDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
