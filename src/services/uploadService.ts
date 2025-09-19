// src/services/uploadService.ts
export async function uploadToImgbb(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY; // pastikan ada di .env

  if (!apiKey) {
    throw new Error("IMGBB API key belum diatur di .env");
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error("Gagal upload ke ImgBB: " + JSON.stringify(data));
  }

  return data.data.url as string; // ini link permanen gambar
}
