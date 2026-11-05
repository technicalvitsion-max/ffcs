/**
 * Compresses an HTMLImageElement using canvas resizing and JPEG quality adjustments.
 */
function compressImageElement(
  img: HTMLImageElement,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.6
): string {
  let width = img.width;
  let height = img.height;

  // Scale down maintaining aspect ratio
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context is not supported");
  }

  // Draw resized image
  ctx.drawImage(img, 0, 0, width, height);

  // Initial compress (~25KB - 40KB)
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  // If still unexpectedly large (> 90KB), scale down further to guarantee compactness
  if (dataUrl.length > 90 * 1024) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.45);
  }

  return dataUrl;
}

/**
 * Compresses a File object into a lightweight, high-performance Base64 JPEG data URL (~25KB - 40KB).
 */
export const compressImageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate mime type
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file."));
      return;
    }

    // Safety guard: reject files > 12MB before browser processing
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error("Image size exceeds 12MB limit. Please select a smaller photo."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const src = readerEvent.target?.result as string;
      const img = new Image();

      img.onload = () => {
        try {
          const compressed = compressImageElement(img, 800, 800, 0.6);
          resolve(compressed);
        } catch {
          resolve(src);
        }
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Compresses an existing Base64 Data URL string to reduce size for already-stored images.
 */
export const compressExistingDataUrl = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const compressed = compressImageElement(img, 800, 800, 0.6);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
};

export const compressImage = async (file: File): Promise<File | Blob> => {
  return file;
};
