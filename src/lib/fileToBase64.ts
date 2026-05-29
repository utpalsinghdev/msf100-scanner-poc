const ACCEPTED_TYPES = ['image/bmp', 'image/png', 'image/jpeg', 'image/jpg'];

export function isAcceptedImageFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) || /\.(bmp|png|jpe?g)$/i.test(file.name);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read file'));
        return;
      }
      const base64 = result.replace(/^data:image\/\w+;base64,/, '').trim();
      if (!base64) {
        reject(new Error('Empty image data'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export async function filesToMediaItems(files: FileList | File[]) {
  const list = Array.from(files).filter(isAcceptedImageFile);
  if (list.length === 0) {
    throw new Error('No supported images selected (BMP, PNG, or JPEG)');
  }
  const items = await Promise.all(
    list.map(async (file) => ({
      name: file.name.replace(/\.[^.]+$/, '') || file.name,
      image: await fileToBase64(file),
    })),
  );
  return items;
}
