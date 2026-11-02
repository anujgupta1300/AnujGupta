import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COLORS, aboutSpring } from "@/lib/motion";
import AboutImage from "./AboutImage";

const STATS = [
  { value: "4+", label: "Years building" },
  { value: "7+", label: "Projects shipped" },
  { value: "10+", label: "Technologies" },
];

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion() ?? false;
  // Under reduced motion, drop the directional travel and fade only.
  const enter = (axis: "x" | "y", distance: number) =>
    reduce ? { opacity: 0 } : { opacity: 0, [axis]: distance };

  return (
    <section
      ref={ref}
      style={{
        background: COLORS.white,
        padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: "clamp(32px, 6vw, 96px)",
          alignItems: "center",
        }}
        className="about-grid"
      >
        {/* Text */}
        <motion.div
          initial={enter("x", -40)}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ ...aboutSpring, delay: 0.1 }}
        >
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: COLORS.cyan,
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            About
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: COLORS.textPrimary,
              margin: 0,
            }}
          >
            I build things that feel good to use.
          </h2>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              fontSize: 16,
              lineHeight: 1.7,
              color: COLORS.textSecondary,
              maxWidth: "60ch",
            }}
          >
            <p style={{ margin: 0 }}>
              I'm a Computer Engineer and full-stack developer studying Computer Science at American International University-Bangladesh.
              I turn real-world pain points into clean, fast digital tools across the web, cloud,
              and IoT.
            </p>
            <p style={{ margin: 0 }}>
              My work spans fintech, IoT, and healthcare. I care about performance,
              maintainability, and details that make a product feel considered. Next up: deeper
              cloud-native systems and AI-driven automation.
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={enter("y", 20)}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...aboutSpring, delay: 0.3 + i * 0.1 }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 500,
                    color: COLORS.textPrimary,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 6 }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Portrait — scroll-framed reveal */}
        <motion.div
          style={{ paddingRight: 10, paddingBottom: 10 }}
          initial={enter("x", 60)}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ ...aboutSpring, delay: 0.2 }}
        >
          <AboutImage src="/Img/H2.jpg" alt="Portrait of Anuj Gupta" />
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
