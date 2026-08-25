import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Grid,
  Link as MuiLink,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CodeIcon from "@mui/icons-material/Code";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";

// ─── Animated Liquid Background (matches LandingPage exactly) ───────────────
const LiquidBackground = React.memo(() => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    <Box sx={{
      position: "absolute",
      top: "-15vh",
      left: "-10vw",
      width: { xs: "60vw", md: "45vw" },
      height: { xs: "60vw", md: "45vw" },
      borderRadius: "50%",
      background: "radial-gradient(circle at 40% 40%, rgba(228,63,111,0.28) 0%, rgba(192,45,90,0.12) 50%, transparent 70%)",
      filter: "blur(60px)",
      animation: "orbFloat1 22s ease-in-out infinite",
      "@keyframes orbFloat1": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "33%": { transform: "translate(4vw, 6vh) scale(1.08)" },
        "66%": { transform: "translate(-3vw, 3vh) scale(0.95)" },
      },
    }} />
    <Box sx={{
      position: "absolute",
      bottom: "5vh",
      right: "-12vw",
      width: { xs: "55vw", md: "38vw" },
      height: { xs: "55vw", md: "38vw" },
      borderRadius: "50%",
      background: "radial-gradient(circle at 60% 60%, rgba(160,20,60,0.22) 0%, rgba(100,10,40,0.1) 50%, transparent 70%)",
      filter: "blur(70px)",
      animation: "orbFloat2 28s ease-in-out infinite reverse",
      "@keyframes orbFloat2": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "50%": { transform: "translate(-5vw, -4vh) scale(1.1)" },
      },
    }} />
    <Box sx={{
      position: "absolute",
      top: "40vh",
      left: "30vw",
      width: { xs: "40vw", md: "28vw" },
      height: { xs: "40vw", md: "28vw" },
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(228,63,111,0.07) 0%, transparent 70%)",
      filter: "blur(80px)",
      animation: "orbFloat3 35s ease-in-out infinite",
      "@keyframes orbFloat3": {
        "0%,100%": { transform: "translate(0,0)" },
        "50%": { transform: "translate(6vw, -8vh)" },
      },
    }} />
    <Box sx={{
      position: "absolute",
      inset: 0,
      opacity: 0.025,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "128px 128px",
    }} />
  </Box>
));

// ─── Glass Panel ─────────────────────────────────────────────────────────────
const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={{
      background: "rgba(255,255,255,0.03)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderTop: "1px solid rgba(255,255,255,0.14)",
      borderLeft: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "28px",
      boxShadow: [
        "0 1px 0 rgba(255,255,255,0.07) inset",
        "0 24px 64px rgba(0,0,0,0.65)",
        "8px 8px 20px rgba(0,0,0,0.45)",
        "-3px -3px 10px rgba(255,255,255,0.015)",
      ].join(", "),
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

// ─── Neumorphic Card ──────────────────────────────────────────────────────────
const NeumorphCard = ({ children, sx = {}, expanded = false, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      background: "linear-gradient(145deg, #1c1419, #130f12)",
      borderRadius: "28px",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: [
        "6px 6px 20px rgba(0,0,0,0.7)",
        "-3px -3px 10px rgba(255,255,255,0.025)",
        "0 1px 0 rgba(255,255,255,0.07) inset",
      ].join(", "),
      transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      cursor: onClick ? "pointer" : "default",
      "&:hover": onClick ? {
        transform: "translateY(-5px)",
        borderColor: "rgba(228,63,111,0.2)",
        boxShadow: [
          "8px 12px 32px rgba(0,0,0,0.75)",
          "-2px -2px 8px rgba(255,255,255,0.025)",
          "0 1px 0 rgba(255,255,255,0.09) inset",
          "0 4px 28px rgba(228,63,111,0.12)",
        ].join(", "),
      } : {},
      ...sx,
    }}
  >
    {children}
  </Box>
);

// ─── Liquid Orb ───────────────────────────────────────────────────────────────
const LiquidOrb = ({ size = 80, color = "rgba(228,63,111,0.7)", sx = {} }) => (
  <Box sx={{
    width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, ${color} 45%, rgba(0,0,0,0.4) 100%)`,
    boxShadow: [
      `0 ${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.6)`,
      `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.15)`,
      `inset ${size * 0.03}px ${size * 0.03}px ${size * 0.08}px rgba(255,255,255,0.2)`,
    ].join(", "),
    flexShrink: 0,
    ...sx,
  }} />
);

// ─── Section icon map ─────────────────────────────────────────────────────────
const sectionMeta = [
  { icon: PersonIcon,    accent: "rgba(228,63,111,0.85)" },
  { icon: CodeIcon,      accent: "rgba(228,63,111,0.75)" },
  { icon: GraphicEqIcon, accent: "rgba(228,63,111,0.75)" },
  { icon: MusicNoteIcon, accent: "rgba(228,63,111,0.75)" },
  { icon: SecurityIcon,  accent: "rgba(228,63,111,0.75)" },
];

const sections = [
  {
    title: "About Me",
    body: `I'm a multidisciplinary technologist with a passion for building experiences that live at the intersection of creativity, code, and security. With a background spanning full-stack development, audio plugin engineering, music production, and cybersecurity, I bring a holistic perspective to solving modern digital challenges — whether I'm architecting a web application, developing a VST/AU plugin, producing immersive audio environments, or hardening systems against evolving threats.`,
  },
  {
    title: "Full-Stack Developer",
    subtitle: "Building Across the Stack",
    body: `As a full-stack developer, I specialize in designing and developing modern web applications that are scalable, secure, and user-focused. I've worked extensively with React, MySQL, Express, and a variety of frontend and backend frameworks to build efficient, clean solutions that work well across devices and use cases. My approach prioritizes seamless integration between the UI and backend systems, with attention to code quality, maintainability, and performance optimization.

Whether developing interactive dashboards, building REST APIs, or deploying cloud-native infrastructure, I take pride in creating systems that are not only technically sound but also intuitive to use.`,
  },
  {
    title: "Audio Plugin Development",
    subtitle: "Innovation Through Sound",
    body: `I am currently in the works of creating my first professional plugin Aurora — an audio effect plugin designed for deep, expressive sound manipulation through granular synthesis. Built using the JUCE framework, Aurora empowers music producers, artists, and sound designers to modulate pitch, texture, and timing with fluid real-time control.

Inspired by industry-defining tools like Portal, I've engineered Aurora to deliver a responsive, high-quality sound-shaping experience that blends DSP performance with polished UX. From optimizing FFT performance using FFTW to implementing intelligent thread management and real-time UI rendering, I take plugin development seriously.`,
  },
  {
    title: "Music Producer",
    subtitle: "Emotion in Every Frequency",
    body: `Outside of code, I'm also an active music producer with a catalog of beats inspired by artists across Jazz, RnB, Afrobeats, and Latin Pop. I specialize in producing emotionally driven instrumentals with rich harmonics, wide stereo imaging, and clean mixes that hold their own in professional playback environments.

I publish beats consistently to YouTube, building a brand that merges musical emotion with technical quality. My production pipeline is informed by my plugin development skills — giving me an edge in sculpting truly unique sounds.`,
  },
  {
    title: "Cybersecurity",
    subtitle: "Securing What I Build",
    body: `As someone who builds systems, I'm equally invested in securing them. I'm currently advancing my cybersecurity expertise through a CompTIA Security+ program, where I'm sharpening my understanding of secure networking, operating system hardening, SIEMs, and modern threat landscapes.

I believe modern technologists need to be just as familiar with firewalls, subnets, encryption, and access control as they are with APIs and front-end frameworks. My cybersecurity journey is fueled by a desire to build resilient systems from the ground up.`,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const AboutMe = () => {
  const [expanded, setExpanded] = useState(null);

  const toggle = (i) => setExpanded(expanded === i ? null : i);

  return (
    <Box sx={{
      position: "relative",
      backgroundColor: "#0e0b0d",
      minHeight: "100vh",
      color: "#FFEAEC",
      overflowX: "hidden",
      pt: { xs: 10, md: 14 },
      pb: { xs: 10, md: 16 },
    }}>
      <LiquidBackground />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>

        {/* ── Hero / Avatar block ── */}
        <Box sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}>

          {/* Pill badge */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <GlassPanel sx={{
              px: 2.5, py: 1,
              borderRadius: "100px",
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
            }}>
              <LiquidOrb
                size={18}
                color="rgba(228,63,111,0.85)"
                sx={{
                  animation: "orbBob 6s ease-in-out infinite",
                  "@keyframes orbBob": {
                    "0%,100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-3px)" },
                  },
                }}
              />
              <Typography sx={{
                fontFamily: `"DM Sans", sans-serif`,
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(255,234,236,0.65)",
              }}>
                The Creator
              </Typography>
            </GlassPanel>
          </Box>

          {/* Avatar with glass ring */}
          <Box sx={{ position: "relative", display: "inline-block", mb: 4 }}>
            {/* Decorative orbs flanking avatar */}
            <LiquidOrb
              size={32}
              color="rgba(228,63,111,0.6)"
              sx={{
                position: "absolute",
                left: -48,
                top: "30%",
                display: { xs: "none", sm: "block" },
                animation: "orbBobL 7s ease-in-out infinite",
                "@keyframes orbBobL": {
                  "0%,100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-8px)" },
                },
              }}
            />
            <LiquidOrb
              size={22}
              color="rgba(150,20,55,0.7)"
              sx={{
                position: "absolute",
                right: -36,
                top: "10%",
                display: { xs: "none", sm: "block" },
                animation: "orbBobR 9s ease-in-out infinite reverse",
                "@keyframes orbBobR": {
                  "0%,100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-6px)" },
                },
              }}
            />

            {/* Outer glow ring */}
            <Box sx={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(228,63,111,0.2) 0%, transparent 70%)",
              filter: "blur(16px)",
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              animation: "avatarPulse 4s ease-in-out infinite",
              "@keyframes avatarPulse": {
                "0%,100%": { opacity: 0.6, transform: "translate(-50%, -50%) scale(1)" },
                "50%": { opacity: 1, transform: "translate(-50%, -50%) scale(1.15)" },
              },
            }} />

            <Avatar
              alt="Portrait"
              src="/Images/selfie.jpg"
              sx={{
                width: 120,
                height: 120,
                border: "2px solid rgba(228,63,111,0.5)",
                boxShadow: [
                  "0 0 0 4px rgba(228,63,111,0.1)",
                  "0 0 0 8px rgba(228,63,111,0.05)",
                  "0 12px 40px rgba(0,0,0,0.7)",
                ].join(", "),
                position: "relative",
                zIndex: 1,
              }}
            />
          </Box>

          {/* Name / title */}
          <Typography variant="h1" sx={{
            fontSize: { xs: "2.8rem", sm: "4rem", md: "5rem" },
            background: "linear-gradient(180deg, #FFEAEC 0%, rgba(255,234,236,0.55) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.05,
            mb: 1.5,
          }}>
            Meet the Creator
          </Typography>
          <Typography sx={{
            fontFamily: `"DM Sans", sans-serif`,
            fontSize: { xs: "1rem", md: "1.1rem" },
            color: "rgba(255,234,236,0.4)",
            lineHeight: 1.7,
            maxWidth: 440,
            mx: "auto",
          }}>
            Developer · Producer · Plugin Engineer · Cybersecurity Specialist
          </Typography>
        </Box>

        {/* ── Section Cards ── */}
        <Grid container spacing={3}>
          {sections.map((section, i) => {
            const { icon: Icon, accent } = sectionMeta[i];
            const isOpen = expanded === i;
            const isFirst = i === 0;

            return (
              <Grid item xs={12} key={i}>
                <NeumorphCard
                  onClick={!isFirst ? () => toggle(i) : undefined}
                  sx={isFirst ? {
                    background: "linear-gradient(145deg, #221520, #180f14)",
                    border: "1px solid rgba(228,63,111,0.18)",
                    boxShadow: [
                      "6px 6px 20px rgba(0,0,0,0.7)",
                      "-3px -3px 10px rgba(255,255,255,0.025)",
                      "0 1px 0 rgba(255,255,255,0.07) inset",
                      "0 0 40px rgba(228,63,111,0.06)",
                    ].join(", "),
                  } : {}}
                >
                  <Box sx={{ p: { xs: 3, md: 4 } }}>

                    {/* Card header */}
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      mb: isFirst || isOpen ? 3 : 0,
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {/* Icon bubble */}
                        <Box sx={{
                          width: 48, height: 48,
                          borderRadius: "14px",
                          background: "rgba(228,63,111,0.1)",
                          border: "1px solid rgba(228,63,111,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: [
                            "4px 4px 12px rgba(0,0,0,0.5)",
                            "-2px -2px 6px rgba(255,255,255,0.02)",
                          ].join(", "),
                        }}>
                          <Icon sx={{ fontSize: 22, color: "#E43F6F" }} />
                        </Box>

                        <Box>
                          <Typography sx={{
                            fontFamily: `"Syne", sans-serif`,
                            fontWeight: 800,
                            fontSize: { xs: "1.1rem", md: "1.25rem" },
                            color: "#FFEAEC",
                            lineHeight: 1.2,
                          }}>
                            {section.title}
                          </Typography>
                          {section.subtitle && (
                            <Typography sx={{
                              fontFamily: `"DM Sans", sans-serif`,
                              fontSize: "0.78rem",
                              color: "#E43F6F",
                              fontWeight: 600,
                              letterSpacing: "0.5px",
                              mt: 0.2,
                            }}>
                              {section.subtitle}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Expand arrow for non-first cards */}
                      {!isFirst && (
                        <Box sx={{
                          width: 32, height: 32,
                          borderRadius: "10px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.3s ease",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          color: isOpen ? "#E43F6F" : "rgba(255,234,236,0.3)",
                        }}>
                          <ArrowForwardIcon sx={{ fontSize: 16 }} />
                        </Box>
                      )}
                    </Box>

                    {/* Body — always visible for first card, toggle for rest */}
                    {(isFirst || isOpen) && (
                      <>
                        <Box sx={{ height: "1px", background: "rgba(255,255,255,0.06)", mb: 3 }} />
                        {section.body.trim().split("\n\n").map((para, pi) => (
                          <Typography key={pi} sx={{
                            fontFamily: `"DM Sans", sans-serif`,
                            fontSize: "0.95rem",
                            color: "rgba(255,234,236,0.55)",
                            lineHeight: 1.85,
                            mb: pi < section.body.trim().split("\n\n").length - 1 ? 2 : 0,
                          }}>
                            {para.trim()}
                          </Typography>
                        ))}
                      </>
                    )}
                  </Box>
                </NeumorphCard>
              </Grid>
            );
          })}
        </Grid>

        {/* ── Skills chips strip ── */}
        <GlassPanel sx={{ mt: 5, p: { xs: 3, md: 4 } }}>
          <Typography sx={{
            fontFamily: `"DM Sans", sans-serif`,
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#E43F6F",
            mb: 2.5,
          }}>
            Tech Stack
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {["React", "Node.js", "Express", "MySQL", "JUCE / C++", "Python", "REST APIs", "CompTIA Sec+", "Git", "DSP / FFT", "VST / AU"].map((skill) => (
              <Box key={skill} sx={{
                px: 2,
                py: 0.7,
                borderRadius: "100px",
                background: "rgba(228,63,111,0.08)",
                border: "1px solid rgba(228,63,111,0.18)",
                boxShadow: [
                  "3px 3px 8px rgba(0,0,0,0.4)",
                  "-1px -1px 4px rgba(255,255,255,0.02)",
                ].join(", "),
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(228,63,111,0.14)",
                  borderColor: "rgba(228,63,111,0.3)",
                  transform: "translateY(-2px)",
                },
              }}>
                <Typography sx={{
                  fontFamily: `"DM Sans", sans-serif`,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "rgba(255,234,236,0.65)",
                  letterSpacing: "0.3px",
                }}>
                  {skill}
                </Typography>
              </Box>
            ))}
          </Box>
        </GlassPanel>

        {/* ── Final CTA ── */}
        <GlassPanel sx={{ mt: 4, p: { xs: 4, md: 5 }, textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
            <LiquidOrb size={16} color="rgba(228,63,111,0.5)" />
            <LiquidOrb size={26} color="rgba(228,63,111,0.8)" />
            <LiquidOrb size={16} color="rgba(228,63,111,0.5)" />
          </Box>

          <Typography sx={{
            fontFamily: `"Syne", sans-serif`,
            fontWeight: 800,
            fontSize: { xs: "1.3rem", md: "1.7rem" },
            color: "#FFEAEC",
            mb: 1,
          }}>
            Want to dive deeper?
          </Typography>
          <Typography sx={{
            fontFamily: `"DM Sans", sans-serif`,
            color: "rgba(255,234,236,0.4)",
            fontSize: "0.95rem",
            mb: 3.5,
            lineHeight: 1.7,
          }}>
            Explore my beats or check out my GitHub to see what I'm building.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              to="/products"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 4, py: 1.5, fontSize: "0.95rem" }}
            >
              Explore Beats
            </Button>
            <Button
              component="a"
              href="https://github.com/adamel99"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: "0.95rem" }}
            >
              GitHub
            </Button>
          </Box>
        </GlassPanel>

      </Container>
    </Box>
  );
};

export default AboutMe;
