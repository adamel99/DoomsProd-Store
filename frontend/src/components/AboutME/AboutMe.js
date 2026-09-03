import React from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CodeIcon from "@mui/icons-material/Code";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedIcon from "@mui/icons-material/Verified";

const disciplines = [
  {
    title: "Full-Stack Development",
    icon: CodeIcon,
    body: "I build modern web applications with React, Node.js, Express, REST APIs, database-backed workflows, authentication, payments, and production-minded security controls.",
  },
  {
    title: "Audio Plugin Engineering",
    icon: GraphicEqIcon,
    body: "I work on audio tools with JUCE and C++, combining DSP, real-time controls, and practical producer-facing UX for expressive sound design.",
  },
  {
    title: "Music Production",
    icon: MusicNoteIcon,
    body: "I produce emotionally driven beats across Jazz, RnB, Afrobeats, and Latin Pop, with a focus on musicality, clean mixes, texture, and release-ready arrangement.",
  },
  {
    title: "Cybersecurity",
    icon: SecurityIcon,
    body: "I approach software with a security-first mindset: authentication, access control, private file delivery, rate limiting, payment integrity, and secure system design.",
  },
];

const credentials = [
  "Built this full-stack beat store from product catalog to secure checkout and digital delivery.",
  "Integrated Stripe payments, webhook fulfillment, account downloads, and private S3 file access.",
  "Developing Aurora, a professional audio effect plugin focused on expressive granular sound manipulation.",
  "Advancing cybersecurity knowledge through Security+ study and practical secure-build habits.",
];

const tools = [
  "React",
  "Node.js",
  "Express",
  "Sequelize",
  "PostgreSQL",
  "Stripe",
  "AWS S3",
  "JUCE",
  "C++",
  "DSP",
  "Python",
  "Security+",
];

function AboutMe() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        color: "text.primary",
        pt: { xs: 7, md: 10 },
        pb: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 4, md: 7 }}
          alignItems="center"
          sx={(theme) => ({
            pb: { xs: 4, md: 6 },
            mb: { xs: 4, md: 6 },
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Grid item xs={12} md={7}>
            <Typography
              sx={{
                fontFamily: (theme) => theme.custom.fonts.mono,
                color: "text.disabled",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                mb: 1.5,
              }}
            >
              About
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: (theme) => theme.custom.fonts.display,
                fontWeight: 850,
                fontSize: { xs: "2.45rem", sm: "3.3rem", md: "4.25rem" },
                lineHeight: 1.02,
                maxWidth: 760,
                mb: 2.5,
              }}
            >
              Adam Elhamami, creator behind doomsprod.
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: 1.85,
                maxWidth: 720,
                mb: 3,
              }}
            >
              I am a multidisciplinary developer, music producer, audio plugin engineer, and security-minded technologist. My work sits where creative tools, production-quality software, and music culture meet.
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: 1.85,
                maxWidth: 720,
              }}
            >
              doomsprod is both my producer storefront and a demonstration of how I build: practical interfaces, secure commerce flows, protected digital delivery, and tools made for artists, producers, and engineers who want to move quickly without losing quality.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 4 }}>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 3 }}
              >
                Browse Catalog
              </Button>
              <Button
                component="a"
                href="https://github.com/adamel99"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                sx={{ px: 3 }}
              >
                GitHub
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={(theme) => ({
                backgroundColor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                p: { xs: 2.5, sm: 3 },
                boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
              })}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 3 }}>
                <Avatar
                  alt="Adam Elhassan"
                  src="/Images/selfie.jpg"
                  sx={{
                    width: 96,
                    height: 96,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: (theme) => theme.custom.fonts.display,
                      fontWeight: 800,
                      fontSize: "1.3rem",
                      lineHeight: 1.2,
                    }}
                  >
                    Adam Elhassan
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.94rem", mt: 0.5 }}>
                    Developer / Producer / Plugin Engineer
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              {[
                ["Brand", "doomsprod"],
                ["Focus", "Beats, plugins, secure ecommerce"],
                ["Audience", "Artists, producers, engineers"],
                ["Contact", "adamelh1999@gmail.com"],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "92px minmax(0, 1fr)",
                    gap: 2,
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: (theme) => theme.custom.fonts.mono,
                      color: "text.disabled",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.92rem" }}>
                    {label === "Contact" ? (
                      <MuiLink href="mailto:adamelh1999@gmail.com" sx={{ color: "primary.main", fontWeight: 700 }}>
                        {value}
                      </MuiLink>
                    ) : value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: { xs: 5, md: 7 } }}>
          {disciplines.map(({ title, icon: Icon, body }) => (
            <Grid item xs={12} sm={6} key={title}>
              <Box
                sx={(theme) => ({
                  height: "100%",
                  backgroundColor: "background.paper",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "8px",
                  p: { xs: 2.5, md: 3 },
                })}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,87,159,0.1)",
                      color: "primary.main",
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Typography
                    component="h2"
                    sx={{
                      fontFamily: (theme) => theme.custom.fonts.display,
                      fontWeight: 800,
                      fontSize: "1.16rem",
                    }}
                  >
                    {title}
                  </Typography>
                </Box>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.75, fontSize: "0.95rem" }}>
                  {body}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="start">
          <Grid item xs={12} md={7}>
            <Typography
              component="h2"
              sx={{
                fontFamily: (theme) => theme.custom.fonts.display,
                fontWeight: 850,
                fontSize: { xs: "1.8rem", md: "2.3rem" },
                lineHeight: 1.1,
                mb: 2,
              }}
            >
              What I bring to the work
            </Typography>
            <Box sx={{ display: "grid", gap: 1.75 }}>
              {credentials.map((item) => (
                <Box key={item} sx={{ display: "flex", gap: 1.4, alignItems: "flex-start" }}>
                  <VerifiedIcon sx={{ color: "primary.main", fontSize: 19, mt: 0.35, flexShrink: 0 }} />
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={(theme) => ({
                backgroundColor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                p: { xs: 2.5, md: 3 },
              })}
            >
              <Typography
                sx={{
                  fontFamily: (theme) => theme.custom.fonts.mono,
                  color: "text.disabled",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                Tools And Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {tools.map((tool) => (
                  <Box
                    key={tool}
                    sx={(theme) => ({
                      px: 1.35,
                      py: 0.7,
                      borderRadius: "8px",
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: "rgba(247,239,232,0.04)",
                    })}
                  >
                    <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", fontWeight: 700 }}>
                      {tool}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default AboutMe;
