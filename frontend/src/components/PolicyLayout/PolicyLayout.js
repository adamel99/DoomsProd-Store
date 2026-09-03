import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Divider, Link, Typography } from "@mui/material";

const slugify = (value) => (
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
);

function PolicyLayout({
  title,
  description,
  updatedAt,
  sections,
  links = [],
}) {
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
        <Box
          sx={(theme) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: { xs: 3, md: 4 },
            mb: { xs: 3, md: 5 },
          })}
        >
          <Typography
            sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              color: "text.disabled",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              mb: 1.5,
            }}
          >
            Legal
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: (theme) => theme.custom.fonts.display,
              fontWeight: 850,
              fontSize: { xs: "2.25rem", md: "3.35rem" },
              lineHeight: 1.05,
              maxWidth: 760,
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.98rem", md: "1.05rem" },
              lineHeight: 1.75,
              maxWidth: 760,
            }}
          >
            {description}
          </Typography>
          <Typography
            sx={{
              color: "text.disabled",
              fontFamily: (theme) => theme.custom.fonts.mono,
              fontSize: "0.74rem",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              mt: 2.5,
            }}
          >
            Last updated: {updatedAt}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "260px minmax(0, 1fr)" },
            gap: { xs: 4, md: 6 },
            alignItems: "start",
          }}
        >
          <Box
            component="aside"
            sx={(theme) => ({
              display: { xs: "none", md: "block" },
              position: "sticky",
              top: 100,
              borderRight: `1px solid ${theme.palette.divider}`,
              pr: 3,
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
              Contents
            </Typography>
            <Box component="nav" sx={{ display: "grid", gap: 1 }}>
              {sections.map(([sectionTitle], index) => (
                <Link
                  key={sectionTitle}
                  href={`#${slugify(sectionTitle)}`}
                  underline="none"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.88rem",
                    lineHeight: 1.4,
                    py: 0.25,
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {index + 1}. {sectionTitle}
                </Link>
              ))}
            </Box>
          </Box>

          <Box
            sx={(theme) => ({
              backgroundColor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
              overflow: "hidden",
            })}
          >
            <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
              {sections.map(([sectionTitle, body], index) => (
                <Box key={sectionTitle} id={slugify(sectionTitle)} sx={{ scrollMarginTop: "100px" }}>
                  {index > 0 && <Divider sx={{ my: { xs: 3, md: 4 } }} />}
                  <Typography
                    component="h2"
                    sx={{
                      fontFamily: (theme) => theme.custom.fonts.display,
                      fontWeight: 800,
                      fontSize: { xs: "1.15rem", md: "1.32rem" },
                      lineHeight: 1.25,
                      color: "text.primary",
                      mb: 1.25,
                    }}
                  >
                    {index + 1}. {sectionTitle}
                  </Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.98rem",
                      lineHeight: 1.85,
                    }}
                  >
                    {body}
                  </Typography>
                </Box>
              ))}
            </Box>

            {links.length > 0 && (
              <Box
                sx={(theme) => ({
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  px: { xs: 2.5, sm: 4, md: 5 },
                  py: 2.5,
                  backgroundColor: "rgba(247,239,232,0.04)",
                  borderTop: `1px solid ${theme.palette.divider}`,
                })}
              >
                {links.map(({ to, label }) => (
                  <Link
                    key={to}
                    component={RouterLink}
                    to={to}
                    sx={{
                      color: "primary.main",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default PolicyLayout;
