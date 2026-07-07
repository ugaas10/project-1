/**
 * Client-side file compression utility for GeoDMS
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  ratio: number;
}

/**
 * Compresses an image using Canvas API
 */
async function compressImage(file: File, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Target max dimension
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * Placeholder for PDF compression (simulated logic)
 * In a real production environment, this would use a library like pdf-lib
 */
async function compressPDF(file: File): Promise<File> {
  // Simulate PDF stripping/optimization delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // For this demo, we "optimize" by slightly reducing the buffer if it was huge,
      // but otherwise return the original or a mock reduced version.
      // We'll return the original file to maintain integrity in this shim.
      resolve(file);
    }, 800);
  });
}

export async function compressFile(file: File): Promise<CompressionResult> {
  const originalSize = file.size;
  let compressedFile = file;

  if (file.type.startsWith('image/')) {
    try {
      compressedFile = await compressImage(file);
    } catch (e) {
      console.error('Image compression failed', e);
    }
  } else if (file.type === 'application/pdf') {
    compressedFile = await compressPDF(file);
  }

  const compressedSize = compressedFile.size;
  const ratio = originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0;

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    ratio: Math.max(0, ratio)
  };
}
