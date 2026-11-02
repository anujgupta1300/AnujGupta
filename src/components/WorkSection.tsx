import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Clock } from "lucide-react";
import { COLORS, RADIUS, spring } from "@/lib/motion";

interface Project {
  src: string;
  title: string;
  tags: string[];
  href?: string;
  reload?: boolean;
}

const PROJECTS: Project[] = [
  { src: "/Img/work-1.png", title: "2D snake Game", tags: ["Java"], href: "https://github.com/anujgupta1300/Snake-Game" },
  { src: "/Img/work-2.png", title: "Rail Reservation system", tags: ["Java"], href: "https://github.com/anujgupta1300/Railway-Reservation-System-JAVA-GUI-" },
  { src: "/Img/work-3.png", title: "Jira's Weather", tags: ["React", "Supabase", "Node Js"], href: "https://jirasweb.netlify.app/" },
  // Work 4: per the brief, this reloads the current portfolio page instead of
  // navigating to a project. Flagged back to the user as an unusual choice.
  { src: "/Img/work-4.png", title: "Portfolio Website", tags: ["React", "Supabase", "Node Js", "Motion"], reload: true },
  { src: "/Img/work-5.png", title: "Aspera Rental shop", tags: ["C#", "WinFrame", "SQL SERVER", ".NET"], reload: true },
];

// Full-bleed, keyboard-focusable interactive layer. Sits above the artwork so
// the whole card is the click/tap target (>44px), without altering the existing
// card layout, copy, or hover/motion treatment.
function CardLink({ project }: { project: Project }) {
  const cover: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    display: "block",
    width: "100%",
    height: "100%",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  if (project.reload) {
    return (
      <button
        type="button"
        onClick={() => window.location.reload()}
        aria-label={`${project.title} — reload this page`}
        style={cover}
      />
    );
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View project: ${project.title} (opens in new tab)`}
      style={cover}
    />
  );
}

function WorkCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...spring, delay: (index % 2) * 0.1 }}
      whileHover="hover"
      style={{
        position: "relative",
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        aspectRatio: "4 / 3",
        cursor: "pointer",
      }}
    >
      <motion.img
        src={project.src}
        alt={project.title}
        variants={{ hover: { scale: 1.08 } }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <motion.div
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 28,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0) 30%, rgba(10,10,10,0.78) 100%)",
        }}
      >
        <h3 style={{ color: COLORS.white, fontSize: 24, fontWeight: 500, margin: "0 0 10px" }}>
          {project.title}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {project.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 12,
                color: COLORS.white,
                padding: "4px 10px",
                borderRadius: RADIUS.sm,
                border: "1px solid rgba(250,250,250,0.4)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
      <CardLink project={project} />
    </motion.div>
  );
}

function ComingSoonCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...spring, delay: 0.1 }}
      style={{
        position: "relative",
        borderRadius: RADIUS.lg,
        aspectRatio: "4 / 3",
        overflow: "hidden",
        background: "rgba(10,10,15,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        textAlign: "center",
        padding: 28,
      }}
    >
      {/* Animated dashed accent border */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: RADIUS.lg,
          border: `2px dashed ${COLORS.cyan}`,
          pointerEvents: "none",
        }}
      />
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 56,
          height: 56,
          borderRadius: RADIUS.md,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,179,220,0.12)",
          border: "1px solid rgba(0,179,220,0.3)",
          color: COLORS.cyan,
        }}
      >
        <Clock size={26} strokeWidth={1.5} />
      </motion.span>
      <h3 style={{ color: COLORS.white, fontSize: 20, fontWeight: 600, margin: 0 }}>Coming soon</h3>
      <p style={{ color: "rgba(250,250,250,0.6)", fontSize: 14, margin: 0, maxWidth: "28ch" }}>
        New projects are in development. Check back shortly.
      </p>
    </motion.div>
  );
}

const WorkSection = () => {
  return (
    <section
      id="work"
      style={{
        background: COLORS.surface,
        padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
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
          Selected work
        </p>
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
          Projects
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: 24,
          }}
        >
          {PROJECTS.map((p, i) => (
            <WorkCard key={p.title} project={p} index={i} />
          ))}
          <ComingSoonCard />
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
