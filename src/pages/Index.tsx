import { useEffect, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import LoadingScreen from "@/components/LoadingScreen";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import ImageWheel from "@/components/ImageWheel";
import TechStackSection from "@/components/TechStackSection";
import MarioGame from "@/components/MarioGame";
import WorkSection from "@/components/WorkSection";
import ResearchSection from "@/components/ResearchSection";
import CertificatesSection from "@/components/CertificatesSection";
import PhotographySection from "@/components/PhotographySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { COLORS, FONT_STACK, HEADING_FONT } from "@/lib/motion";

const Index = () => {
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonts: Space Grotesk (headings) + DM Sans (body).
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(link);

    // Global tokens + heading font + a11y focus styles.
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --font-heading: ${HEADING_FONT};
        --font-body: ${FONT_STACK};
        --accent: ${COLORS.cyan};
        --accent-glow: rgba(0,179,220,0.15);
      }
      h1, h2, h3, h4 { font-family: var(--font-heading); }
      [id] { scroll-margin-top: 96px; }
      a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible {
        outline: 2px solid ${COLORS.cyan};
        outline-offset: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
      }
    `;
    document.head.appendChild(style);

    document.body.style.fontFamily = FONT_STACK;
    document.body.style.background = COLORS.white;
    document.body.style.color = COLORS.textPrimary;

    const t = window.setTimeout(() => setLoading(false), reduceMotion ? 300 : 2500);
    return () => {
      window.clearTimeout(t);
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, [reduceMotion]);

  return (
    <div style={{ fontFamily: FONT_STACK, background: COLORS.white }}>
      <AnimatePresence>{loading && <LoadingScreen key="loader" />}</AnimatePresence>

      {!loading && (
        <>
          <Navigation />
          <main>
            <HeroSection />
            <div id="about">
              <AboutSection />
            </div>
            <ExperienceSection />
            <ImageWheel />
            <TechStackSection />
            {/* A quick playable break, sitting right before the projects showcase. */}
            <section
              id="game"
              style={{
                background: COLORS.black,
                padding: "clamp(64px, 12vh, 144px) clamp(16px, 5vw, 96px)",
              }}
            >
              <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
                  Take a break
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: COLORS.white,
                    margin: "0 0 12px",
                  }}
                >
                  You can enjoy here
                </h2>
                <p
                  style={{
                    color: "rgba(250,250,250,0.7)",
                    lineHeight: 1.7,
                    maxWidth: "46ch",
                    margin: "0 0 36px",
                  }}
                >
                  A tiny Mario-style platformer, built from scratch on a canvas. Stomp
                  goombas, grab coins, and dash to the flag. Arrows or WASD to move,
                  Space to jump.
                </p>
                <MarioGame />
              </div>
            </section>

            <WorkSection />
            <ResearchSection />
            <CertificatesSection />
            <PhotographySection />
            <ContactSection />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;
