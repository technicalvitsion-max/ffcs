export const compressImageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If file is not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image resized onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high quality yet compact JPEG data URL (~40KB - 80KB)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        resolve(dataUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if image rendering fails
        resolve(readerEvent.target?.result as string);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const compressImage = async (file: File): Promise<File | Blob> => {
  // Return file directly if needed, or compressed
  return file;
};
