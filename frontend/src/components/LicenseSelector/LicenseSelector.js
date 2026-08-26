import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, Container, Grid, Button,
} from "@mui/material";
import { getAllLicensesThunk } from "../../store/licenses";
import ContactModal from "../ContactInfo/ContactInfo";
import GavelIcon from "@mui/icons-material/Gavel";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

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
    {/* Primary crimson orb */}
    <Box sx={{
      position: "absolute",
      top: "-15vh",
      left: "-10vw",
      width: { xs: "60vw", md: "45vw" },
      height: { xs: "60vw", md: "45vw" },
      borderRadius: "50%",
      background: (theme) => `radial-gradient(circle at 40% 40%, ${theme.palette.primary.main}33 0%, ${theme.palette.primary.dark}22 50%, transparent 70%)`,
      filter: "blur(60px)",
      animation: "orbFloat1 22s ease-in-out infinite",
      "@keyframes orbFloat1": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "33%": { transform: "translate(4vw, 6vh) scale(1.08)" },
        "66%": { transform: "translate(-3vw, 3vh) scale(0.95)" },
      },
    }} />

    {/* Deep rose secondary */}
    <Box sx={{
      position: "absolute",
      bottom: "5vh",
      right: "-12vw",
      width: { xs: "55vw", md: "38vw" },
      height: { xs: "55vw", md: "38vw" },
      borderRadius: "50%",
      background: (theme) => `radial-gradient(circle at 60% 60%, ${theme.palette.secondary.main}44 0%, ${theme.palette.secondary.dark}22 50%, transparent 70%)`,
      filter: "blur(70px)",
      animation: "orbFloat2 28s ease-in-out infinite reverse",
      "@keyframes orbFloat2": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "50%": { transform: "translate(-5vw, -4vh) scale(1.1)" },
      },
    }} />

    {/* Accent depth orb */}
    <Box sx={{
      position: "absolute",
      top: "40vh",
      left: "30vw",
      width: { xs: "40vw", md: "28vw" },
      height: { xs: "40vw", md: "28vw" },
      borderRadius: "50%",
      background: (theme) => `radial-gradient(circle, ${theme.palette.primary.main}18 0%, transparent 70%)`,
      filter: "blur(80px)",
      animation: "orbFloat3 35s ease-in-out infinite",
      "@keyframes orbFloat3": {
        "0%,100%": { transform: "translate(0,0)" },
        "50%": { transform: "translate(6vw, -8vh)" },
      },
    }} />

    {/* Noise grain overlay */}
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
    sx={(theme) => ({
      background: theme.custom.clay.surfaceSoft,
      border: theme.custom.clay.border,
      borderRadius: "28px",
      boxShadow: theme.custom.clay.raised,
      ...sx,
    })}
    {...rest}
  >
    {children}
  </Box>
);

// ─── Neumorphic Card ──────────────────────────────────────────────────────────
const NeumorphCard = ({ children, sx = {}, highlighted = false, onClick }) => (
  <Box
    onClick={onClick}
    sx={(theme) => ({
      background: highlighted
        ? theme.custom.clay.surface
        : theme.custom.clay.surfaceSoft,
      borderRadius: "28px",
      border: highlighted
        ? `1px solid ${theme.palette.primary.main}66`
        : theme.custom.clay.border,
      boxShadow: highlighted
        ? theme.custom.clay.floating
        : theme.custom.clay.raised,
      transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      cursor: onClick ? "pointer" : "default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        transform: "translateY(-6px)",
        borderColor: theme.palette.primary.main,
        boxShadow: theme.custom.clay.floating,
      },
      ...sx,
    })}
  >
    {children}
  </Box>
);

// ─── Liquid Orb ───────────────────────────────────────────────────────────────
const LiquidOrb = ({ size = 80, color, sx = {} }) => (
  <Box
    sx={(theme) => ({
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, ${color || theme.palette.primary.main} 48%, ${theme.custom.colors.clayDeep} 100%)`,
      boxShadow: [
        `0 ${size * 0.1}px ${size * 0.3}px rgba(151,82,69,0.24)`,
        `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.45)`,
        `inset ${size * 0.03}px ${size * 0.03}px ${size * 0.08}px rgba(255,255,255,0.45)`,
      ].join(", "),
      flexShrink: 0,
      ...sx,
    })}
  />
);

// ─── Feature Row ──────────────────────────────────────────────────────────────
const FeatureRow = ({ label, value, allowed }) => (
  <Box sx={{
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    py: 1.1,
    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
    "&:last-child": { borderBottom: "none" },
  }}>
    <Box sx={{
      width: 20, height: 20,
      borderRadius: "6px",
      flexShrink: 0,
      mt: 0.1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: allowed ? (theme) => `${theme.palette.primary.main}22` : (theme) => theme.custom.clay.surfaceSoft,
      border: allowed
        ? (theme) => `1px solid ${theme.palette.primary.main}44`
        : (theme) => theme.custom.clay.hairline,
    }}>
      {allowed
        ? <CheckIcon sx={{ fontSize: 12, color: "primary.main" }} />
        : <CloseIcon sx={{ fontSize: 12, color: "text.disabled" }} />}
    </Box>
    <Box>
      <Typography sx={{
        fontFamily: (theme) => theme.custom.fonts.body,
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: "text.disabled",
        lineHeight: 1.2,
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontFamily: (theme) => theme.custom.fonts.body,
        fontSize: "0.88rem",
        color: allowed ? "text.primary" : "text.disabled",
        lineHeight: 1.4,
        mt: 0.2,
      }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// ─── License tier config ──────────────────────────────────────────────────────
const getLicenseDetails = (license) => {
  switch (license.name.toLowerCase()) {
    case "basic":
      return {
        distributionLimit: "Up to 5,000 streams",
        radioPlays: "Not allowed",
        monetization: "Non-commercial only",
        ownership: "Non-exclusive",
        modifications: "Minor edits allowed",
        radioAllowed: false,
        monetizationAllowed: false,
        badge: null,
      };
    case "premium":
      return {
        distributionLimit: "Up to 100,000 streams",
        radioPlays: "Up to 2 stations",
        monetization: "Major platforms",
        ownership: "Non-exclusive",
        modifications: "Allowed with credit",
        radioAllowed: true,
        monetizationAllowed: true,
        badge: "Popular",
      };
    case "unlimited":
      return {
        distributionLimit: "Unlimited",
        radioPlays: "Unlimited",
        monetization: "Fully monetizable",
        ownership: "Non-exclusive",
        modifications: "Allowed",
        radioAllowed: true,
        monetizationAllowed: true,
        badge: null,
      };
    case "exclusive":
      return {
        distributionLimit: "Unlimited",
        radioPlays: "Unlimited",
        monetization: "Fully monetizable",
        ownership: "Exclusive — beat removed",
        modifications: "Full creative control",
        radioAllowed: true,
        monetizationAllowed: true,
        badge: "Best",
      };
    default:
      return {
        distributionLimit: "Custom",
        radioPlays: "Custom",
        monetization: "Custom",
        ownership: "Varies",
        modifications: "Varies",
        radioAllowed: true,
        monetizationAllowed: true,
        badge: null,
      };
  }
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const LicensesPage = () => {
  const dispatch = useDispatch();
  const licenses = useSelector((state) =>
    Object.values(state.licenses.licenses || {})
  );
  const [openContact, setOpenContact] = useState(false);

  useEffect(() => { dispatch(getAllLicensesThunk()); }, [dispatch]);

  return (
    <Box sx={{
      position: "relative",
      backgroundColor: "background.default",
      minHeight: "100vh",
      color: "text.primary",
      overflowX: "hidden",
      pt: { xs: 10, md: 14 },
      pb: { xs: 10, md: 16 },
    }}>

      {/* ── Animated Liquid Background (matches LandingPage) ── */}
      <LiquidBackground />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>

        {/* ── Header ── */}
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
                color="var(--clay-coral)"
                sx={{
                  animation: "orbBob 6s ease-in-out infinite",
                  "@keyframes orbBob": {
                    "0%,100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-3px)" },
                  },
                }}
              />
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.body,
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "text.secondary",
              }}>
                Flexible Licensing
              </Typography>
            </GlassPanel>
          </Box>

          {/* Decorative flanking orbs — mirrors LandingPage hero */}
          <Box sx={{ position: "relative", display: "inline-block", width: "100%" }}>
            <LiquidOrb
              size={64}
              color="var(--clay-coral)"
              sx={{
                position: "absolute",
                left: { xs: "2%", md: "8%" },
                top: "10%",
                display: { xs: "none", sm: "block" },
                animation: "orbBobL 7s ease-in-out infinite",
                "@keyframes orbBobL": {
                  "0%,100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-10px)" },
                },
              }}
            />
            <LiquidOrb
              size={40}
              color="var(--clay-apricot)"
              sx={{
                position: "absolute",
                right: { xs: "2%", md: "10%" },
                top: "0%",
                display: { xs: "none", sm: "block" },
                animation: "orbBobR 9s ease-in-out infinite reverse",
                "@keyframes orbBobR": {
                  "0%,100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-8px)" },
                },
              }}
            />
            <LiquidOrb
              size={28}
              color="var(--clay-coral)"
              sx={{
                position: "absolute",
                right: { xs: "5%", md: "7%" },
                bottom: "-10%",
                display: { xs: "none", md: "block" },
                animation: "orbBobS 5s ease-in-out infinite",
                "@keyframes orbBobS": {
                  "0%,100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-6px)" },
                },
              }}
            />

            <Typography variant="h1" sx={{
              fontSize: { xs: "2.8rem", sm: "4rem", md: "5.5rem" },
              color: "text.primary",
              background: (theme) => `linear-gradient(180deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.dark} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              mb: 2,
              lineHeight: 1.05,
            }}>
              Licenses &amp; Terms
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.body,
            fontSize: { xs: "1rem", md: "1.15rem" },
            color: "text.secondary",
            maxWidth: 480,
            mx: "auto",
            lineHeight: 1.7,
            mt: 2,
          }}>
            Every beat comes with a license. Pick the tier that fits your project.
          </Typography>
        </Box>

        {/* ── License Cards ── */}
        <Grid container spacing={3} alignItems="stretch">
          {licenses.map((license) => {
            const details = getLicenseDetails(license);
            const isExclusive = license.name.toLowerCase() === "exclusive";
            const isHighlighted = ["premium", "exclusive"].includes(license.name.toLowerCase());

            return (
              <Grid item xs={12} sm={6} md={3} key={license.id} sx={{ display: "flex" }}>
                <NeumorphCard highlighted={isHighlighted} sx={{ width: "100%" }}>
                  <Box sx={{ p: 3.5, flex: 1, display: "flex", flexDirection: "column" }}>

                    {/* Badge */}
                    <Box sx={{ minHeight: 28, mb: 2 }}>
                      {details.badge && (
                        <Box sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          px: 1.4,
                          py: 0.3,
                          background: (theme) => `${theme.palette.primary.main}22`,
                          border: (theme) => `1px solid ${theme.palette.primary.main}66`,
                          borderRadius: "100px",
                        }}>
                          <Typography sx={{
                            fontFamily: (theme) => theme.custom.fonts.body,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            color: "primary.main",
                          }}>
                            {details.badge}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Name + price */}
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.display,
                      fontWeight: 800,
                      fontSize: "1.5rem",
                      color: "text.primary",
                      mb: 0.5,
                    }}>
                      {license.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 3 }}>
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.display,
                        fontWeight: 800,
                        fontSize: "2rem",
                        color: "primary.main",
                        lineHeight: 1,
                      }}>
                        ${license.price}
                      </Typography>
                      {!isExclusive && (
                        <Typography sx={{
                          fontFamily: (theme) => theme.custom.fonts.body,
                          fontSize: "0.78rem",
                          color: "text.disabled",
                        }}>
                          / beat
                        </Typography>
                      )}
                    </Box>

                    {/* Divider */}
                    <Box sx={{ height: "1px", background: (theme) => theme.palette.divider, mb: 3 }} />

                    {/* Feature rows */}
                    <Box sx={{ flex: 1 }}>
                      <FeatureRow label="Distribution" value={details.distributionLimit} allowed={true} />
                      <FeatureRow label="Radio Plays" value={details.radioPlays} allowed={details.radioAllowed} />
                      <FeatureRow label="Monetization" value={details.monetization} allowed={details.monetizationAllowed} />
                      <FeatureRow label="Ownership" value={details.ownership} allowed={true} />
                      <FeatureRow label="Modifications" value={details.modifications} allowed={true} />
                    </Box>

                    {/* CTA */}
                    <Button
                      fullWidth
                      onClick={() => { if (isExclusive) setOpenContact(true); }}
                      sx={{
                        mt: 3,
                        py: 1.4,
                        fontFamily: (theme) => theme.custom.fonts.display,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        textTransform: "none",
                        borderRadius: "14px",
                        transition: "all 0.25s ease",
                        ...(isExclusive ? {
                          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          color: "primary.contrastText",
                          border: (theme) => `1px solid ${theme.palette.primary.main}66`,
                          boxShadow: (theme) => theme.custom.clay.raisedSmall,
                          "&:hover": {
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            transform: "translateY(-1px)",
                            boxShadow: (theme) => theme.custom.clay.floating,
                          },
                        } : {
                          background: (theme) => theme.custom.clay.surfaceSoft,
                          color: "text.secondary",
                          border: (theme) => theme.custom.clay.border,
                          boxShadow: (theme) => theme.custom.clay.raisedSmall,
                          cursor: "default",
                          "&:hover": {
                            background: (theme) => theme.custom.clay.surfaceSoft,
                            borderColor: "divider",
                          },
                        }),
                      }}
                      endIcon={isExclusive ? <ArrowForwardIcon sx={{ fontSize: 16 }} /> : null}
                    >
                      {isExclusive ? "Contact for Purchase" : "Included with Beat"}
                    </Button>
                  </Box>
                </NeumorphCard>
              </Grid>
            );
          })}
        </Grid>

        {/* ── Legal Notice — pure GlassPanel, no background override ── */}
        <GlassPanel sx={{ mt: { xs: 8, md: 12 }, p: { xs: 4, md: 6 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              background: (theme) => `${theme.palette.primary.main}18`,
              border: (theme) => `1px solid ${theme.palette.primary.main}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: (theme) => theme.custom.clay.raisedSmall,
              flexShrink: 0,
            }}>
              <GavelIcon sx={{ fontSize: 22, color: "primary.main" }} />
            </Box>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.display,
              fontWeight: 800,
              fontSize: "1.3rem",
              color: "text.primary",
            }}>
              Legal Notice &amp; Copyright
            </Typography>
          </Box>

          <Box sx={{ height: "1px", background: (theme) => theme.palette.divider, mb: 3 }} />

          {[
            "All instrumentals and audio content sold on this platform are protected under copyright law. Unauthorized use, reproduction, distribution, or commercial exploitation of any beat without a valid license agreement is strictly prohibited. Violation of these terms may result in copyright takedowns, legal action, and removal of your content from streaming platforms.",
            "Exclusive licenses remove the beat from the store and grant you full rights for commercial use. All licensing agreements are non-transferable. The producer retains copyright ownership unless explicitly transferred in a signed agreement.",
            "Sync licensing (use in film, TV, games, or advertising) requires separate written approval. Licensing is granted for use as-is; resale of the beat or creating derivative products (e.g. sample kits) is not permitted unless explicitly allowed in writing.",
          ].map((para, i) => (
            <Typography key={i} sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              fontSize: "0.9rem",
              color: "text.secondary",
              lineHeight: 1.8,
              mb: i < 2 ? 2 : 0,
            }}>
              {para}
            </Typography>
          ))}
        </GlassPanel>

        {/* ── Final CTA strip ── */}
        <GlassPanel sx={{ mt: { xs: 5, md: 6 }, p: { xs: 4, md: 5 }, textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
            <LiquidOrb size={16} color="var(--clay-coral)" />
            <LiquidOrb size={26} color="var(--clay-coral)" />
            <LiquidOrb size={16} color="var(--clay-coral)" />
          </Box>
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.display,
            fontWeight: 800,
            fontSize: { xs: "1.3rem", md: "1.7rem" },
            color: "text.primary",
            mb: 1,
          }}>
            Not sure which license fits?
          </Typography>
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.body,
            color: "text.secondary",
            fontSize: "0.95rem",
            mb: 3,
            lineHeight: 1.7,
          }}>
            Reach out and we'll find the right fit for your project.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setOpenContact(true)}
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 5, py: 1.5, fontSize: "0.95rem" }}
          >
            Get in Touch
          </Button>
        </GlassPanel>

      </Container>

      <ContactModal open={openContact} onClose={() => setOpenContact(false)} />
    </Box>
  );
};

export default LicensesPage;
