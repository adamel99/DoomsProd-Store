import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Typography } from "@mui/material";

const sections = [
  ["Who Operates This Store", "doomsprod operates this creator storefront for digital music products. More information about the creator is available on the About page. For privacy, account, purchase, or download questions, contact adamelh1999@gmail.com or Instagram @vdam_."],
  ["Information We Collect", "When you create an account or make a purchase, we collect account details such as your name, username, email address, password hash, cart activity, order history, purchased products, license selections, purchase totals, and email subscription preference."],
  ["How We Use It", "We use this information to create and protect your account, process orders, deliver digital downloads, send receipts, provide customer support, prevent abuse, and improve the store experience."],
  ["Payment Processing", "Payments are handled by Stripe. We send Stripe the information needed to create checkout sessions, including your email address, order details, product names, license details, totals, and internal order identifiers. We do not store your card number or payment card details on our servers."],
  ["Email Delivery", "Transactional emails, including receipts and download delivery messages, are sent through Resend. Transactional purchase emails may be sent even if you do not opt in to marketing emails."],
  ["File Storage And Downloads", "Product images and MP3 previews may be stored publicly with AWS S3 so visitors can view and play previews. Paid download files such as WAV and ZIP files are stored privately and delivered through limited-time signed download links after purchase."],
  ["Cookies", "We use essential cookies for account login and site security. This includes a signed account cookie used to keep you logged in and a CSRF security cookie used to protect forms and checkout-related requests. These cookies are used for core site functionality, not for selling your information."],
  ["Marketing Emails", "Marketing email is optional. You can choose whether to opt in when you create an account. Purchase receipts, download links, and important account or order messages are treated as transactional emails."],
  ["Minors", "This store is not directed to children under 13. If you believe a child provided personal information through the site, contact doomsprod so the information can be reviewed and removed where appropriate."],
  ["Data Requests And Deletion", "You can contact doomsprod to request access, correction, or deletion of account information. Some order, payment, security, or transaction records may need to be retained when required for legitimate business, tax, dispute, fraud-prevention, or legal reasons."],
  ["Security", "The store uses security measures such as hashed passwords, account cookies, CSRF protection, checkout webhooks, private file storage for paid downloads, and limited-time signed URLs for private files. No website can guarantee perfect security, but these controls are used to reduce unauthorized access and download abuse. For security concerns, suspected account compromise, or responsible vulnerability reports, contact adamelh1999@gmail.com."],
  ["Contact", "If you have questions about your account, purchases, download access, refunds, or privacy, contact doomsprod at adamelh1999@gmail.com or Instagram @vdam_."],
];

function PrivacyPolicy() {
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
          Privacy Policy
        </Typography>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 5 }}>
          This policy explains how doomsprod collects and uses information for accounts,
          checkout, receipts, and digital-download delivery.
        </Typography>

        <Box sx={{ display: "grid", gap: 3 }}>
          {sections.map(([title, body]) => (
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
          <Link component={RouterLink} to="/terms" sx={{ color: "primary.main", fontWeight: 700 }}>
            Terms
          </Link>
          <Link component={RouterLink} to="/products" sx={{ color: "primary.main", fontWeight: 700 }}>
            Back to products
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default PrivacyPolicy;
