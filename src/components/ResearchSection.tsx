import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { FileText, ExternalLink, Lock } from "lucide-react";
import { COLORS, RADIUS } from "@/lib/motion";

interface ResearchPaper {
  title: string;
  venue: string;
  year: string;
  abstract: string;
  pdfHref: string;
  doiHref?: string;
}

const PAPERS: ResearchPaper[] = [
  {
    title: "Eid Homecoming Travel Crisis in Bangladesh: Overcrowding, Safety Risks, and a High-Capacity Standing Coach Solution for Bangladesh Railway",
    venue: "International Jaurnal of Safety Research",
    year: "2026",
    abstract:
      "Proposed an engineering-driven solution combining optimized coach design, digital ticketing, and improved station management to reduce rooftop travel and passenger fatalities.",
    pdfHref: "/j.ijsr.20260102.13.pdf",
    doiHref: "https://www.sciencepg.com/article/10.11648/j.ijsr.20260102.13",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 180, damping: 22 } },
};

function LinkButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 600,
        color: COLORS.cyan,
        textDecoration: "none",
        padding: "8px 14px",
        borderRadius: RADIUS.md,
        border: `1px solid ${COLORS.cyan}40`,
        background: "rgba(0,179,220,0.08)",
        minHeight: 40,
      }}
    >
      {children}
    </a>
  );
}

const ResearchSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="research"
      ref={ref}
      style={{
        background: COLORS.white,
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
            color: COLORS.cyan,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          Publications
        </motion.p>
        <motion.h2
          variants={cardVariants}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: COLORS.textPrimary,
            margin: "0 0 48px",
          }}
        >
          Research work
        </motion.h2>

        <div style={{ display: "grid", gap: 24 }}>
          {/* Published papers */}
          {PAPERS.map((paper) => (
            <motion.article
              key={paper.title}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: "0 18px 44px -22px rgba(0,179,220,0.3)" }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{
                position: "relative",
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.lg,
                padding: 32,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 24,
                  bottom: 24,
                  width: 3,
                  background: COLORS.cyan,
                  borderRadius: "0 2px 2px 0",
                }}
              />
              <div style={{ paddingLeft: 16 }}>
                <span
                  style={{
                    display: "inline-block",
                    background: "rgba(0,179,220,0.12)",
                    color: COLORS.cyan,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 100,
                    marginBottom: 16,
                  }}
                >
                  Published
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  {paper.title}
                </h3>
                <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 8 }}>
                  {paper.venue} · {paper.year}
                </p>
                <p
                  style={{
                    color: COLORS.textSecondary,
                    lineHeight: 1.7,
                    marginTop: 16,
                    maxWidth: "72ch",
                  }}
                >
                  {paper.abstract}
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                  <LinkButton href={paper.pdfHref}>
                    <FileText size={16} strokeWidth={1.5} /> Read paper
                  </LinkButton>
                  {paper.doiHref && (
                    <LinkButton href={paper.doiHref}>
                      <ExternalLink size={16} strokeWidth={1.5} /> DOI
                    </LinkButton>
                  )}
                </div>
              </div>
            </motion.article>
          ))}

          {/* Coming soon card */}
          <motion.article
            variants={cardVariants}
            style={{
              position: "relative",
              background: COLORS.surface,
              borderRadius: RADIUS.lg,
              padding: 32,
              overflow: "hidden",
            }}
          >
            <motion.div
              aria-hidden="true"
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: 8,
                border: `1.5px dashed ${COLORS.textMuted}`,
                borderRadius: RADIUS.lg,
                pointerEvents: "none",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: RADIUS.md,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textMuted,
                }}
              >
                <Lock size={18} strokeWidth={1.5} />
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COLORS.textMuted,
                }}
              >
                Coming soon
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.textSecondary,
                margin: "16px 0 6px",
              }}
            >
              Next publication in progress
            </h3>
            <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
              More research publications coming soon.
            </p>
          </motion.article>
        </div>
      </motion.div>
    </section>
  );
};

export default ResearchSection;
