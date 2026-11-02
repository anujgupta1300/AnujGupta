/**
 * ExperienceSection
 * -----------------
 * Education & Work, in the same visual language as the rest of the portfolio
 * (light editorial surface, single cyan accent, Space Grotesk headings,
 * motion/react). A single entry (BSc in Computer Science) presented on a
 * timeline rail: the spine draws in on enter, the dot pops + pulses, the card
 * reveals with a staggered lift, and the image grows 800x600 -> 800x800 on hover.
 *
 * Self-contained, no props. Edit the `experience` object below for real data.
 * Fully reduced-motion aware via useReducedMotion().
 */
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COLORS, RADIUS, spring, snappySpring, aboutSpring, ACCENT_GRADIENT } from "@/lib/motion";

// ---- Data: edit this entry / image path for real content ----
const experience = {
  dateRange: "2024 - PRESENT",
  title: "BSc in Computer Science",
  subtitle: "Computer Science & Engineering",
  organization: "American International University-Bangladesh",
  skills: ["Data Structures", "Algorithms", "Software Engineering", "Databases"],
  image: "/Img/A1.jpg",
  imageAlt: "Anuj Gupta",
};

// ---- Animation config (no magic numbers inline) ----
const IMAGE_WIDTH = 480; // fixed width in px (480 x 360 -> 480 x 480)
const IMAGE_BASE = 200; // resting height in px
const IMAGE_HOVER = 255; // hovered height in px
const HEADING = "Experience";

// Scoped CSS for the things motion/react can't express cleanly: media-query
// layout, hover pseudo-elements, and the reduced-motion guard. Kept in the
// `.exp-` namespace to avoid collisions with the rest of the page.
const styles = `
  .exp-rail {
    position: relative;
    width: 28px;
    flex: 0 0 28px;
  }
  /* spine track: the faint full-height line the animated spine draws over */
  .exp-rail::before {
    content: "";
    position: absolute;
    left: 13px;
    top: 6px;
    bottom: 0;
    width: 2px;
    background: ${COLORS.border};
  }
  .exp-card {
    position: relative;
    overflow: hidden;
    border-radius: ${RADIUS.lg}px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.white};
    padding: clamp(20px, 3vw, 32px);
    transition:
      transform 220ms cubic-bezier(0.16, 1, 0.30, 1),
      box-shadow 220ms cubic-bezier(0.16, 1, 0.30, 1),
      border-color 220ms cubic-bezier(0.16, 1, 0.30, 1);
  }
  /* left accent bar slides in on hover */
  .exp-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${ACCENT_GRADIENT};
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 200ms cubic-bezier(0.16, 1, 0.30, 1);
  }
  .exp-card:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 24px 50px -24px rgba(10, 10, 10, 0.28), 0 0 0 1px rgba(0, 179, 220, 0.18);
    border-color: rgba(0, 179, 220, 0.35);
  }
  .exp-card:hover::before { transform: scaleY(1); }
  .exp-tag { transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .exp-tag:hover {
    background: rgba(0, 179, 220, 0.12);
    color: ${COLORS.cyan};
    border-color: rgba(0, 179, 220, 0.35);
  }
  @media (max-width: 767px) {
    .exp-rail { width: 22px; flex-basis: 22px; }
    .exp-rail::before { left: 10px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .exp-card, .exp-card::before, .exp-tag { transition-duration: 0.01ms !important; }
  }
`;

const tagVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.55 + i * 0.06, ease: "easeOut" as const },
  }),
};

// Per-character heading reveal (slides up under a clip). Falls back to a plain
// fade when reduced motion is requested.
const charVariants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 0.5, delay: 0.1 + i * 0.02, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const ExperienceSection = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      ref={ref}
      id="experience"
      role="region"
      aria-labelledby="exp-heading"
      aria-label="Education and work experience"
      style={{
        background: COLORS.white,
        padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Section header */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...aboutSpring, delay: 0.05 }}
        >
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
            Education &amp; Work
          </p>
          <h2
            id="exp-heading"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: COLORS.textPrimary,
              margin: "0 0 48px",
            }}
          >
            {reduce ? (
              HEADING
            ) : (
              // characters split + slide up under a clip
              <span style={{ display: "inline-flex", overflow: "hidden", paddingBottom: "0.08em" }}>
                {HEADING.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={charVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            )}
          </h2>
        </motion.div>

        {/* Timeline — semantic ordered list, one entry */}
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          <li style={{ display: "flex", gap: "clamp(12px, 2vw, 20px)", alignItems: "stretch" }}>
            {/* Rail: drawing spine + popping, pulsing dot */}
            <div className="exp-rail" aria-hidden="true">
              {/* spine draws in top -> bottom on enter */}
              <motion.span
                initial={reduce ? { opacity: 1 } : { scaleY: 0 }}
                animate={inView ? { scaleY: 1, opacity: 1 } : {}}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                style={{
                  position: "absolute",
                  left: 13,
                  top: 6,
                  bottom: 0,
                  width: 2,
                  background: ACCENT_GRADIENT,
                  transformOrigin: "top",
                }}
              />
              {/* pulse ring — only on this most-recent entry */}
              {!reduce && (
                <motion.span
                  initial={{ scale: 1, opacity: 0 }}
                  animate={inView ? { scale: [1, 2.4, 2.4], opacity: [0.5, 0, 0] } : {}}
                  transition={{ duration: 2.4, ease: "easeOut", repeat: Infinity, delay: 0.7 }}
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 1,
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    background: COLORS.cyan,
                  }}
                />
              )}
              {/* the dot itself: spring pop-in */}
              <motion.span
                initial={reduce ? { opacity: 1 } : { scale: 0 }}
                animate={inView ? { scale: reduce ? 1 : [0, 1.15, 1], opacity: 1 } : {}}
                transition={reduce ? { duration: 0.01 } : { ...snappySpring, delay: 0.45 }}
                style={{
                  position: "absolute",
                  left: 7,
                  top: 0,
                  width: 14,
                  height: 14,
                  borderRadius: 9999,
                  background: COLORS.cyan,
                  border: `2px solid ${COLORS.white}`,
                  boxShadow: "0 0 0 1px rgba(0,179,220,0.35)",
                }}
              />
            </div>

            {/* Card */}
            <motion.article
              className="exp-card"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: 0.2 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              <time
                dateTime={experience.dateRange}
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COLORS.textMuted,
                  marginBottom: 8,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {experience.dateRange}
              </time>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: COLORS.textPrimary,
                  margin: 0,
                }}
              >
                {experience.title}
              </h3>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 16,
                  fontWeight: 500,
                  color: COLORS.textSecondary,
                }}
              >
                {experience.subtitle}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 15, color: COLORS.textMuted }}>
                {experience.organization}
              </p>

              {/* Skills */}
              {experience.skills.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    margin: "18px 0 0",
                    padding: 0,
                  }}
                >
                  {experience.skills.map((skill, t) => (
                    <motion.li
                      key={skill}
                      className="exp-tag"
                      custom={t}
                      variants={tagVariants}
                      initial="hidden"
                      animate={inView ? "visible" : undefined}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 10px",
                        borderRadius: 9999,
                        border: "1px solid rgba(10,10,10,0.12)",
                        color: COLORS.textSecondary,
                        background: COLORS.surface,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {skill}
                    </motion.li>
                  ))}
                </ul>
              )}

              {/* Image below the skills: 800x600 at rest, 800x800 on hover */}
              <motion.div
                initial={false}
                animate={{ width: IMAGE_WIDTH, height: IMAGE_BASE }}
                whileHover={reduce ? undefined : { height: IMAGE_HOVER }}
                transition={spring}
                style={{
                  width: IMAGE_WIDTH,
                  height: IMAGE_BASE,
                  maxWidth: "100%",
                  marginTop: 40,
                  borderRadius: RADIUS.lg,
                  overflow: "hidden",
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 24px 50px -28px rgba(10,10,10,0.45)",
                  willChange: "height",
                }}
              >
                <img
                  src={experience.image}
                  alt={experience.imageAlt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </motion.div>
            </motion.article>
          </li>
        </ol>
      </div>
    </section>
  );
};

export default ExperienceSection;
