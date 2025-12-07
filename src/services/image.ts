import { compressImage } from "@/lib/compressImage";
import { supabase } from "@/lib/supabase";

export class ImageService {
  static async uploadImage(
    file: File,
    requestId: string
  ): Promise<{ url: string; path: string }> {
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${requestId}.${fileExt}`;
      const compressedImage = await compressImage(file);
      const { error } = await supabase.storage
        .from("requests")
        .upload(filePath, compressedImage, {
          upsert: false,
        });

      if (error) throw error;

      // get public url
      const { data } = supabase.storage
        .from("requests")
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.log(error);
      throw "Could not upload image. Please try again later";
    }
  }

  static async deleteImage(path: string) {
    try {
      const { error } = await supabase.storage.from("requests").remove([path]);

      if (error) throw error;

      return null;
    } catch {
      throw "Something went wrong. Please try again later";
    }
  }
}
