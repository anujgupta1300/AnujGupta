import { type ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

// Mouse-tracking 3D tilt wrapper. Pointer position maps to rotateX/rotateY.
const TiltCard = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      style={{ rotateX, rotateY, transformPerspective: 1000, ...style }}
    >
      {children}
    </motion.div>
  );
};

export default TiltCard;
