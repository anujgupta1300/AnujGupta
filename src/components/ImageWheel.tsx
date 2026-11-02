import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useVelocity,
  type PanInfo,
} from "motion/react";
import { COLORS } from "@/lib/motion";

/**
 * "In frame: Moments around the work"
 *
 * A draggable, continuously rotating 3D image wheel.
 *
 *  - Cards sit on a virtual cylinder (rotateY + translateZ, equal angular steps).
 *  - The ring's rotation is ONE motion value written straight to `transform`
 *    by a single rAF loop, so nothing re-renders while it spins.
 *  - Angular velocity (deg/s) eases toward a moving target:
 *        target = base drift + scroll boost   (x hover slow-down)
 *    Drag sets the angle directly; on release the flick velocity simply decays
 *    back to the target, which gives natural inertia.
 */

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */

type WheelImage = { src: string; alt: string; pos?: string }; // pos = CSS object-position, for off-centre crops

// Gradient placeholders as inline SVG data URIs: no network, can never 404.
const placeholder = (from: string, to: string, label: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs><rect width="600" height="800" fill="url(#g)"/>` +
    `<text x="300" y="410" fill="rgba(250,250,250,0.55)" font-family="sans-serif" ` +
    `font-size="26" text-anchor="middle" letter-spacing="4">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const fallbackImages: WheelImage[] = [
  { src: placeholder("#0d0e12", "#1d2a44", "MOMENT 01"), alt: "Placeholder moment 1" },
  { src: placeholder("#12131a", "#00536b", "MOMENT 02"), alt: "Placeholder moment 2" },
  { src: placeholder("#0f1018", "#2f3470", "MOMENT 03"), alt: "Placeholder moment 3" },
  { src: placeholder("#0a0a0a", "#243b4a", "MOMENT 04"), alt: "Placeholder moment 4" },
];

// Wheel images. moment-01..09 are the newly added photos (public/Img/).
// Alternating with p1..p4 keeps portrait / landscape / colour rhythm varied.
const projectImages: WheelImage[] = [
  { src: "/Img/a.jpeg", alt: "Two friends at a festival pandal" },
  { src: "/Img/c.jpeg", alt: "Silhouette watching the sunset over green fields", pos: "50% 45%" },
  { src: "/Img/f.jpeg", alt: "Portrait in a blue blazer in front of festival lights" },
  { src: "/Img/z.jpeg", alt: "Portrait in a red kurta against a blue gate" },
  { src: "/Img/p1.jpg", alt: "Talks" },
  { src: "/Img/x.jpeg", alt: "Portrait in neon pink and blue light" },
  { src: "/Img/p2.jpg", alt: "Process" },
  { src: "/Img/j.jpeg", alt: "Childhood photo with mother", pos: "60% 50%" },
  { src: "/Img/p3.jpg", alt: "Studio" },
  { src: "/Img/l.jpeg", alt: "With mother at a temple tree" },
  { src: "/Img/p4.jpg", alt: "On location" },
  { src: "/Img/p.jpeg", alt: "Close-up in sunglasses and a leaf-print shirt", pos: "50% 35%" },
  { src: "/Img/h.jpeg", alt: "Portrait in sunglasses against a blue evening sky" },
];

// Only allow local paths, http(s), blob and image data URIs.
const isSafeSrc = (src: unknown): src is string =>
  typeof src === "string" &&
  /^(\/(?!\/)|\.\/|https?:\/\/|blob:|data:image\/)/i.test(src.trim());

/* -------------------------------------------------------------------------- */
/* Motion tuning                                                              */
/* -------------------------------------------------------------------------- */

const BASE_SPEED = -7; // deg/s. Negative: the front of the wheel drifts left.
const SCROLL_GAIN = 0.045; // extra deg/s per px/s of page scroll velocity
const MAX_SPEED = 170; // deg/s hard cap (scroll boost + flicks)
const HOVER_SLOWDOWN = 0.35; // fraction of speed kept while a mouse hovers the wheel
const EASE_UP = 3.2; // 1/s: how quickly speed ramps toward a faster target
const EASE_DOWN = 1.7; // 1/s: how gently it relaxes (this is the inertia)
const DRAG_BOOST = 1.12; // drag feels slightly livelier than 1:1
const KEY_IMPULSE = 110; // deg/s added by an arrow key (~3 cards of travel)
const MIN_CARDS = 12; // never build a ring thinner than this
const GAP_RATIO = 0.08; // card gap as a fraction of card width

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ImageWheel() {
  const wheel = {
    images: projectImages.length ? projectImages : fallbackImages,
    itemRepeat: 3,
    cardWidth: 3, // in wheel units; 1 unit = --wheel-unit (80px desktop, scales down below)
    cardRadius: 20, // px
  };

  const reduce = useReducedMotion() ?? false;

  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const stageInView = useInView(stageRef, { once: true, margin: "-80px" });
  const onScreen = useInView(stageRef, { margin: "200px" });

  // Ring: sanitised sources, repeated `itemRepeat` times (more if too few cards).
  const { cards, step, radiusK } = useMemo(() => {
    const base = wheel.images.filter((img) => isSafeSrc(img.src));
    const source = base.length ? base : fallbackImages;
    const repeat = Math.max(wheel.itemRepeat, Math.ceil(MIN_CARDS / source.length));
    const total = source.length * repeat;
    return {
      cards: Array.from({ length: total }, (_, i) => ({
        ...source[i % source.length],
        copy: Math.floor(i / source.length),
        key: i,
      })),
      step: 360 / total,
      // radius = (cardWidth + gap) / (2 tan(PI / N))
      radiusK: 1 / (2 * Math.tan(Math.PI / total)),
    };
  }, [wheel.images, wheel.itemRepeat]);

  /* ---- motion state (refs: none of this should trigger a re-render) ---- */
  const rotation = useMotionValue(0); // deg, written to the ring's transform
  const velocity = useRef(BASE_SPEED); // deg/s
  const dragging = useRef(false);
  const hovered = useRef(false);
  const degPerPx = useRef(0.06); // measured from the real card size
  const visible = useRef(false);

  useEffect(() => {
    visible.current = onScreen;
  }, [onScreen]);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY); // px/s, signed, decays to 0 when idle

  // Measure the cylinder so a drag of N px moves the front face by ~N px.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const measure = () => {
      const radius = card.offsetWidth * (1 + GAP_RATIO) * radiusK;
      degPerPx.current = (180 / Math.PI / radius) * DRAG_BOOST;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    return () => ro.disconnect();
  }, [radiusK]);

  // The one high-frequency loop: integrate velocity -> angle.
  useAnimationFrame((_, deltaMs) => {
    if (reduce || dragging.current || !visible.current) return;
    const dt = Math.min(deltaMs, 50) / 1000; // clamp so a background tab can't cause a jump

    const boost = clamp(-scrollVelocity.get() * SCROLL_GAIN, -MAX_SPEED, MAX_SPEED);
    let target = BASE_SPEED + boost;
    if (hovered.current) target *= HOVER_SLOWDOWN;

    // Frame-rate independent exponential easing; faster to speed up than to settle.
    const rate = Math.abs(target) > Math.abs(velocity.current) ? EASE_UP : EASE_DOWN;
    velocity.current += (target - velocity.current) * (1 - Math.exp(-rate * dt));
    velocity.current = clamp(velocity.current, -MAX_SPEED, MAX_SPEED);

    rotation.set(rotation.get() + velocity.current * dt);
  });

  /* ---- drag (pointer + touch) ---- */
  const setGrabbing = (on: boolean) => {
    if (stageRef.current) stageRef.current.dataset.grabbing = on ? "true" : "false";
  };

  const onPanStart = useCallback(() => {
    dragging.current = true;
    setGrabbing(true);
  }, []);

  const onPan = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      rotation.set(rotation.get() + info.delta.x * degPerPx.current);
    },
    [rotation],
  );

  const onPanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      dragging.current = false;
      setGrabbing(false);
      // Hand the flick velocity to the loop; it decays back to the target = inertia.
      velocity.current = reduce
        ? 0
        : clamp(info.velocity.x * degPerPx.current, -MAX_SPEED, MAX_SPEED);
    },
    [reduce],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    if (reduce) rotation.set(rotation.get() + dir * step);
    else velocity.current = clamp(velocity.current + dir * KEY_IMPULSE, -MAX_SPEED, MAX_SPEED);
  };

  // A failed image swaps to an inline placeholder (once) instead of a broken icon.
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.failed) return;
    img.dataset.failed = "true";
    img.src = fallbackImages[Number(img.dataset.idx ?? 0) % fallbackImages.length].src;
  };

  return (
    <section
      id="gallery"
      ref={sectionRef}
      style={{
        // Background kept exactly as the original section.
        background: "linear-gradient(180deg, #0d0e12 0%, #0a0a0a 100%)",
        padding: "clamp(64px, 12vh, 144px) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header: same eyebrow + title as before. */}
      <div
        ref={headRef}
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(16px, 5vw, 96px)",
        }}
      >
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="iw-eyebrow"
        >
          In frame
        </motion.p>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.06 }}
          className="iw-title"
        >
          Moments around the work
        </motion.h2>
      </div>

      {/* Stage */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={stageInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
      >
        <motion.div
          ref={stageRef}
          className="iw-stage"
          role="group"
          aria-roledescription="carousel"
          aria-label="Moments around the work. Drag or use the arrow keys to rotate."
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
          onPointerEnter={(e) => {
            hovered.current = e.pointerType === "mouse";
          }}
          onPointerLeave={() => {
            hovered.current = false;
          }}
          style={
            {
              "--cw": wheel.cardWidth,
              "--k": radiusK,
              "--gap-ratio": GAP_RATIO,
              "--card-r": `${wheel.cardRadius}px`,
              touchAction: "pan-y", // vertical page scroll still works on touch
            } as React.CSSProperties
          }
        >
          <div className="iw-pivot">
            <motion.div className="iw-ring" style={{ rotateY: rotation }}>
              {cards.map((card, i) => (
                <div
                  key={card.key}
                  ref={i === 0 ? cardRef : undefined}
                  className="iw-card"
                  style={{ transform: `rotateY(${i * step}deg) translateZ(var(--radius))` }}
                  aria-hidden={card.copy > 0 ? true : undefined}
                >
                  <div className="iw-face">
                    <img
                      src={card.src}
                      alt={card.copy > 0 ? "" : card.alt}
                      data-idx={i}
                      style={card.pos ? { objectPosition: card.pos } : undefined}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      onError={onImgError}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <p className="iw-hint" aria-hidden>
          Drag to spin · Scroll to speed up
        </p>
      </motion.div>

      <style>{`
        .iw-eyebrow {
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${COLORS.cyan};
          font-weight: 500;
          margin: 0 0 12px;
        }
        .iw-title {
          font-family: var(--font-heading);
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: ${COLORS.white};
          margin: 0;
        }

        /* --wheel-unit scales the whole wheel by breakpoint. */
        .iw-stage {
          --wheel-unit: 80px;
          --w: calc(var(--wheel-unit) * var(--cw));
          --h: calc(var(--w) * 4 / 3);
          --gap: calc(var(--w) * var(--gap-ratio));
          --radius: calc((var(--w) + var(--gap)) * var(--k));

          position: relative;
          height: calc(var(--h) + clamp(56px, 9vw, 110px));
          margin-top: clamp(28px, 5vw, 52px);
          perspective: calc(var(--w) * 7);
          overflow: hidden;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          outline: none;
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%);
                  mask-image: linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%);
        }
        .iw-stage[data-grabbing="true"] { cursor: grabbing; }
        .iw-stage:focus-visible { box-shadow: inset 0 0 0 2px ${COLORS.cyan}; }

        /* Pull the ring back so the front card sits on the screen plane (scale 1). */
        .iw-pivot {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: translateZ(calc(var(--radius) * -1));
        }
        .iw-ring {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .iw-card {
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--w);
          height: var(--h);
          margin: calc(var(--h) / -2) 0 0 calc(var(--w) / -2);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .iw-face {
          width: 100%;
          height: 100%;
          border-radius: var(--card-r);
          overflow: hidden;
          background: #0b0c10;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px -28px rgba(0,0,0,0.85), 0 8px 18px -10px rgba(0,0,0,0.6);
          transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 450ms cubic-bezier(0.23, 1, 0.32, 1),
                      border-color 450ms cubic-bezier(0.23, 1, 0.32, 1);
          will-change: transform;
        }
        .iw-face img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: inherit;
          pointer-events: none;
        }
        @media (hover: hover) {
          .iw-card:hover .iw-face {
            transform: scale(1.06);
            border-color: rgba(0,179,220,0.45);
            box-shadow: 0 40px 70px -26px rgba(0,0,0,0.9), 0 0 36px -12px ${COLORS.cyan};
          }
        }

        .iw-hint {
          margin: clamp(14px, 2.5vw, 24px) 0 0;
          text-align: center;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(250,250,250,0.45);
        }

        @media (max-width: 1023px) { .iw-stage { --wheel-unit: 64px; } }
        @media (max-width: 639px)  { .iw-stage { --wheel-unit: 46px; } }

        @media (prefers-reduced-motion: reduce) {
          .iw-face { transition-duration: 0.001ms; }
          .iw-card:hover .iw-face { transform: none; }
        }
      `}</style>
    </section>
  );
}