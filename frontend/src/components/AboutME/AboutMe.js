import React from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CodeIcon from "@mui/icons-material/Code";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import VerifiedIcon from "@mui/icons-material/Verified";

const disciplines = [
  {
    number: "01",
    title: "Music, made to move",
    icon: MusicNoteIcon,
    body: "Production is where it starts. I make instrumentals across hip-hop, trap, R&B, jazz, Afrobeats, and Latin pop, with a focus on feel, texture, and a mix that leaves room for the artist.",
  },
  {
    number: "02",
    title: "Tools for creative work",
    icon: GraphicEqIcon,
    body: "I build audio tools with the same attention I bring to a session. Aurora, my granular effect plugin in development, explores expressive sound manipulation through controls designed for producers.",
  },
  {
    number: "03",
    title: "The craft behind the product",
    icon: CodeIcon,
    body: "doomsprod is a working music storefront as well as a product I built. Its catalog, checkout, account experience, and protected digital delivery bring my interests in music and full stack development together.",
  },
];

const credentials = [
  { title: "CompTIA Security+", detail: "Certified · January 2026" },
  { title: "NJIT Cybersecurity Certificate", detail: "Certificate program · 2025" },
  { title: "SOC Log Analyzer", detail: "Detection engineering project · 2026" },
];

const Eyebrow = ({ children, sx = {} }) => (
  <Typography
    sx={(theme) => ({
      fontFamily: theme.custom.fonts.mono,
      color: "primary.main",
      fontSize: "0.68rem",
      fontWeight: 700,
      letterSpacing: "2px",
      lineHeight: 1.5,
      textTransform: "uppercase",
      ...sx,
    })}
  >
    {children}
  </Typography>
);

function AboutMe() {
  return (
    <Box
      component="main"
      sx={(theme) => ({
        minHeight: "100vh",
        color: "text.primary",
        background: theme.custom.gradients.page,
        pt: { xs: 10, md: 14 },
        pb: { xs: 9, md: 14 },
        overflow: "hidden",
      })}
    >
      <Container maxWidth="lg">
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1.3fr) minmax(180px, 0.7fr)" },
          gap: { xs: 5, sm: 4, md: 8 },
          alignItems: "center",
        }}>
          <Box>
            <Eyebrow sx={{ mb: 2 }}>The creator behind doomsprod</Eyebrow>
            <Typography
              component="h1"
              sx={{
                fontFamily: (theme) => theme.custom.fonts.display,
                fontSize: { xs: "3.1rem", sm: "3.6rem", md: "5.4rem", lg: "6rem" },
                fontWeight: 700,
                lineHeight: 0.94,
                letterSpacing: "-0.035em",
                maxWidth: 780,
                mb: 3,
              }}
            >
              Music with feeling. Built with care.
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "1.04rem", md: "1.15rem" },
                lineHeight: 1.85,
                maxWidth: 660,
                mb: 2,
              }}
            >
              I’m Adam Elhamami, a music producer and software developer creating under the name doomsprod. My work moves between the studio and the screen: making records, shaping audio tools, and building the digital products that help artists get their ideas out into the world.
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 630 }}>
              I bring a producer’s ear for sound together with an engineer’s care for how things work. That combination guides every beat, plugin, and part of the doomsprod experience.
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 4 }}>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={(theme) => ({
                  px: 2.8,
                  py: 1.25,
                  borderRadius: `${theme.custom.radius.pill}px`,
                  background: theme.custom.gradients.brand,
                  boxShadow: theme.custom.clay.raisedSmall,
                  "&:hover": { background: theme.custom.gradients.brandHover },
                })}
              >
                Explore the music
              </Button>
              <Button
                component="a"
                href="https://github.com/adamel99"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                sx={{ px: 2.8, py: 1.25, borderRadius: (theme) => `${theme.custom.radius.pill}px` }}
              >
                View my GitHub
              </Button>
            </Box>
          </Box>

          <Box>
            <Box
              sx={(theme) => ({
                position: "relative",
                width: "100%",
                maxWidth: { xs: 340, sm: 300, md: 360 },
                mx: "auto",
                p: { xs: 1.2, md: 1.5 },
                borderRadius: { xs: "28px", md: "36px" },
                background: theme.custom.clay.surfaceSoft,
                border: theme.custom.clay.border,
                boxShadow: theme.custom.clay.raised,
                transform: { xs: "none", md: "rotate(1.2deg)" },
              })}
            >
              <Box
                component="img"
                src="/Images/selfie.jpg"
                alt="Adam Elhamami in front of the city skyline at night"
                sx={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "0.92 / 1",
                  objectFit: "cover",
                  objectPosition: "center 42%",
                  borderRadius: { xs: "21px", md: "28px" },
                  filter: "saturate(0.86)",
                }}
              />
              <Box
                sx={(theme) => ({
                  position: "absolute",
                  right: { xs: 14, md: 20 },
                  bottom: { xs: 14, md: 20 },
                  left: { xs: 14, md: 20 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  p: { xs: 1.5, md: 2 },
                  borderRadius: `${theme.custom.radius.lg}px`,
                  background: theme.custom.transparent(theme.custom.colors.clayDeep, 0.82),
                  border: `1px solid ${theme.custom.transparent(theme.custom.colors.ink, 0.12)}`,
                  backdropFilter: "blur(14px)",
                })}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.04rem" }}>Adam Elhamami</Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", mt: 0.25 }}>
                    Producer · Developer · Creator
                  </Typography>
                </Box>
                <Box
                  aria-hidden="true"
                  sx={(theme) => ({
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    color: "primary.main",
                    background: theme.custom.transparent(theme.custom.colors.pink, 0.13),
                  })}
                >
                  <MusicNoteIcon fontSize="small" />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          component="section"
          aria-labelledby="approach-heading"
          sx={{ pt: { xs: 9, md: 14 }, mt: { xs: 8, md: 12 }, borderTop: (theme) => theme.custom.clay.hairline }}
        >
          <Grid container spacing={{ xs: 2, md: 6 }} sx={{ mb: { xs: 4, md: 6 } }} alignItems="end">
            <Grid item xs={12} md={5}>
              <Eyebrow sx={{ mb: 1.5 }}>A creative practice</Eyebrow>
              <Typography
                id="approach-heading"
                component="h2"
                sx={{
                  fontFamily: (theme) => theme.custom.fonts.display,
                  fontWeight: 700,
                  fontSize: { xs: "2.4rem", md: "3.35rem" },
                  lineHeight: 1,
                }}
              >
                Three sides of the same work.
              </Typography>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 620, ml: { md: "auto" } }}>
                Music, software, and the experience around them belong together. I bring those disciplines into one practice, with the listener and creator in mind at every step.
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            {disciplines.map(({ number, title, icon: Icon, body }) => (
              <Grid item xs={12} md={4} key={title}>
                <Box
                  sx={(theme) => ({
                    height: "100%",
                    p: { xs: 2.6, md: 3.2 },
                    borderRadius: `${theme.custom.radius.xl}px`,
                    border: theme.custom.clay.border,
                    background: theme.custom.clay.surfaceSoft,
                    boxShadow: theme.custom.clay.raisedSmall,
                    transition: theme.custom.motion.transition.interactive,
                    "&:hover": { transform: "translateY(-4px)", boxShadow: theme.custom.clay.floating },
                  })}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                    <Box
                      sx={(theme) => ({
                        width: 46,
                        height: 46,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: `${theme.custom.radius.md}px`,
                        color: "primary.main",
                        background: theme.custom.transparent(theme.custom.colors.pink, 0.12),
                      })}
                    >
                      <Icon />
                    </Box>
                    <Typography sx={{ fontFamily: (theme) => theme.custom.fonts.mono, color: "text.disabled", fontSize: "0.72rem", letterSpacing: "1px" }}>
                      {number}
                    </Typography>
                  </Box>
                  <Typography
                    component="h3"
                    sx={{ fontFamily: (theme) => theme.custom.fonts.display, fontSize: "1.4rem", fontWeight: 700, mb: 1.3 }}
                  >
                    {title}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.94rem", lineHeight: 1.8 }}>
                    {body}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          component="section"
          aria-labelledby="outside-studio-heading"
          sx={{ pt: { xs: 8, md: 12 }, mt: { xs: 8, md: 12 }, borderTop: (theme) => theme.custom.clay.hairline }}
        >
          <Grid item xs={12} md={5}>
            <Eyebrow sx={{ mb: 1.5 }}>Outside the studio</Eyebrow>
            <Typography
              id="outside-studio-heading"
              component="h2"
              sx={{
                fontFamily: (theme) => theme.custom.fonts.display,
                fontWeight: 700,
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                lineHeight: 1,
                mb: 2,
              }}
            >
              Building with security in mind.
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.85, maxWidth: 460 }}>
              My cybersecurity training informs how I think about the products I make: protecting accounts, payments, and digital files is part of creating a dependable experience.
            </Typography>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: "grid", gap: 1.3 }}>
              {credentials.map(({ title, detail }) => (
                <Box
                  key={title}
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    p: { xs: 2, sm: 2.3 },
                    borderRadius: `${theme.custom.radius.lg}px`,
                    border: theme.custom.clay.hairline,
                    background: theme.custom.transparent(theme.custom.colors.ink, 0.025),
                  })}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
                    <VerifiedIcon sx={{ color: "primary.main", fontSize: 19, flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                  </Box>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.86rem", pl: { xs: 3.8, sm: 0 } }}>
                    {detail}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box
          component="section"
          sx={(theme) => ({
            mt: { xs: 8, md: 12 },
            p: { xs: 3, sm: 4, md: 6 },
            textAlign: "center",
            borderRadius: { xs: "28px", md: "36px" },
            border: theme.custom.clay.border,
            background: theme.custom.clay.surfacePink,
            boxShadow: theme.custom.clay.raised,
          })}
        >
          <Eyebrow sx={{ mb: 1.5 }}>Let’s make something</Eyebrow>
          <Typography
            component="h2"
            sx={{
              fontFamily: (theme) => theme.custom.fonts.display,
              fontSize: { xs: "2.25rem", md: "3.3rem" },
              fontWeight: 700,
              lineHeight: 1,
              mb: 1.5,
            }}
          >
            Have a record in mind?
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 500, mx: "auto", lineHeight: 1.75, mb: 3 }}>
            Explore the catalog, or get in touch about a production or creative project.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              component={Link}
              to="/products"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 2.8, py: 1.2, borderRadius: (theme) => `${theme.custom.radius.pill}px` }}
            >
              Browse the catalog
            </Button>
            <Button
              component="a"
              href="mailto:adamelh1999@gmail.com"
              variant="outlined"
              sx={{ px: 2.8, py: 1.2, borderRadius: (theme) => `${theme.custom.radius.pill}px` }}
            >
              Get in touch
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutMe;
