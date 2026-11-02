import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { COLORS, RADIUS, spring } from "@/lib/motion";

const CARDS = [
  {
    title: "React / TypeScript",
    note: "Component systems, hooks, and typed UIs.",
    bg: COLORS.indigo,
    area: "a",
  },
  {
    title: "Node.js / APIs",
    note: "REST services, auth, and real-time data.",
    bg: COLORS.yellow,
    area: "b",
  },
  {
    title: "AWS / Docker",
    note: "Containerized deploys and cloud infra.",
    bg: COLORS.red,
    area: "c",
  },
  {
    title: "Python / ML",
    note: "Automation, data, and IoT systems.",
    bg: COLORS.cardGray,
    area: "d",
  },
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ&/0123456789";

// Text scramble: cycle random glyphs, settling left-to-right once in view.
function ScrambleText({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const total = text.length;
    const id = window.setInterval(() => {
      frame += 1;
      const settled = Math.floor(frame / 2);
      const next = text
        .split("")
        .map((ch, i) => {
          if (ch === " ") return " ";
          if (i < settled) return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(next);
      if (settled >= total) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [active, text]);

  return <span>{display}</span>;
}

const TechStackSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      style={{
        background: COLORS.white,
        padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: COLORS.textPrimary,
            margin: "0 0 48px",
          }}
        >
          <ScrambleText text="Tools and Technologies" active={inView} />
        </h2>

        <div className="tech-grid">
          {CARDS.map((card, i) => (
            <motion.article
              key={card.title}
              style={{ gridArea: card.area, background: card.bg, borderRadius: RADIUS.lg }}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: i * 0.1 }}
              whileHover={{ scale: 1.06, rotate: -1 }}
            >
              <div
                style={{
                  padding: 32,
                  minHeight: 180,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  color: COLORS.white,
                }}
              >
                <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 500 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 8px" }}>{card.title}</h3>
                  <p style={{ fontSize: 16, fontWeight: 400, margin: 0, opacity: 0.88 }}>
                    {card.note}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <style>{`
        .tech-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(3, 1fr);
          grid-template-areas:
            "a a b"
            "c d d";
        }
        @media (max-width: 760px) {
          .tech-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "a a"
              "b c"
              "d d";
          }
        }
        @media (max-width: 480px) {
          .tech-grid {
            grid-template-columns: 1fr;
            grid-template-areas: "a" "b" "c" "d";
          }
        }
      `}</style>
    </section>
  );
};

export default TechStackSection;
