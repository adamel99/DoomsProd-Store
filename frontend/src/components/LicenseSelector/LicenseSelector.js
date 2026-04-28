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
      background: "radial-gradient(circle at 40% 40%, rgba(228,63,111,0.28) 0%, rgba(192,45,90,0.12) 50%, transparent 70%)",
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
      background: "radial-gradient(circle at 60% 60%, rgba(160,20,60,0.22) 0%, rgba(100,10,40,0.1) 50%, transparent 70%)",
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
      background: "radial-gradient(circle, rgba(228,63,111,0.07) 0%, transparent 70%)",
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
const NeumorphCard = ({ children, sx = {}, highlighted = false, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      background: highlighted
        ? "linear-gradient(145deg, #221520, #180f14)"
        : "linear-gradient(145deg, #1c1419, #130f12)",
      borderRadius: "28px",
      border: highlighted
        ? "1px solid rgba(228,63,111,0.3)"
        : "1px solid rgba(255,255,255,0.06)",
      boxShadow: highlighted
        ? [
            "6px 6px 20px rgba(0,0,0,0.7)",
            "-3px -3px 10px rgba(255,255,255,0.025)",
            "0 1px 0 rgba(255,255,255,0.07) inset",
            "0 0 40px rgba(228,63,111,0.08)",
          ].join(", ")
        : [
            "6px 6px 20px rgba(0,0,0,0.7)",
            "-3px -3px 10px rgba(255,255,255,0.025)",
            "0 1px 0 rgba(255,255,255,0.07) inset",
          ].join(", "),
      transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      cursor: onClick ? "pointer" : "default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        transform: "translateY(-6px)",
        borderColor: "rgba(228,63,111,0.25)",
        boxShadow: [
          "8px 12px 32px rgba(0,0,0,0.75)",
          "-2px -2px 8px rgba(255,255,255,0.025)",
          "0 1px 0 rgba(255,255,255,0.09) inset",
          "0 4px 32px rgba(228,63,111,0.15)",
        ].join(", "),
      },
      ...sx,
    }}
  >
    {children}
  </Box>
);

// ─── Liquid Orb ───────────────────────────────────────────────────────────────
const LiquidOrb = ({ size = 80, color = "rgba(228,63,111,0.7)", sx = {} }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, ${color} 45%, rgba(0,0,0,0.4) 100%)`,
      boxShadow: [
        `0 ${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.6)`,
        `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.15)`,
        `inset ${size * 0.03}px ${size * 0.03}px ${size * 0.08}px rgba(255,255,255,0.2)`,
      ].join(", "),
      flexShrink: 0,
      ...sx,
    }}
  />
);

// ─── Feature Row ──────────────────────────────────────────────────────────────
const FeatureRow = ({ label, value, allowed }) => (
  <Box sx={{
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    py: 1.1,
    borderBottom: "1px solid rgba(255,255,255,0.04)",
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
      background: allowed ? "rgba(228,63,111,0.12)" : "rgba(255,255,255,0.04)",
      border: allowed
        ? "1px solid rgba(228,63,111,0.25)"
        : "1px solid rgba(255,255,255,0.06)",
    }}>
      {allowed
        ? <CheckIcon sx={{ fontSize: 12, color: "#E43F6F" }} />
        : <CloseIcon sx={{ fontSize: 12, color: "rgba(255,234,236,0.2)" }} />}
    </Box>
    <Box>
      <Typography sx={{
        fontFamily: `"DM Sans", sans-serif`,
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: "rgba(255,234,236,0.3)",
        lineHeight: 1.2,
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontFamily: `"DM Sans", sans-serif`,
        fontSize: "0.88rem",
        color: allowed ? "rgba(255,234,236,0.7)" : "rgba(255,234,236,0.28)",
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
      backgroundColor: "#0e0b0d",
      minHeight: "100vh",
      color: "#FFEAEC",
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
                Flexible Licensing
              </Typography>
            </GlassPanel>
          </Box>

          {/* Decorative flanking orbs — mirrors LandingPage hero */}
          <Box sx={{ position: "relative", display: "inline-block", width: "100%" }}>
            <LiquidOrb
              size={64}
              color="rgba(228,63,111,0.6)"
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
              color="rgba(150,20,55,0.7)"
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
              color="rgba(228,63,111,0.5)"
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
              background: "linear-gradient(180deg, #FFEAEC 0%, rgba(255,234,236,0.55) 100%)",
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
            fontFamily: `"DM Sans", sans-serif`,
            fontSize: { xs: "1rem", md: "1.15rem" },
            color: "rgba(255,234,236,0.4)",
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
                          background: "rgba(228,63,111,0.15)",
                          border: "1px solid rgba(228,63,111,0.3)",
                          borderRadius: "100px",
                        }}>
                          <Typography sx={{
                            fontFamily: `"DM Sans", sans-serif`,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            color: "#E43F6F",
                          }}>
                            {details.badge}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Name + price */}
                    <Typography sx={{
                      fontFamily: `"Syne", sans-serif`,
                      fontWeight: 800,
                      fontSize: "1.5rem",
                      color: "#FFEAEC",
                      mb: 0.5,
                    }}>
                      {license.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 3 }}>
                      <Typography sx={{
                        fontFamily: `"Syne", sans-serif`,
                        fontWeight: 800,
                        fontSize: "2rem",
                        color: "#E43F6F",
                        lineHeight: 1,
                      }}>
                        ${license.price}
                      </Typography>
                      {!isExclusive && (
                        <Typography sx={{
                          fontFamily: `"DM Sans", sans-serif`,
                          fontSize: "0.78rem",
                          color: "rgba(255,234,236,0.3)",
                        }}>
                          / beat
                        </Typography>
                      )}
                    </Box>

                    {/* Divider */}
                    <Box sx={{ height: "1px", background: "rgba(255,255,255,0.06)", mb: 3 }} />

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
                        fontFamily: `"Syne", sans-serif`,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        textTransform: "none",
                        borderRadius: "14px",
                        transition: "all 0.25s ease",
                        ...(isExclusive ? {
                          background: "linear-gradient(135deg, #E43F6F, #c02d5a)",
                          color: "#fff",
                          border: "1px solid rgba(228,63,111,0.4)",
                          boxShadow: "0 6px 20px rgba(228,63,111,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #f0537f, #d03568)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 10px 28px rgba(228,63,111,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                          },
                        } : {
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(255,234,236,0.45)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: [
                            "4px 4px 12px rgba(0,0,0,0.4)",
                            "-1px -1px 4px rgba(255,255,255,0.02)",
                          ].join(", "),
                          cursor: "default",
                          "&:hover": {
                            background: "rgba(255,255,255,0.06)",
                            borderColor: "rgba(255,255,255,0.12)",
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
              background: "rgba(228,63,111,0.1)",
              border: "1px solid rgba(228,63,111,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: [
                "4px 4px 12px rgba(0,0,0,0.5)",
                "-2px -2px 6px rgba(255,255,255,0.02)",
              ].join(", "),
              flexShrink: 0,
            }}>
              <GavelIcon sx={{ fontSize: 22, color: "#E43F6F" }} />
            </Box>
            <Typography sx={{
              fontFamily: `"Syne", sans-serif`,
              fontWeight: 800,
              fontSize: "1.3rem",
              color: "#FFEAEC",
            }}>
              Legal Notice &amp; Copyright
            </Typography>
          </Box>

          <Box sx={{ height: "1px", background: "rgba(255,255,255,0.06)", mb: 3 }} />

          {[
            "All instrumentals and audio content sold on this platform are protected under copyright law. Unauthorized use, reproduction, distribution, or commercial exploitation of any beat without a valid license agreement is strictly prohibited. Violation of these terms may result in copyright takedowns, legal action, and removal of your content from streaming platforms.",
            "Exclusive licenses remove the beat from the store and grant you full rights for commercial use. All licensing agreements are non-transferable. The producer retains copyright ownership unless explicitly transferred in a signed agreement.",
            "Sync licensing (use in film, TV, games, or advertising) requires separate written approval. Licensing is granted for use as-is; resale of the beat or creating derivative products (e.g. sample kits) is not permitted unless explicitly allowed in writing.",
          ].map((para, i) => (
            <Typography key={i} sx={{
              fontFamily: `"DM Sans", sans-serif`,
              fontSize: "0.9rem",
              color: "rgba(255,234,236,0.45)",
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
            Not sure which license fits?
          </Typography>
          <Typography sx={{
            fontFamily: `"DM Sans", sans-serif`,
            color: "rgba(255,234,236,0.4)",
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
