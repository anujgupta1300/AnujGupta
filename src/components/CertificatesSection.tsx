import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Award, ExternalLink } from "lucide-react";
import { COLORS, RADIUS, spring } from "@/lib/motion";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageSrc: string;
  credentialUrl?: string;
}

// Data array, separated from rendering — add/swap entries with no structural change.
const CERTIFICATES: Certificate[] = [
  {
    id: "c1",
    title: "IT Essentials",
    issuer: "Cisco Networking Academy (offered through American International University-Bangladesh)",
    date: "25 February 2026",
    imageSrc: "/Img/c1.jpeg",
    credentialUrl: "#",
  },
  {
    id: "c2",
    title: "Certificate of Publication",
    issuer: "Science Publishing Group – International Journal of Safety Research (IJSR)",
    date: "30 June 2026",
    imageSrc: "/Img/c2.jpg",
    credentialUrl: "#",
  },
  {
    id: "c3",
    title: "Introduction to Generative AI",
    issuer: "Google Cloud (Google Cloud Skills Academy)",
    date: "August 15, 2025",
    imageSrc: "/Img/c3.jpeg",
    credentialUrl: "#",
  },
];

// Staggered card reveal, consistent with the spring tokens used site-wide.
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring, delay: i * 0.12 },
  }),
};

function CertificateCard({ cert, index }: { cert: Certificate; index: number }) {
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: "0 22px 50px -24px rgba(0,179,220,0.32)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ aspectRatio: "10 / 7", overflow: "hidden", background: "#0d0e12" }}>
        <img
          src={cert.imageSrc}
          alt={`${cert.title} certificate`}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: COLORS.cyan,
          }}
        >
          <Award size={15} strokeWidth={1.6} /> Certified
        </span>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            fontWeight: 600,
            color: COLORS.textPrimary,
            margin: "6px 0 0",
            lineHeight: 1.3,
          }}
        >
          {cert.title}
        </h3>
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
          {cert.issuer} · {cert.date}
        </p>
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View credential: ${cert.title} (opens in new tab)`}
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.cyan,
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: RADIUS.md,
              border: `1px solid ${COLORS.cyan}40`,
              background: "rgba(0,179,220,0.08)",
              alignSelf: "flex-start",
              minHeight: 44,
            }}
          >
            <ExternalLink size={16} strokeWidth={1.6} /> View credential
          </a>
        )}
      </div>
    </motion.article>
  );
}

const CertificatesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="certificates"
      ref={ref}
      style={{
        background: COLORS.surface,
        padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
      }}
    >
      <motion.div
        style={{ maxWidth: 1280, margin: "0 auto" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.p
          variants={cardVariants}
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.cyan,
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          Credentials
        </motion.p>
        <motion.h2
          variants={cardVariants}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: COLORS.textPrimary,
            margin: "0 0 48px",
          }}
        >
          Certificates
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 24,
          }}
        >
          {CERTIFICATES.map((cert, i) => (
            <CertificateCard key={cert.id} cert={cert} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default CertificatesSection;
