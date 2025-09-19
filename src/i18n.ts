// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        tagline: "Your trusted source for listings and resources.",
        resources: "Resources",
        information: "Information",
        home: "Home",
        how: "How it works",
        faq: "FAQs",
        contact: "Contact",
      },
    },
    id: {
      translation: {
        tagline: "Sumber terpercaya untuk daftar dan informasi.",
        resources: "Sumber Daya",
        information: "Informasi",
        home: "Beranda",
        how: "Cara Kerja",
        faq: "Pertanyaan Umum",
        contact: "Kontak",
      },
    },
    ar: {
      translation: {
        tagline: "مصدر موثوق للقوائم والمعلومات.",
        resources: "الموارد",
        information: "معلومات",
        home: "الرئيسية",
        how: "كيف تعمل",
        faq: "الأسئلة الشائعة",
        contact: "اتصل",
      },
    },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
