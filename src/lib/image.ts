// Resizes and compresses an image file into a WebP (or JPEG fallback) data URL, to keep
// stored base64 images small (large uncompressed images bloat every product query).
export const compressImageFile = (file: File, maxDim = 900, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolveFromDataUrl(reader.result as string, maxDim, quality).then(resolve).catch(reject);
    reader.readAsDataURL(file);
  });
};

// Re-compresses an existing data URL (e.g. a previously-stored uncompressed image).
export const compressDataUrl = (dataUrl: string, maxDim = 900, quality = 0.7): Promise<string> =>
  resolveFromDataUrl(dataUrl, maxDim, quality);

const resolveFromDataUrl = (dataUrl: string, maxDim: number, quality: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('invalid image'));
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else { width = Math.round(width * (maxDim / height)); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const webp = canvas.toDataURL('image/webp', quality);
      resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
};

