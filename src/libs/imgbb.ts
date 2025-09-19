import axios from "axios";

export const uploadToImgBB = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const API_KEY = import.meta.env.VITE_IMGBB_API_KEY; // simpen API key di .env

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      formData
    );

    return res.data.data.url; // link permanen
  } catch (err) {
    console.error("Upload gagal:", err);
    return null;
  }
};
