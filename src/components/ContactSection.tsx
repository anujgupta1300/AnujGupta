import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "motion/react";
import { Github, Linkedin, Instagram, Facebook, Check, Loader2, Mail, MapPin, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/lib/supabase";
import { COLORS, RADIUS } from "@/lib/motion";

const CONTACT_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_105838_084968f2-4415-42a4-971a-3bec54539549.mp4";

const EMAIL = "anujgupta3600@gmail.com";

const SOCIALS = [
  { Icon: Github, label: "GitHub", href: "https://github.com/anujgupta1300" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/anuj-gupta-a0503a352/" },
  { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/anuj_gupta3600" },
  { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1BEqiWHWCE/" },
];

const CARDS = [
  { id: "message", title: "Message" },
  { id: "find", title: "Find me" },
  { id: "availability", title: "Availability" },
] as const;

const CARD_BG = "rgba(16,16,20,0.86)";
const CARD_BORDER = "1px solid rgba(255,255,255,0.1)";

const fanSpring = { type: "spring", stiffness: 200, damping: 25 } as const;

type Status = "idle" | "sending" | "sent";

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  textarea,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  error?: string;
}) {
  const [focus, setFocus] = useState(false);
  const base: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${error ? "#ef4444" : focus ? COLORS.cyan : "rgba(255,255,255,0.12)"}`,
    borderRadius: RADIUS.md,
    padding: "11px 14px",
    color: COLORS.white,
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxShadow: focus ? "0 0 0 3px rgba(0,179,220,0.12)" : "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        htmlFor={name}
        style={{
          fontSize: 13,
          color: "rgba(250,250,250,0.7)",
          letterSpacing: "0.04em",
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={`Your ${label.toLowerCase()}`}
          required
          style={{ ...base, minHeight: 96, resize: "vertical" }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={`Your ${label.toLowerCase()}`}
          required
          style={base}
        />
      )}
      {error && <p style={{ color: "#f87171", fontSize: 13, margin: "6px 0 0" }}>{error}</p>}
    </div>
  );
}

function SocialButton({ Icon, label, href }: (typeof SOCIALS)[number]) {
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
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${hover ? COLORS.cyan : "rgba(255,255,255,0.12)"}`,
        color: hover ? COLORS.cyan : COLORS.white,
        transform: hover ? "scale(1.05)" : "scale(1)",
        transition: "all 0.2s ease",
      }}
    >
      <Icon size={20} strokeWidth={1.5} />
    </a>
  );
}

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: 20,
  fontWeight: 600,
  color: COLORS.white,
  margin: "0 0 18px",
};

function MessageCard({
  form,
  setForm,
  status,
  error,
  reduce,
  onSubmit,
}: MessageCtx) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "sent" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 14,
            height: "100%",
          }}
        >
          <motion.span
            initial={reduce ? { scale: 1 } : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: COLORS.cyan,
              color: "#001016",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={28} strokeWidth={2} />
          </motion.span>
          <h3 style={{ ...cardTitleStyle, margin: 0 }}>Message sent</h3>
          <p style={{ color: "rgba(250,250,250,0.7)", margin: 0, maxWidth: "30ch" }}>
            Thanks for reaching out. I will get back to you soon.
          </p>
        </motion.div>
      ) : (
        <form key="form" onSubmit={onSubmit}>
          {/* Honeypot: invisible to humans, often filled by bots. Submissions
              with this set are silently dropped (see handleSubmit). Not a real
              field — kept out of layout, tab order, and assistive tech. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          />
          <h3 style={cardTitleStyle}>Send a message</h3>
          <Field label="Name" name="name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            error={error && error.toLowerCase().includes("email") ? error : undefined}
          />
          <Field
            label="Message"
            name="message"
            textarea
            value={form.message}
            onChange={(v) => setForm((f) => ({ ...f, message: v }))}
          />
          {error && !error.toLowerCase().includes("email") && (
            <p style={{ color: "#f87171", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
          )}
          <motion.button
            type="submit"
            disabled={status === "sending"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: "100%",
              minHeight: 46,
              padding: 13,
              background: COLORS.cyan,
              color: "#001016",
              fontWeight: 600,
              fontSize: 15,
              borderRadius: RADIUS.md,
              border: "none",
              cursor: status === "sending" ? "default" : "pointer",
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
          >
            {status === "sending" ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-flex" }}
                >
                  <Loader2 size={18} strokeWidth={2} />
                </motion.span>
                Sending
              </>
            ) : (
              "Send message"
            )}
          </motion.button>
        </form>
      )}
    </AnimatePresence>
  );
}

function FindCard() {
  return (
    <div>
      <h3 style={cardTitleStyle}>Find me elsewhere</h3>
      <a
        href={`mailto:${EMAIL}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          minHeight: 44,
          color: COLORS.white,
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        <Mail size={18} strokeWidth={1.5} color={COLORS.cyan} />
        {EMAIL}
      </a>
      <p style={{ color: "rgba(250,250,250,0.7)", lineHeight: 1.6, margin: "4px 0 20px", maxWidth: "34ch" }}>
        Direct email is fastest. Or reach me on any of these.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {SOCIALS.map((s) => (
          <SocialButton key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}

function AvailabilityCard() {
  const rows = [
    { Icon: Check, label: "Open to work and collaborations" },
    { Icon: Clock, label: "Replies usually within 24 hours" },
    { Icon: MapPin, label: "Based in Dhaka, working with teams anywhere" },
  ];
  return (
    <div>
      <h3 style={cardTitleStyle}>Availability</h3>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 100,
          background: "rgba(0,179,220,0.12)",
          border: "1px solid rgba(0,179,220,0.3)",
          marginBottom: 20,
        }}
      >
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 9, height: 9, borderRadius: "50%", background: COLORS.cyan, display: "inline-block" }}
        />
        <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.cyan }}>Available now</span>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(({ Icon, label }) => (
          <li key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: RADIUS.md,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
                border: CARD_BORDER,
                color: COLORS.cyan,
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
            </span>
            <span style={{ color: "rgba(250,250,250,0.85)", fontSize: 15, lineHeight: 1.5 }}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardBody({ id, ctx }: { id: string; ctx: MessageCtx }) {
  if (id === "message") return <MessageCard {...ctx} />;
  if (id === "find") return <FindCard />;
  return <AvailabilityCard />;
}

type MessageCtx = {
  form: { name: string; email: string; message: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; message: string }>>;
  status: Status;
  error: string;
  reduce: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

// Segmented selector — visible in both modes so the three cards are discoverable
// without relying on the desktop hover-fan alone.
function CardTabs({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <div role="tablist" aria-label="Contact options" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {CARDS.map((c, i) => (
        <button
          key={c.id}
          role="tab"
          aria-selected={active === i}
          onClick={() => onSelect(i)}
          style={{
            flex: 1,
            minHeight: 44,
            padding: "10px 8px",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
            color: active === i ? "#001016" : COLORS.white,
            background: active === i ? COLORS.cyan : "rgba(255,255,255,0.05)",
            border: active === i ? "none" : "1px solid rgba(255,255,255,0.12)",
            borderRadius: RADIUS.md,
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [active, setActive] = useState(0);
  const [deckHover, setDeckHover] = useState(false);

  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-80px" });

  const isMobile = useIsMobile();
  const reduce = useReducedMotion() ?? false;
  const useTabs = isMobile || reduce;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Read the honeypot synchronously — e.currentTarget is nulled after the await.
    const honeypot = new FormData(e.currentTarget as HTMLFormElement)
      .get("company")
      ?.toString()
      .trim();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address");
      return;
    }
    // Bot detected: show the same success UI but never hit the database.
    if (honeypot) {
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      return;
    }
    setStatus("sending");
    try {
      // created_at and subject are owned by the table defaults, so we only send
      // what the user actually typed.
      const { error: dbError } = await supabase.from("contact_messages").insert([
        {
          name: form.name,
          email: form.email,
          message: form.message,
        },
      ]);
      if (dbError) throw dbError;
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("idle");
      setError("Could not send. Email anujgupta3600@gmail.com directly.");
    }
  };

  const ctx: MessageCtx = { form, setForm, status, error, reduce, onSubmit: handleSubmit };

  // Resting + fanned transform for each non-active card. Two non-active cards
  // split to the left and right of the active one when the deck is hovered.
  const deckTarget = (i: number) => {
    if (i === active) return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 30 };
    const others = [0, 1, 2].filter((n) => n !== active);
    const side = others.indexOf(i) === 0 ? -1 : 1;
    if (deckHover) {
      return { x: side * 60, y: -10, rotate: side * 7, scale: 0.95, opacity: 0.96, zIndex: 20 };
    }
    const depth = others.indexOf(i) + 1;
    return { x: 0, y: -depth * 14, rotate: side * 3, scale: 1 - depth * 0.05, opacity: 0.5, zIndex: 20 - depth };
  };

  const cardShell: React.CSSProperties = {
    background: CARD_BG,
    border: CARD_BORDER,
    borderRadius: RADIUS.lg,
    padding: "clamp(22px, 3vw, 32px)",
  };

  return (
    <section
      id="contact"
      style={{
        position: "relative",
        overflow: "hidden",
        background: COLORS.black,
        color: COLORS.white,
        padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
      }}
    >
      {/* Ambient video background (decorative) */}
      <video
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src={CONTACT_VIDEO} type="video/mp4" />
      </video>
      {/* Scrim keeps all text WCAG AA over the moving footage */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(10,10,12,0.82) 0%, rgba(10,10,12,0.9) 55%, rgba(10,10,12,0.95) 100%)",
        }}
      />

      <div
        className="contact-grid"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "40% 60%",
          gap: "clamp(32px, 5vw, 72px)",
          alignItems: "start",
        }}
      >
        {/* Brand expression */}
        <div>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: RADIUS.lg,
              background: "rgba(0,179,220,0.1)",
              border: "1px solid rgba(0,179,220,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <img src="/moon-icon.svg" alt="" aria-hidden="true" style={{ width: 36, height: 36 }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              margin: 0,
              textWrap: "balance",
            }}
          >
            Let's build something.
          </h2>
          <p
            style={{
              color: "rgba(250,250,250,0.78)",
              lineHeight: 1.7,
              maxWidth: "38ch",
              marginTop: 16,
            }}
          >
            Collaboration, research, or a quick question. Pick a card and reach out the way that suits you.
          </p>
        </div>

        {/* Interactive cards */}
        <motion.div
          ref={cardsRef}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={cardsInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <CardTabs active={active} onSelect={setActive} />

          {useTabs ? (
            <div style={cardShell}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={CARDS[active].id}
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                  transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CardBody id={CARDS[active].id} ctx={ctx} />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
          <div
            onMouseEnter={() => setDeckHover(true)}
            onMouseLeave={() => setDeckHover(false)}
            style={{ position: "relative", height: 480 }}
          >
            {CARDS.map((c, i) => {
              const isActive = i === active;
              return (
                <motion.div
                  key={c.id}
                  animate={deckTarget(i)}
                  transition={fanSpring}
                  style={{
                    ...cardShell,
                    position: "absolute",
                    inset: 0,
                    boxShadow: isActive
                      ? "0 30px 70px -30px rgba(0,0,0,0.8)"
                      : "0 18px 50px -28px rgba(0,0,0,0.7)",
                    transformOrigin: "center bottom",
                  }}
                >
                  {/* Inert hidden cards stay out of the tab order */}
                  <div
                    ref={(el) => {
                      if (el) (el as HTMLDivElement & { inert: boolean }).inert = !isActive;
                    }}
                    aria-hidden={!isActive}
                    style={{ height: "100%" }}
                  >
                    <CardBody id={c.id} ctx={ctx} />
                  </div>
                  {/* Promote a peeking card to the front */}
                  {!isActive && (
                    <button
                      onClick={() => setActive(i)}
                      aria-label={`Show ${c.title}`}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: RADIUS.lg,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default ContactSection;
