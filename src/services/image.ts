import { compressImageToDataUrl } from "@/lib/compressImage";

export class ImageService {
  static async uploadImage(
    file: File,
    requestId: string
  ): Promise<{ url: string; path: string }> {
    try {
      const dataUrl = await compressImageToDataUrl(file);

      return {
        url: dataUrl,
        path: `proofs/${requestId}.jpg`,
      };
    } catch (error) {
      console.error("Image processing error:", error);
      throw "Could not process image proof. Please try again with a valid photo.";
    }
  }

  static async deleteImage(_path: string) {
    return null;
  }
}
