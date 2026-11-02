import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X } from "lucide-react";
import { COLORS, RADIUS } from "@/lib/motion";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Research", href: "#research" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function NavLink({
  link,
  active,
  onClick,
}: {
  link: { label: string; href: string };
  active: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={link.href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        fontSize: 15,
        fontWeight: 500,
        textDecoration: "none",
        padding: "6px 4px",
        color: active ? COLORS.cyan : "rgba(250,250,250,0.86)",
        transition: "color 0.2s ease",
      }}
    >
      <motion.span
        animate={{ scale: hover ? 1.06 : 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        style={{ display: "inline-block" }}
      >
        {link.label}
      </motion.span>
      {/* Hover underline (faint, per-link) */}
      {hover && !active && (
        <span
          style={{
            position: "absolute",
            left: 4,
            right: 4,
            bottom: -2,
            height: 2,
            borderRadius: 2,
            background: "rgba(0,179,220,0.4)",
          }}
        />
      )}
      {/* Active indicator slides between links via shared layoutId */}
      {active && (
        <motion.span
          layoutId="nav-underline"
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          style={{
            position: "absolute",
            left: 4,
            right: 4,
            bottom: -2,
            height: 2,
            borderRadius: 2,
            background: COLORS.cyan,
            boxShadow: `0 0 10px ${COLORS.cyan}`,
          }}
        />
      )}
    </a>
  );
}

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  const handleClick = (href: string) => {
    setActive(href);
    setOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.15 }}
      style={{
        position: "fixed",
        top: scrolled ? 10 : 18,
        left: "50%",
        translateX: "-50%",
        zIndex: 100,
        width: "min(94vw, 1100px)",
      }}
    >
      <motion.div
        animate={{
          paddingTop: scrolled ? 8 : 12,
          paddingBottom: scrolled ? 8 : 12,
          backgroundColor: scrolled ? "rgba(15,15,20,0.62)" : "rgba(15,15,20,0.45)",
          boxShadow: scrolled
            ? "0 24px 60px -20px rgba(0,0,0,0.85)"
            : "0 16px 44px -24px rgba(0,0,0,0.7)",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 20,
          paddingRight: 20,
          borderRadius: RADIUS.lg,
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <a
          href="#top"
          onClick={() => handleClick("")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <img src="/moon-icon.svg" alt="" aria-hidden="true" style={{ width: 26, height: 26 }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>
            <span style={{ color: COLORS.white }}>Anuj </span>
            <span style={{ color: COLORS.cyan }}>Gupta</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 26, alignItems: "center" }}>
          {LINKS.map((link) => (
            <NavLink
              key={link.href}
              link={link}
              active={active === link.href}
              onClick={() => handleClick(link.href)}
            />
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="nav-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "none",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: COLORS.white,
            padding: 8,
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </motion.div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            style={{
              marginTop: 10,
              background: "rgba(15,15,20,0.72)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: RADIUS.lg,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleClick(link.href)}
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active === link.href ? COLORS.cyan : "rgba(250,250,250,0.9)",
                  padding: "12px 12px",
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: RADIUS.md,
                }}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 820px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navigation;
