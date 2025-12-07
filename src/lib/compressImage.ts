import imageCompression from "browser-image-compression";

export const compressImage = async (file: File) => {
  try {
    const compressed = await imageCompression(file, { maxSizeMB: 2 });
    return compressed;
  } catch {
    throw "An error occurred in image compression";
  }
};
