import React from "react";
import PolicyLayout from "../PolicyLayout/PolicyLayout";

const terms = [
  ["Store Operator", "doomsprod is operated as a creator storefront for digital music products, including beats, loop kits, drum kits, and audio plugins. More information about the creator is available on the About page."],
  ["Accounts", "You are responsible for keeping your login information secure and for activity under your account. Accounts may be required to purchase products, access order history, and retrieve digital downloads."],
  ["Digital Products", "Products sold through this store are digital goods. Delivery may include public preview files, private WAV or ZIP downloads, license details, receipts, and limited-time download links."],
  ["Plugin Compatibility And Warranty", "Audio plugins are provided as digital software downloads. Before purchasing, review the product page for available compatibility details such as operating system, format, DAW support, and included installation materials. Products are provided as-is unless a product page states otherwise, and compatibility with every DAW, operating system, plugin host, update, or third-party setup is not guaranteed."],
  ["Licenses", "Beat purchases are licensed according to the license tier selected at checkout. Unless a separate signed agreement says otherwise, purchases do not transfer copyright, publishing, master ownership, or producer ownership in the underlying beat. Non-exclusive beat licenses may not be resold, transferred, sublicensed, registered as exclusive works, or used to make copyright or Content ID claims against the original beat."],
  ["Beat License Tiers", "Basic licenses include MP3 delivery for drafts, demos, and limited non-commercial use up to 5,000 streams. Premium licenses include MP3 and WAV delivery for commercial releases up to 100,000 streams, including standard monetized streaming platforms and limited radio use. Unlimited licenses include MP3, WAV, and ZIP delivery for commercial releases with no stream cap. Exclusive licenses include MP3, WAV, and ZIP delivery and grant exclusive commercial usage rights to the purchased beat, but copyright, publishing, and master ownership remain with doomsprod unless a separate signed agreement says otherwise."],
  ["License Restrictions", "Unless written permission says otherwise, sync licensing for film, TV, games, paid advertising, brand campaigns, or other audiovisual commercial placements requires separate approval. Non-exclusive licenses do not allow Content ID registration, copyright claims, exclusive-rights claims, resale, redistribution, sublicensing, or transfer. Credit may be required depending on the selected license or written agreement."],
  ["Production Files And Sharing", "Do not resell, redistribute, lease, share, mirror, repackage, or re-upload beat files, trackouts, stems, WAVs, MP3s, ZIP packages, loop-kit files, drum sounds, plugin installers, license keys, or download links as standalone files or competing products. Purchased sounds may be used inside your own finished music according to the applicable product or license terms."],
  ["Refunds", "Because products are digital downloads, completed purchases are generally final once files or download access have been delivered. Refunds may be reviewed for duplicate purchases, wrong-item purchases, failed delivery, corrupted or missing files, unresolved technical download problems, or other issues approved by doomsprod. Contact adamelh1999@gmail.com or Instagram @vdam_ with your order email and details before opening a chargeback."],
  ["Payments", "Payments are processed through Stripe. By checking out, you authorize Stripe to process the selected purchase amount and agree to provide accurate checkout information."],
  ["Lifetime Re-Downloads", "Customers receive lifetime account re-download access for the files included with the product and license purchased, while the store remains available and the account remains in good standing. For example, if a Basic beat license includes MP3 delivery only, lifetime re-download access applies to that MP3 and not to WAV, stems, trackouts, or ZIP files unless those files were included with the selected license."],
  ["Downloads", "Private download links may expire for security reasons even when account re-download access remains available. If a purchased file link expires or fails, contact support and include your order email or order details so access can be restored. Do not publish, forward, sell, or share private download links."],
  ["Disputes And Chargebacks", "If something is wrong with your order, contact doomsprod first by email at adamelh1999@gmail.com or Instagram at @vdam_ so the issue can be reviewed and fixed. Fraudulent disputes, chargebacks after successful delivery, or attempts to keep files while reversing payment may result in download access being revoked, account limits, and evidence being submitted to the payment processor."],
  ["Account Restrictions", "doomsprod may suspend, restrict, or terminate account access, downloads, or future purchases for fraud, payment abuse, chargeback abuse, unauthorized file sharing, license violations, security abuse, harassment, or attempts to bypass checkout or download protections."],
  ["Acceptable Use", "Do not attempt to bypass checkout, access another customer's downloads, abuse account systems, scrape private data, probe private systems without permission, or interfere with the store's security or availability."],
  ["Security Contact", "For security concerns, suspected account compromise, or responsible vulnerability reports, contact adamelh1999@gmail.com with enough detail to understand the issue. Do not access, change, download, or disclose another user's data while reporting a concern."],
  ["Marketing Email Opt-Out", "Marketing emails are optional. You can opt out by updating your account preference or by contacting adamelh1999@gmail.com. Transactional emails about purchases, receipts, downloads, account security, or important order issues may still be sent."],
  ["Support", "For purchase, license, refund, dispute, plugin compatibility, download, privacy, or email opt-out questions, contact adamelh1999@gmail.com or Instagram @vdam_. Business mailing address: available upon request until a dedicated business mailbox is published."],
];

function Terms() {
  return (
    <PolicyLayout
      title="Terms And Purchase Policy"
      description="These terms explain account use, digital-product purchases, licenses, refunds, payments, and download access for doomsprod."
      updatedAt="September 1, 2026"
      sections={terms}
      links={[
        { to: "/about", label: "About doomsprod" },
        { to: "/licenses", label: "View licenses" },
        { to: "/privacy-policy", label: "Privacy Policy" },
      ]}
    />
  );
}

export default Terms;
