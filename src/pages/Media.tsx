import PageHeader from '@/components/ui/PageHeader';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { canPerform } from '@/lib/permissions';
import { filesToMediaItems } from '@/lib/fileToBase64';
import type { MediaRecord } from '@/types/media';
import { FingerprintImage } from '@/components/ui/FingerprintImage';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type PendingDelete =
  | { mode: 'single'; id: string; name: string }
  | { mode: 'bulk'; ids: string[] }
  | null;

export default function Media() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleting, setDeleting] = useState(false);

  const canAdd = canPerform(user, 'add');
  const canDelete = canPerform(user, 'delete');

  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await Api.get('api/media');
      setItems(res.data.data ?? []);
      setSelectedIds(new Set());
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

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  const confirmMessage = useMemo(() => {
    if (!pendingDelete) return '';
    if (pendingDelete.mode === 'single') {
      return `Remove "${pendingDelete.name}" from media? The file stays on disk if used elsewhere.`;
    }
    return `Remove ${pendingDelete.ids.length} selected image(s) from media? Files stay on disk if used elsewhere.`;
  }, [pendingDelete]);

  async function runDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.mode === 'single') {
        await Api.delete(`api/media/${pendingDelete.id}`);
        setItems((prev) => prev.filter((item) => item.id !== pendingDelete.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(pendingDelete.id);
          return next;
        });
        toast.success('Image deleted');
      } else {
        const res = await Api.post('api/media/bulk-delete', {
          ids: pendingDelete.ids,
        });
        const idSet = new Set(pendingDelete.ids);
        setItems((prev) => prev.filter((item) => !idSet.has(item.id)));
        setSelectedIds(new Set());
        toast.success(res.data.message ?? 'Images deleted');
      }
      setPendingDelete(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Delete failed';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media"
        subtitle="Upload fingerprint images in bulk and reuse them when adding students"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canDelete && items.length > 0 && (
              <>
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                  />
                  Select all
                </label>
                {selectedIds.size > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 text-red-600 hover:text-red-700"
                    onClick={() =>
                      setPendingDelete({ mode: 'bulk', ids: [...selectedIds] })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedIds.size})
                  </Button>
                )}
              </>
            )}
            {canAdd && (
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
            )}
          </div>
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
          {items.map((item) => {
            const selected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border bg-white p-3 shadow-sm ${
                  selected ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'
                }`}
              >
                {canDelete && (
                  <input
                    type="checkbox"
                    className="absolute left-3 top-3 z-10 h-4 w-4 rounded border-slate-300"
                    checked={selected}
                    onChange={() => toggleOne(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                )}
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
                    onClick={() =>
                      setPendingDelete({
                        mode: 'single',
                        id: item.id,
                        name: item.name,
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete media"
        message={confirmMessage}
        loading={deleting}
        onCancel={() => !deleting && setPendingDelete(null)}
        onConfirm={runDelete}
      />
    </div>
  );
}
