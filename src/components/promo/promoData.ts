// src/components/promo/promoData.ts
export interface PromoItem {
  slug: string;
  title: string;
  description: string;
  image: string;
  discount: string;
}

export const promoData: PromoItem[] = [
  {
    slug: "tahun-baru",
    title: "Promo Tahun Baru",
    description: "Awali tahun dengan cetakan segar dan diskon spesial!",
    image: "/images/promo/tahun-baru.jpg",
    discount: "Diskon hingga 25%",
  },
  {
    slug: "imlek",
    title: "Promo Imlek",
    description: "Rayakan Imlek dengan desain cetak penuh keberuntungan.",
    image: "/images/promo/imlek.jpg",
    discount: "Diskon 20%",
  },
  {
    slug: "valentine",
    title: "Promo Valentine",
    description: "Cetak kartu & hadiah spesial untuk orang tercinta.",
    image: "/images/promo/valentine.jpg",
    discount: "Diskon 15%",
  },
  {
    slug: "ramadhan",
    title: "Promo Ramadhan",
    description: "Lengkapi kebutuhan promosi & packaging di bulan suci.",
    image: "/images/promo/ramadhan.jpg",
    discount: "Diskon 30%",
  },
  {
    slug: "lebaran",
    title: "Promo Idul Fitri",
    description: "Rayakan Lebaran dengan packaging & hampers eksklusif.",
    image: "/images/promo/lebaran.jpg",
    discount: "Diskon 25%",
  },
  {
    slug: "lebaranhaji",
    title: "Promo Idul Adha",
    description: "Cetak banner & packaging hewan qurban dengan harga hemat.",
    image: "/images/promo/lebaran-haji.jpg",
    discount: "Diskon 20%",
  },
  {
    slug: "kartini",
    title: "Promo Hari Kartini",
    description: "Semangat emansipasi dengan desain cetak inspiratif.",
    image: "/images/promo/kartini.jpg",
    discount: "Diskon 17%",
  },
  {
    slug: "hardiknas",
    title: "Promo Hari Pendidikan Nasional",
    description: "Cetak buku, modul, dan materi edukasi lebih hemat.",
    image: "/images/promo/hardiknas.jpg",
    discount: "Diskon 20%",
  },
  {
    slug: "17an",
    title: "Promo Hari Kemerdekaan",
    description: "Merdeka! Saatnya cetak spanduk & banner lomba agustusan.",
    image: "/images/promo/17an.jpg",
    discount: "Diskon 45%",
  },
  {
    slug: "sumpah",
    title: "Promo Hari Sumpah Pemuda",
    description: "Cetak poster & atribut pemuda dengan semangat persatuan.",
    image: "/images/promo/sumpah.jpg",
    discount: "Diskon 30%",
  },
  {
    slug: "hari-guru",
    title: "Promo Hari Guru Nasional",
    description: "Apresiasi guru dengan cetakan hadiah & kartu ucapan.",
    image: "/images/promo/hari-guru.jpg",
    discount: "Diskon 20%",
  },
  {
    slug: "pahlawan",
    title: "Promo Hari Pahlawan",
    description: "Kenang jasa pahlawan dengan cetakan poster & buku sejarah.",
    image: "/images/promo/pahlawan.jpg",
    discount: "Diskon 25%",
  },
  {
    slug: "natal",
    title: "Promo Natal",
    description: "Cetak kartu Natal & packaging hampers spesial keluarga.",
    image: "/images/promo/natal.jpg",
    discount: "Diskon 30%",
  },
];
