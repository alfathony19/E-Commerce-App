export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-") // ubah spasi dan simbol ke "-"
    .replace(/^-+|-+$/g, ""); // hapus dash di awal/akhir
};
