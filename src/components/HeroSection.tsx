import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { ChevronDown } from "lucide-react";
import { COLORS, RADIUS } from "@/lib/motion";

// The hero "sinks" as the page scrolls. The sticky image lives inside a tall
// scroll container so there is room for the transform to play out.
const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const smooth = useSpring(scrollY, { stiffness: 80, damping: 24, restDelta: 0.5 });

  const scale = useTransform(smooth, [0, 500], [1, 0.68]);
  const radius = useTransform(smooth, [0, 500], [0, RADIUS.lg]);
  const y = useTransform(smooth, [0, 500], [0, 56]);
  const imageOpacity = useTransform(smooth, [0, 380], [1, 0.25]);
  const textOpacity = useTransform(smooth, [0, 260], [1, 0]);
  const textY = useTransform(smooth, [0, 260], [0, -40]);

  return (
    <div id="top" ref={ref} style={{ height: "180vh", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Sinking hero image */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            scale,
            y,
            borderRadius: radius,
            opacity: imageOpacity,
            overflow: "hidden",
          }}
        >
          <img
            src="/Img/start.png"
            alt="Anuj Gupta"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.55) 100%)",
            }}
          />
        </motion.div>

        {/* Overlaid headline */}
        <motion.div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 clamp(16px, 5vw, 96px) clamp(64px, 12vh, 144px)",
            opacity: textOpacity,
            y: textY,
            color: COLORS.white,
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              alignSelf: "flex-start",
              marginBottom: 20,
              padding: "6px 14px",
              borderRadius: 100,
              border: `1px solid ${COLORS.cyan}55`,
              background: "rgba(0,179,220,0.12)",
              color: COLORS.cyan,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.cyan }}
            />
            Open to work
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 10vw, 8rem)",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: "14ch",
              display: "flex",
              flexWrap: "wrap",
              columnGap: "0.25em",
            }}
          >
            {[
              { text: "Anuj", color: COLORS.white },
              { text: "Gupta", color: COLORS.cyan },
            ].map((word) => (
              <motion.span
                key={word.text}
                variants={{
                  hidden: { y: 70, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { type: "spring", stiffness: 90, damping: 16 },
                  },
                }}
                style={{ display: "inline-block", color: word.color }}
              >
                {word.text}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            style={{
              marginTop: 20,
              fontSize: 16,
              fontWeight: 400,
              color: "rgba(250,250,250,0.82)",
              maxWidth: "44ch",
            }}
          >
            Full-Stack Developer × Computer Engineer. Based in Bogura, Bangladesh.
          </motion.p>

          <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            <motion.a
              href="https://github.com/anujgupta1300"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
              whileHover={{ scale: 1.03, boxShadow: `0 0 24px ${COLORS.cyan}66` }}
              whileTap={{ scale: 0.97 }}
              style={{
                alignSelf: "flex-start",
                padding: "14px 28px",
                background: COLORS.cyan,
                border: `1px solid ${COLORS.cyan}`,
                borderRadius: RADIUS.md,
                color: "#001016",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              View work
            </motion.a>
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.62 }}
              whileHover={{ scale: 1.03, borderColor: COLORS.cyan, color: COLORS.cyan }}
              whileTap={{ scale: 0.97 }}
              style={{
                alignSelf: "flex-start",
                padding: "14px 28px",
                border: "1px solid rgba(250,250,250,0.6)",
                borderRadius: RADIUS.md,
                color: COLORS.white,
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              Resume
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            zIndex: 3,
            x: "-50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: textOpacity,
            color: "rgba(250,250,250,0.7)",
          }}
        >
          <span style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={20} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
