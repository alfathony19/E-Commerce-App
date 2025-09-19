// src/components/common/LogoCloudsDouble.tsx
import Marquee from "react-fast-marquee";

const logos = [
  "brands/bigbozz.svg",
  "brands/canon.svg",
  "brands/e-print.svg",
  "brands/epson.svg",
  "brands/fabercasteel.svg",
  "brands/interx.svg",
  "brands/joyko.svg",
  "brands/kangaro.svg",
  "brands/kenko.svg",
  "brands/paperline.svg",
  "brands/sidu.svg",
  "brands/snowman.svg",
  "brands/stabilo.svg",
  "brands/standar.svg",
  "brands/vision+.svg",
];

const LogoClouds = () => {
  return (
    <div className="py-20 space-y-6">
      {/* Baris 1: kiri ke kanan */}
      <Marquee gradient={false} pauseOnHover={true} direction="left" speed={50}>
        {logos.map((logo, i) => (
          <img
            key={i}
            src={`/${logo}`}
            alt={`Logo ${i + 1}`}
            className="h-16 sm:h-20 md:h-24 object-contain mx-5"
          />
        ))}
      </Marquee>

      {/* Baris 2: kanan ke kiri */}
      <Marquee
        gradient={false}
        pauseOnHover={true}
        direction="right"
        speed={50}
      >
        {logos.map((logo, i) => (
          <img
            key={i}
            src={`/${logo}`}
            alt={`Logo ${i + 1}`}
            className="h-16 sm:h-20 md:h-24 object-contain mx-5"
          />
        ))}
      </Marquee>
    </div>
  );
};

export default LogoClouds;
