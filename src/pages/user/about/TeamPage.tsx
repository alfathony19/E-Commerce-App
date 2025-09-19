import { motion } from "framer-motion";
import { Linkedin, Twitter, Instagram, Facebook, Youtube } from "lucide-react";



// Custom TikTok Icon
const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 448 512"
  fill="currentColor"
  >
    <path d="M448,209.9a210.1,210.1,0,0,1-122.8-39.4V349.4c0,89.4-72.6,162-162,162S1.2,438.8,1.2,349.4,73.8,187.4,163.2,187.4a161.26,161.26,0,0,1,26.3,2.2v81.2a81.25,81.25,0,1,0,55.5,77V0h80.2a129.91,129.91,0,0,0,43.4,95.4A129.64,129.64,0,0,0,448,132.6Z" />
  </svg>
);

const WhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 448 512"
  fill="currentColor"
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 224.6 32 117.4 32 32 117.5 32 224.9c0 40.9 10.7 80.8 31 115.8L32 480l143.5-37.5c33.3 18.3 70.8 27.9 109.1 27.9h.1c107.2 0 192.6-85.5 192.6-192.9 0-58.5-23.2-113.3-65.4-155.4zM224.6 415.8c-34 0-67.2-9.1-96.1-26.3l-6.9-4.1-85.2 22.3 22.8-83.2-4.5-7.1c-19.1-30.3-29.2-65.4-29.2-101.5 0-105.5 85.9-191.4 191.3-191.4 51.1 0 99.1 19.9 135.2 56 36 36.1 55.8 84.1 55.8 135.1 0 105.6-85.9 191.5-191.2 191.5z" />
  </svg>
);
type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "facebook"
  | "twitter"
  | "youtube"
  | "whatsapp";


// Mapping medsos → icon
const icons = {
  instagram: Instagram,
  tiktok: TikTok,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter, // bisa buat X juga
  youtube: Youtube,
  whatsapp: WhatsApp,
};

// Team Page – Printing App
function TeamPage() {
  const team = [
    {
      name: "Ela Noprilia",
      role: "Front-Officer",
      img: "/images/ela.jpg",
      socials: {
        facebook: "https://www.facebook.com/ella.noprilia?mibextid=LQQJ4d",
        tiktok: "https://www.tiktok.com/@elaaaanp__?_t=ZS-8zWrs0LQlzJ&_r=1",
        instagram:
          "https://www.instagram.com/elaaaanp__?igsh=cG9lZmlraThiNXhn&utm_source=qr",
      },
    },
    {
      name: "M.Sidik Amaruloh",
      role: "Designer",
      img: "/images/amar.jpg",
      socials: {
        linkedin: "#",
        twitter: "#",
        youtube: "#",
      },
    },
    {
      name: "Indi Rahmadewi",
      role: "Finance",
      img: "/images/indi.jpg",
      socials: {
        linkedin: "https://www.linkedin.com/in/indi-rahmadewi-226a35276",
        instagram: "https://www.instagram.com/indirahmadewi",
      },
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,!teal,transparent_35%),radial-gradient(circle_at_80%_30%,!cyan,transparent_30%),radial-gradient(circle_at_50%_80%,!teal,transparent_30%)]" />
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-900"
          >
            Tim Kami
          </motion.h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Dibalik setiap hasil cetak berkualitas tinggi, ada tim luar biasa
            yang bekerja dengan dedikasi dan kreativitas tanpa henti.
          </p>
        </div>
      </section>

      {/* Team Members */}
      <main className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-200"
            >
              <img
                src={member.img}
                alt={member.name}
                className="h-32 w-32 rounded-full object-cover shadow-md ring-4 ring-teal-500"
              />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {member.name}
              </h3>
              <p className="text-sm text-teal-600">{member.role}</p>

              {/* Socials */}
              <div className="mt-4 flex gap-4">
                {Object.entries(member.socials).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = icons[platform as SocialPlatform]; // 👈 kasih tau TS bahwa ini SocialPlatform
                  if (!Icon) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-5 w-5 text-teal-600 hover:text-teal-700 transition drop-shadow-sm" />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default TeamPage;
