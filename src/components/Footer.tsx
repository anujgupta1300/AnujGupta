import { useState } from "react";
import { Github, Linkedin, Instagram, Facebook } from "lucide-react";
import { COLORS } from "@/lib/motion";

const SOCIALS = [
  { Icon: Github, label: "GitHub", href: "https://github.com/anujgupta1300" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/anuj-gupta-a0503a352/" },
  { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/anuj_gupta3600" },
  { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1BEqiWHWCE/" },
];

function SocialIcon({ Icon, label, href }: (typeof SOCIALS)[number]) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        color: hover ? COLORS.yellow : COLORS.white,
        transition: "color 0.2s ease",
      }}
    >
      <Icon size={22} strokeWidth={1.5} />
    </a>
  );
}

const Footer = () => {
  return (
    <footer
      style={{
        background: COLORS.black,
        color: COLORS.white,
        padding: "32px clamp(16px, 5vw, 48px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 14, color: COLORS.textMuted }}>© 2026 Anuj Gupta</span>
        <div style={{ display: "flex", gap: 8 }}>
          {SOCIALS.map((s) => (
            <SocialIcon key={s.label} {...s} />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
