import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { GlowCard } from "@/components/ui/spotlight-card";
import { COLORS, RADIUS } from "@/lib/motion";

type Photo = { src: string; alt: string; caption: string };

// Data array, deliberately separated from rendering.
const PHOTOS: Photo[] = [
  { src: "/Img/p1.jpg", alt: "Golden hour photograph", caption: "Golden hour" },
  { src: "/Img/p2.jpg", alt: "Street photograph", caption: "Kitty" },
  { src: "/Img/p3.jpg", alt: "Mountains photograph", caption: "Poddo" },
  { src: "/Img/p4.jpg", alt: "Portrait photograph", caption: "Sunset with Dream" },
];

const DRIVE_LINK =
  "https://drive.google.com/drive/folders/1y-5ilsXkqaYUGPHMZe2EGDLZ6j1I55oQ?usp=sharing";

function PhotoCard({
  photo,
  index,
  inView,
  reduce,
}: {
  photo: Photo;
  index: number;
  inView: boolean;
  reduce: boolean;
}) {
  return (
    // Opacity-only entrance — a transform on this wrapper would break the
    // GlowCard spotlight's `background-attachment: fixed`.
    <motion.div
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: reduce ? 0 : index * 0.08 }}
    >
      <GlowCard customSize glowColor="cyan" className="lens-card">
        <div className="lens-card__media">
          <img src={photo.src} alt={photo.alt} loading="lazy" className="lens-card__img" />
        </div>
        <p className="lens-card__caption">{photo.caption}</p>
      </GlowCard>
    </motion.div>
  );
}

const PhotographySection = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      id="photography"
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #0d0e12 100%)",
        padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.cyan,
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          Through the lens
        </p>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: COLORS.white,
            margin: "0 0 48px",
          }}
        >
          Photography
        </h2>

        <div ref={gridRef} className="lens-grid">
          {PHOTOS.map((photo, i) => (
            <PhotoCard key={photo.src} photo={photo} index={i} inView={inView} reduce={reduce} />
          ))}
        </div>

        {/* "See more" -> full photo archive on Google Drive. */}
        <div style={{ marginTop: 40 }}>
          <motion.a
            href={DRIVE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="See more photography on Google Drive"
            whileHover={{ scale: 1.04, backgroundColor: COLORS.cyan, color: COLORS.black }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: RADIUS.lg,
              border: `1px solid ${COLORS.cyan}`,
              background: "rgba(0,179,220,0.08)",
              color: COLORS.cyan,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.02em",
              textDecoration: "none",
            }}
          >
            See more
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </motion.a>
        </div>
      </div>

      <style>{`
        .lens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .lens-card { color: ${COLORS.white}; }
        .lens-card__media {
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 3 / 4;
        }
        .lens-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .lens-card:hover .lens-card__img { transform: scale(1.04); }
        .lens-card__caption {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        @media (prefers-reduced-motion: reduce) {
          .lens-card__img { transition-duration: 0.001ms; }
          .lens-card:hover .lens-card__img { transform: none; }
        }
      `}</style>
    </section>
  );
};

export default PhotographySection;
