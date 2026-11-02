import { motion, type Variants } from "motion/react";
import { COLORS, exitEase } from "@/lib/motion";

const NAME = "ANUJ GUPTA";

const containerVariants: Variants = {
  initial: { y: 0 },
  exit: {
    y: "-100vh",
    transition: { duration: 0.9, ease: exitEase, delay: 0.2 },
  },
};

const charVariants: Variants = {
  hidden: { y: 120, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.06, type: "spring", stiffness: 100, damping: 14 },
  }),
};

const LoadingScreen = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      exit="exit"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: COLORS.black,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Hero backdrop */}
      <motion.img
        src="/Img/load.png"
        alt=""
        aria-hidden="true"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, type: "spring", stiffness: 60, damping: 18 }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.32,
        }}
      />

      {/* Name split into characters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          position: "relative",
          padding: "0 16px",
        }}
      >
        {NAME.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            custom={i}
            variants={charVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: "inline-block",
              color: COLORS.white,
              fontSize: "clamp(2.5rem, 11vw, 7rem)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              whiteSpace: "pre",
            }}
          >
            {char === " " ? " " : char}
          </motion.span>
        ))}
      </div>

      {/* Role */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
        style={{
          position: "relative",
          marginTop: 24,
          color: COLORS.textMuted,
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        Full-Stack Developer × Computer Engineer
      </motion.p>

      {/* Progress bar */}
      <div
        style={{
          position: "relative",
          marginTop: 48,
          width: "min(280px, 60vw)",
          height: 2,
          background: "rgba(250,250,250,0.12)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "linear", delay: 0.3 }}
          style={{ height: "100%", background: COLORS.yellow }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
