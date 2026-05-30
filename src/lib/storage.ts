import { supabase } from "@/integrations/supabase/client";

export async function uploadFile(userId: string, file: File, folder = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("agrovault").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("agrovault").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMany(userId: string, files: File[], folder = "uploads") {
  const urls: string[] = [];
  for (const f of files) urls.push(await uploadFile(userId, f, folder));
  return urls;
}
