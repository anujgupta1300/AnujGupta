import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";
import { RADIUS } from "@/lib/motion";

// Scroll-driven framing: the photo reveals from the outside in via clipPath.
const AboutImage = ({ src, alt }: { src: string; alt: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20, restDelta: 0.001 });

  const inset = useTransform(p, [0, 1], [18, 0]);
  const clipPath = useTransform(inset, (v) => `inset(${v}% round ${RADIUS.lg}px)`);
  const scale = useTransform(p, [0, 1], [1.12, 1]);
  const opacity = useTransform(p, [0, 0.3], [0, 1]);

  if (reduce) {
    return (
      <div style={{ position: "relative", borderRadius: RADIUS.lg, overflow: "hidden" }}>
        <img src={src} alt={alt} style={{ width: "100%", display: "block" }} />
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.div
        style={{
          position: "relative",
          clipPath,
          scale,
          opacity,
          borderRadius: RADIUS.lg,
          overflow: "hidden",
          willChange: "transform",
        }}
      >
        <img src={src} alt={alt} style={{ width: "100%", display: "block" }} />
      </motion.div>
    </div>
  );
};

export default AboutImage;
