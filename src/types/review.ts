// types/review.ts
export interface Review {
  id?: string; // doc.id dari Firestore
  userId: string;
  userName: string;
  comment: string; // isi komentar review
  rating: number; // bintang rating 1-5
  mediaUrl?: string; // optional, untuk gambar/video
  createdAt: Date; // bisa Firestore.Timestamp

  // tambahan biar kompatibel dengan kode lama
  userAvatar?: string; // foto user reviewer
  fileName?: string; // kalau ada upload file
  bintang?: number; // alias lama dari rating
  komentar?: string; // alias lama dari comment
}
