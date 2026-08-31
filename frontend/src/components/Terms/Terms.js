import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Typography } from "@mui/material";

const terms = [
  ["Store Operator", "doomsprod is operated as a creator storefront for digital music products, including beats, loop kits, drum kits, and audio plugins. More information about the creator is available on the About page."],
  ["Accounts", "You are responsible for keeping your login information secure and for activity under your account. Accounts may be required to purchase products, access order history, and retrieve digital downloads."],
  ["Digital Products", "Products sold through this store are digital goods. Delivery may include public preview files, private WAV or ZIP downloads, license details, receipts, and limited-time download links."],
  ["Plugin Compatibility And Warranty", "Audio plugins are provided as digital software downloads. Before purchasing, review the product page for available compatibility details such as operating system, format, DAW support, and included installation materials. Products are provided as-is unless a product page states otherwise, and compatibility with every DAW, operating system, plugin host, update, or third-party setup is not guaranteed."],
  ["Licenses", "Beat purchases are licensed according to the license tier selected at checkout. Unless a license says otherwise, purchases do not transfer copyright ownership. Non-exclusive beat licenses may not be resold, transferred, sublicensed, registered as exclusive works, or used to make copyright or Content ID claims against the original beat."],
  ["Production Files And Sharing", "Do not resell, redistribute, lease, share, mirror, repackage, or re-upload beat files, trackouts, stems, WAVs, MP3s, ZIP packages, loop-kit files, drum sounds, plugin installers, license keys, or download links as standalone files or competing products. Purchased sounds may be used inside your own finished music according to the applicable product or license terms."],
  ["Refunds", "Refunds are handled by request. If you have a duplicate purchase, download issue, wrong item, file problem, or other order concern, contact doomsprod by email at adamelh1999@gmail.com or Instagram at @vdam_. Refund availability may depend on the order status, whether files were delivered, and the specific issue."],
  ["Payments", "Payments are processed through Stripe. By checking out, you authorize Stripe to process the selected purchase amount and agree to provide accurate checkout information."],
  ["Lifetime Re-Downloads", "Customers receive lifetime account re-download access for the files included with the product and license purchased, while the store remains available and the account remains in good standing. For example, if a Basic beat license includes MP3 delivery only, lifetime re-download access applies to that MP3 and not to WAV, stems, trackouts, or ZIP files unless those files were included with the selected license."],
  ["Downloads", "Private download links may expire for security reasons even when account re-download access remains available. If a purchased file link expires or fails, contact support and include your order email or order details so access can be restored. Do not publish, forward, sell, or share private download links."],
  ["Disputes And Chargebacks", "If something is wrong with your order, contact doomsprod first by email at adamelh1999@gmail.com or Instagram at @vdam_ so the issue can be reviewed and fixed. Fraudulent disputes, chargebacks after successful delivery, or attempts to keep files while reversing payment may result in download access being revoked, account limits, and evidence being submitted to the payment processor."],
  ["Account Restrictions", "doomsprod may suspend, restrict, or terminate account access, downloads, or future purchases for fraud, payment abuse, chargeback abuse, unauthorized file sharing, license violations, security abuse, harassment, or attempts to bypass checkout or download protections."],
  ["Acceptable Use", "Do not attempt to bypass checkout, access another customer's downloads, abuse account systems, scrape private data, probe private systems without permission, or interfere with the store's security or availability."],
  ["Security Contact", "For security concerns, suspected account compromise, or responsible vulnerability reports, contact adamelh1999@gmail.com with enough detail to understand the issue. Do not access, change, download, or disclose another user's data while reporting a concern."],
  ["Support", "For purchase, license, refund, dispute, plugin compatibility, or download questions, contact adamelh1999@gmail.com or Instagram @vdam_."],
];

function Terms() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        color: "text.primary",
        px: { xs: 2.5, sm: 4 },
        py: { xs: 7, md: 10 },
      }}
    >
      <Box sx={{ maxWidth: 820, mx: "auto" }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: (theme) => theme.custom.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "2.1rem", md: "3rem" },
            lineHeight: 1.05,
            mb: 2,
          }}
        >
          Terms And Purchase Policy
        </Typography>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 5 }}>
          These terms explain account use, digital-product purchases, licenses, refunds,
          payments, and download access for doomsprod.
        </Typography>

        <Box sx={{ display: "grid", gap: 3 }}>
          {terms.map(([title, body]) => (
            <Box
              key={title}
              sx={(theme) => ({
                ...theme.custom.patterns.surface.raised,
                borderRadius: "var(--radius-lg)",
                p: { xs: 2.5, sm: 3 },
              })}
            >
              <Typography
                component="h2"
                sx={{
                  fontFamily: (theme) => theme.custom.fonts.display,
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>
                {body}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 4 }}>
          <Link component={RouterLink} to="/about" sx={{ color: "primary.main", fontWeight: 700 }}>
            About doomsprod
          </Link>
          <Link component={RouterLink} to="/licenses" sx={{ color: "primary.main", fontWeight: 700 }}>
            View licenses
          </Link>
          <Link component={RouterLink} to="/privacy-policy" sx={{ color: "primary.main", fontWeight: 700 }}>
            Privacy Policy
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default Terms;
