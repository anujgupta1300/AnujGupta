// circular-gallery.tsx
//
// Adapted from a circular 3D rotating gallery into a LEFT-TO-RIGHT horizontal
// parallax gallery, per the brief. The original rotateY()/requestAnimationFrame
// engine has been fully removed and rebuilt on Motion:
//   useScroll({ target }) -> useSpring (smoothing) -> useTransform (translateX).
// The row travels left -> right as the section scrolls: it starts pushed off to
// the left (negative x) and settles aligned (x = 0). The travel distance is
// MEASURED from the row's real overflow, so it stays correct for any card count
// and viewport size (no empty gaps when there are only a few cards).
//
// Motion polish (all reduced-motion / mobile safe):
//   - staggered card entrance (opacity + rise + scale), gentle no-overshoot spring
//   - per-card scroll-driven drift + subtle tilt for parallax depth
//   - hover micro-interactions: image zoom, caption lift, accent underline, glow
//   - drifting background accent, scroll-progress bar, fading scroll hint
//
// Card visual treatment (rounded corners, border, gradient caption overlay,
// backdrop blur) is carried over from the original source. Accessibility roles
// (region / group + aria-labels) are preserved.
import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { ChevronsRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { COLORS, RADIUS, ACCENT_GRADIENT } from "@/lib/motion";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

interface ParallaxGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Total scroll room for the pinned motion. Tuned to ~220vh so it doesn't
   *  feel like an excessive scroll-trap (the original demo used 500vh). */
  pinHeight?: string;
  /** Rendered inside the sticky viewport so the section heading stays pinned
   *  while the row travels. */
  header?: React.ReactNode;
  /** Rendered pinned to the bottom-left corner of the sticky viewport (and
   *  after the row in the mobile / reduced-motion fallback). */
  footer?: React.ReactNode;
}

// Cards are sized from viewport height (600x800 => 3:4 portrait) so a handful of
// them reliably overflow the width and give the L->R travel room to play out.
const CARD_HEIGHT = "min(64vh, 520px)";
const CARD_ASPECT = "3 / 4";

// Smooth, no-overshoot springs (impeccable motion guidance: ease-out, no bounce).
const ENTRANCE_SPRING = { type: "spring", stiffness: 90, damping: 22, mass: 0.7 } as const;
const ZOOM_SPRING = { type: "spring", stiffness: 140, damping: 30 } as const;
const HOVER_SPRING = { type: "spring", stiffness: 200, damping: 28 } as const;

// Hover variant maps — children read these off the card's "rest"/"hover" state.
const imgVariants = { rest: { scale: 1 }, hover: { scale: 1.08 } };
const captionVariants = { rest: { y: 6 }, hover: { y: 0 } };
const lineVariants = { rest: { scaleX: 0, opacity: 0 }, hover: { scaleX: 1, opacity: 1 } };
const glowVariants = { rest: { opacity: 0 }, hover: { opacity: 1 } };

/**
 * Shared card chrome. Acts as the hover controller: on hover the image performs
 * a slow ken-burns zoom, the caption lifts, an accent underline grows, and a
 * cyan glow ring fades in. `reduce` strips all of that back to a static card.
 */
function CardVisual({ item, reduce }: { item: GalleryItem; reduce: boolean }) {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover={reduce ? undefined : "hover"}
      transition={HOVER_SPRING}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 24px 50px -28px rgba(10,10,10,0.55)",
      }}
    >
      <motion.img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        variants={reduce ? undefined : imgVariants}
        transition={ZOOM_SPRING}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Cyan glow ring, revealed on hover */}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          variants={glowVariants}
          transition={HOVER_SPRING}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS.lg,
            boxShadow: `inset 0 0 0 1.5px ${COLORS.cyan}, 0 0 38px -6px ${COLORS.cyan}`,
            pointerEvents: "none",
          }}
        />
      )}

      {item.caption && (
        <motion.div
          variants={reduce ? undefined : captionVariants}
          transition={HOVER_SPRING}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "26px 18px 16px",
            background:
              "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.82) 100%)",
            color: COLORS.white,
          }}
        >
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{item.caption}</p>
          {/* Accent underline that grows from the left on hover */}
          <motion.span
            aria-hidden="true"
            variants={reduce ? undefined : lineVariants}
            transition={HOVER_SPRING}
            style={{
              display: "block",
              height: 2,
              width: 44,
              marginTop: 8,
              borderRadius: 2,
              transformOrigin: "left center",
              background: ACCENT_GRADIENT,
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * One card in the pinned row. Outer wrapper handles the staggered entrance
 * (opacity + rise + scale); inner wrapper carries the scroll-linked parallax
 * (x / y drift + a subtle tilt) so the two transforms never fight.
 */
function ParallaxCard({
  item,
  index,
  inView,
  progress,
  depth,
}: {
  item: GalleryItem;
  index: number;
  inView: boolean;
  progress: MotionValue<number>;
  depth: number;
}) {
  // Cards at different "depths" drift + tilt at different rates as you scroll.
  const x = useTransform(progress, [0, 1], [-depth, depth]);
  const y = useTransform(progress, [0, 1], [depth * 0.3, depth * -0.3]);
  const rotate = useTransform(progress, [0, 1], [depth * -0.02, depth * 0.02]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 56, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ ...ENTRANCE_SPRING, delay: index * 0.1 }}
      style={{ flex: "0 0 auto", height: CARD_HEIGHT, aspectRatio: CARD_ASPECT }}
    >
      <motion.div
        role="group"
        aria-label={item.caption ?? item.alt}
        style={{ x, y, rotate, width: "100%", height: "100%", willChange: "transform" }}
      >
        <CardVisual item={item} reduce={false} />
      </motion.div>
    </motion.div>
  );
}

/** Static horizontal scroll-snap row used for reduced-motion and mobile.
 *  Native touch swipe, no scroll-jacking, 44px+ targets. */
function SnapRow({
  items,
  label,
  reduce,
}: {
  items: GalleryItem[];
  label: string;
  reduce: boolean;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        padding: "8px 4px 20px",
        scrollbarWidth: "thin",
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          role="group"
          aria-label={item.caption ?? item.alt}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ ...ENTRANCE_SPRING, delay: (i % 2) * 0.08 }}
          style={{
            flex: "0 0 auto",
            width: "min(78vw, 300px)",
            aspectRatio: CARD_ASPECT,
            scrollSnapAlign: "center",
          }}
        >
          <CardVisual item={item} reduce={reduce} />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Left-to-right parallax gallery. Self-contained pinned structure:
 * a tall outer wrapper gives the scroll room, an inner `sticky top-0` viewport
 * holds the row that translates from off-left to aligned as you scroll through.
 */
export const ParallaxGallery = ({
  items,
  pinHeight = "220vh",
  header,
  footer,
  className,
  ...props
}: ParallaxGalleryProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, margin: "-120px" });
  const reduce = useReducedMotion() ?? false;
  const isMobile = useIsMobile();

  // Measured overflow (px the row must travel). Recomputed on resize so the L->R
  // sweep always matches the real content width — no fixed-percentage guesswork.
  const [travel, setTravel] = useState(0);
  useEffect(() => {
    const row = rowRef.current;
    const viewport = viewportRef.current;
    if (!row || !viewport) return;
    const measure = () =>
      setTravel(Math.max(0, row.scrollWidth - viewport.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [items.length, reduce, isMobile]);

  // Section-specific scroll progress (not whole-document), 0 as the section
  // enters from the bottom -> 1 as it leaves the top. A soft, well-damped spring
  // makes the scroll-linked motion glide rather than track raw scroll 1:1.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 24,
    mass: 0.6,
    restDelta: 0.0004,
  });

  // Row travels left -> right: starts shifted off-left (-travel), ends aligned (0).
  const rowX = useTransform(smooth, [0, 1], [-travel, 0]);
  // Background accent drifts the opposite way for added depth.
  const bgX = useTransform(smooth, [0, 1], ["8%", "-14%"]);
  // Scroll hint fades out once the user has started moving through the section.
  const hintOpacity = useTransform(smooth, [0, 0.12], [1, 0]);

  // Reduced motion or narrow viewport: skip the pin + scroll-link entirely and
  // fall back to a swipeable scroll-snap carousel.
  if (reduce || isMobile) {
    return (
      <div className={className} {...props}>
        {header}
        <SnapRow items={items} label="Photography gallery" reduce={reduce} />
        {footer && (
          <div style={{ padding: "8px clamp(16px, 5vw, 96px) 24px" }}>{footer}</div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      role="region"
      aria-label="Photography parallax gallery"
      className={cn("relative", className)}
      style={{ height: pinHeight }}
      {...props}
    >
      <div
        ref={stageRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Drifting background accent (decorative) */}
        <motion.div
          aria-hidden="true"
          style={{
            x: bgX,
            position: "absolute",
            top: "12%",
            left: "30%",
            width: "60vw",
            height: "60vw",
            maxWidth: 760,
            maxHeight: 760,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.cyan}22 0%, transparent 60%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {header && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...ENTRANCE_SPRING, delay: 0.05 }}
            style={{
              flex: "0 0 auto",
              padding: "0 clamp(16px, 5vw, 96px)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {header}
          </motion.div>
        )}

        <div
          ref={viewportRef}
          style={{
            flex: "1 1 auto",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            ref={rowRef}
            style={{
              x: rowX,
              display: "flex",
              gap: 28,
              paddingLeft: "clamp(16px, 5vw, 96px)",
              paddingRight: "clamp(16px, 5vw, 96px)",
              willChange: "transform",
            }}
          >
            {items.map((item, i) => (
              <ParallaxCard
                key={item.id}
                item={item}
                index={i}
                inView={inView}
                progress={smooth}
                // Alternate depth so neighbouring cards separate as they move.
                depth={i % 2 === 0 ? 48 : 22}
              />
            ))}
          </motion.div>
        </div>

        {/* Footer (e.g. "See more") pinned to the bottom-left corner */}
        {footer && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...ENTRANCE_SPRING, delay: 0.2 }}
            style={{
              position: "absolute",
              bottom: 28,
              left: "clamp(16px, 5vw, 96px)",
              zIndex: 2,
            }}
          >
            {footer}
          </motion.div>
        )}

        {/* Scroll hint — fades away as the section is scrolled through */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: hintOpacity,
            position: "absolute",
            bottom: 30,
            right: "clamp(16px, 5vw, 96px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(250,250,250,0.7)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          Scroll
          <motion.span
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-flex", color: COLORS.cyan }}
          >
            <ChevronsRight size={18} strokeWidth={2} />
          </motion.span>
        </motion.div>

        {/* Scroll-progress bar pinned to the bottom edge */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            zIndex: 2,
          }}
        >
          <motion.div
            style={{
              height: "100%",
              transformOrigin: "left center",
              scaleX: smooth,
              background: ACCENT_GRADIENT,
            }}
          />
        </div>
      </div>
    </div>
  );
};

ParallaxGallery.displayName = "ParallaxGallery";
