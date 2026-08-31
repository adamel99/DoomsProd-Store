import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, Container, Button,
} from "@mui/material";
import { getAllLicensesThunk } from "../../store/licenses";
import ContactModal from "../ContactInfo/ContactInfo";
import GavelIcon from "@mui/icons-material/Gavel";
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
      background: (theme) => theme.custom.effects.orb.rose,
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
      background: (theme) => theme.custom.effects.orb.brown,
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
      ...theme.custom.patterns.surface.raised,
      borderRadius: "var(--radius-panel)",
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
      background: theme.custom.clay.surfaceSoft,
      borderRadius: "18px",
      border: highlighted
        ? `1px solid ${theme.custom.transparent(theme.palette.primary.main, 0.28)}`
        : theme.custom.clay.hairline,
      boxShadow: highlighted
        ? "10px 12px 26px rgba(0,0,0,0.34), -8px -8px 18px rgba(255,255,255,0.032)"
        : "7px 8px 18px rgba(0,0,0,0.28), -6px -6px 14px rgba(255,255,255,0.026)",
      transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
      cursor: onClick ? "pointer" : "default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        transform: "translateY(-2px)",
        borderColor: theme.custom.transparent(theme.palette.primary.main, 0.34),
        boxShadow: "12px 14px 30px rgba(0,0,0,0.36), -8px -8px 18px rgba(255,255,255,0.032)",
      },
      ...sx,
    })}
  >
    {children}
  </Box>
);

// ─── Feature Row ──────────────────────────────────────────────────────────────
const FeatureRow = ({ label, value, allowed }) => (
  <Box sx={{
    display: "grid",
    gridTemplateColumns: "72px minmax(0, 1fr)",
    alignItems: "baseline",
    gap: 1.2,
    py: 1,
    borderBottom: (theme) => theme.custom.clay.hairline,
    "&:last-child": { borderBottom: "none" },
  }}>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.mono,
      fontSize: "0.64rem",
      fontWeight: 800,
      letterSpacing: "0.9px",
      textTransform: "uppercase",
      color: "text.disabled",
      lineHeight: 1.2,
    }}>
      {label}
    </Typography>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.body,
      fontSize: "0.86rem",
      color: allowed ? "text.primary" : "text.disabled",
      lineHeight: 1.45,
      textAlign: "right",
    }}>
      {value}
    </Typography>
  </Box>
);

const InfoPill = ({ label, value }) => (
  <GlassPanel sx={{ p: { xs: 2, md: 2.4 }, borderRadius: "var(--radius-lg)" }}>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.mono,
      fontSize: "0.64rem",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "text.disabled",
      mb: 0.75,
    }}>
      {label}
    </Typography>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.display,
      fontWeight: 850,
      fontSize: { xs: "1.15rem", md: "1.35rem" },
      lineHeight: 1.1,
      color: "text.primary",
    }}>
      {value}
    </Typography>
  </GlassPanel>
);

// ─── License tier config ──────────────────────────────────────────────────────
const getLicenseDetails = (license) => {
  switch (license.name.toLowerCase()) {
    case "basic":
      return {
        tagline: "For drafts, demos, and early ideas.",
        delivery: "MP3 included",
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
        tagline: "For official releases and paid platforms.",
        delivery: "MP3 + WAV included",
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
        tagline: "For serious releases with room to grow.",
        delivery: "MP3 + WAV + ZIP included",
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
        tagline: "For artists who need the beat taken down.",
        delivery: "Full delivery",
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
        tagline: "Custom license terms.",
        delivery: "Varies",
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

const licenseOrder = {
  basic: 1,
  premium: 2,
  unlimited: 3,
  exclusive: 4,
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const LicensesPage = () => {
  const dispatch = useDispatch();
  const licenses = useSelector((state) =>
    Object.values(state.licenses.licenses || {}).sort((a, b) => (
      (licenseOrder[a.name?.toLowerCase()] || 99) - (licenseOrder[b.name?.toLowerCase()] || 99)
    ))
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
      pt: { xs: 7, md: 9 },
      pb: { xs: 8, md: 11 },
    }}>

      {/* ── Animated Liquid Background (matches LandingPage) ── */}
      <LiquidBackground />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>

        {/* ── Header ── */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.1fr) minmax(320px, 0.9fr)" },
          gap: { xs: 3, md: 5 },
          alignItems: "end",
          mb: { xs: 5, md: 6 },
        }}>
          <Box>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              color: "primary.main",
              mb: 1.5,
            }}>
              Flexible Licensing
            </Typography>
            <Typography variant="h1" sx={{
              fontSize: { xs: "2.7rem", sm: "3.5rem", md: "4.8rem" },
              color: "text.primary",
              mb: 2,
              lineHeight: 0.96,
            }}>
              Pick the rights your release needs
            </Typography>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              fontSize: { xs: "0.98rem", md: "1.05rem" },
              color: "text.secondary",
              maxWidth: 600,
              lineHeight: 1.75,
            }}>
              Compare stream limits, monetization, ownership, and delivery options before choosing a beat license.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5 }}>
            <InfoPill label="Basic" value="MP3 starter use" />
            <InfoPill label="Premium" value="Commercial releases" />
            <InfoPill label="Unlimited" value="No stream cap" />
            <InfoPill label="Exclusive" value="Contact direct" />
          </Box>
        </Box>

        {/* ── License Cards ── */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          alignItems: "stretch",
        }}>
          {licenses.map((license) => {
            const details = getLicenseDetails(license);
            const isExclusive = license.name.toLowerCase() === "exclusive";
            const isHighlighted = ["premium", "exclusive"].includes(license.name.toLowerCase());

            return (
              <NeumorphCard key={license.id} highlighted={isHighlighted} sx={{ minHeight: 520, position: "relative" }}>
                  {details.badge && (
                    <Box sx={(theme) => ({
                      position: "absolute",
                      top: 18,
                      right: 18,
                      px: 1.2,
                      py: 0.4,
                      background: theme.custom.transparent(theme.palette.primary.main, 0.12),
                      border: "none",
                      borderRadius: "999px",
                    })}>
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.mono,
                        fontSize: "0.58rem",
                        fontWeight: 800,
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        color: "primary.main",
                      }}>
                        {details.badge}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{
                    p: { xs: 2.6, md: 2.8 },
                    flex: 1,
                    display: "grid",
                    gridTemplateRows: "98px 86px 1fr auto",
                    gap: 2.2,
                  }}>
                    <Box sx={{ pr: details.badge ? 8 : 0 }}>
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.display,
                        fontWeight: 900,
                        fontSize: "1.5rem",
                        color: "text.primary",
                        lineHeight: 1.05,
                        mb: 0.7,
                      }}>
                        {license.name}
                      </Typography>
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.body,
                        color: "text.secondary",
                        fontSize: "0.86rem",
                        lineHeight: 1.5,
                        minHeight: { sm: 42 },
                      }}>
                        {details.tagline}
                      </Typography>
                    </Box>

                    <Box>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 0.8 }}>
                        <Typography sx={{
                          fontFamily: (theme) => theme.custom.fonts.display,
                          fontWeight: 950,
                          fontSize: "2.15rem",
                          color: "primary.main",
                          lineHeight: 0.9,
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
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.mono,
                        fontSize: "0.63rem",
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        color: "text.disabled",
                      }}>
                        {details.delivery}
                      </Typography>
                    </Box>

                    <Box>
                      <FeatureRow label="Streams" value={details.distributionLimit} allowed />
                      <FeatureRow label="Radio" value={details.radioPlays} allowed={details.radioAllowed} />
                      <FeatureRow label="Money" value={details.monetization} allowed={details.monetizationAllowed} />
                      <FeatureRow label="Rights" value={details.ownership} allowed />
                      <FeatureRow label="Edits" value={details.modifications} allowed />
                    </Box>

                    <Button
                      fullWidth
                      onClick={() => { if (isExclusive) setOpenContact(true); }}
                      sx={{
                        mt: "auto",
                        py: 1.25,
                        fontFamily: (theme) => theme.custom.fonts.display,
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        textTransform: "none",
                        borderRadius: "var(--radius-md)",
                        transition: "var(--motion-interactive)",
                        ...(isExclusive ? {
                          background: "var(--gradient-brand-soft)",
                          color: "primary.contrastText",
                          border: "1px solid var(--clay-coral)",
                          boxShadow: "var(--clay-raised-small)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #F08ABD, var(--clay-coral))",
                            transform: "translateY(-1px)",
                            boxShadow: "var(--clay-floating)",
                          },
                        } : {
                          background: "transparent",
                          color: "text.secondary",
                          border: (theme) => theme.custom.clay.hairline,
                          boxShadow: "none",
                          cursor: "default",
                          "&:hover": {
                            background: "transparent",
                            borderColor: (theme) => theme.palette.divider,
                          },
                        }),
                      }}
                      endIcon={isExclusive ? <ArrowForwardIcon sx={{ fontSize: 16 }} /> : null}
                    >
                      {isExclusive ? "Contact for Purchase" : "Included with Beat"}
                    </Button>
                  </Box>
                </NeumorphCard>
            );
          })}
        </Box>

        {/* ── Legal Notice — pure GlassPanel, no background override ── */}
        <GlassPanel sx={{ mt: { xs: 6, md: 8 }, p: { xs: 3, md: 4.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "rgba(225,90,151,0.09)",
              border: "1px solid rgba(225,90,151,0.27)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--clay-raised-small)",
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

          <Box sx={{ height: "1px", background: (theme) => theme.palette.divider, mb: 2.5 }} />

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
        <GlassPanel sx={{ mt: { xs: 4, md: 5 }, p: { xs: 3, md: 4 }, textAlign: "center" }}>
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
