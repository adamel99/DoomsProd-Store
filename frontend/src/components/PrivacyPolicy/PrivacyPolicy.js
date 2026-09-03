import React from "react";
import PolicyLayout from "../PolicyLayout/PolicyLayout";

const sections = [
  ["Who Operates This Store", "doomsprod operates this creator storefront for digital music products. More information about the creator is available on the About page. For privacy, account, purchase, or download questions, contact adamelh1999@gmail.com or Instagram @vdam_."],
  ["Information We Collect", "When you create an account or make a purchase, we collect account details such as your name, username, email address, password hash, cart activity, order history, purchased products, license selections, purchase totals, and email subscription preference."],
  ["How We Use It", "We use this information to create and protect your account, process orders, deliver digital downloads, send receipts, provide customer support, prevent abuse, and improve the store experience."],
  ["Payment Processing", "Payments are handled by Stripe. We send Stripe the information needed to create checkout sessions, including your email address, order details, product names, license details, totals, and internal order identifiers. We do not store your card number or payment card details on our servers."],
  ["Email Delivery", "Transactional emails, including receipts and download delivery messages, are sent through Resend. Transactional purchase emails may be sent even if you do not opt in to marketing emails."],
  ["File Storage And Downloads", "Product images and MP3 previews may be stored publicly with AWS S3 so visitors can view and play previews. Paid download files such as WAV and ZIP files are stored privately and delivered through limited-time signed download links after purchase."],
  ["Service Providers", "We may share limited information with service providers that help operate the store, including Stripe for payment processing, Resend for email delivery, AWS S3 for file storage and signed downloads, hosting/database providers for running the application, and security or legal providers when needed for fraud, disputes, chargebacks, or compliance. These providers receive information only as needed for those services."],
  ["Cookies", "We use essential cookies for account login and site security. This includes a signed account cookie used to keep you logged in and a CSRF security cookie used to protect forms and checkout-related requests. These cookies are used for core site functionality, not for selling your information."],
  ["No Sale Of Personal Information", "We do not sell personal information. We also do not share personal information for cross-context behavioral advertising. If that practice ever changes, this policy will be updated and any required opt-out choices will be provided."],
  ["Marketing Emails", "Marketing email is optional. You can choose whether to opt in when you create an account, update your account preference, or contact adamelh1999@gmail.com to opt out. Purchase receipts, download links, and important account or order messages are treated as transactional emails."],
  ["Minors", "This store is not directed to children under 13. If you believe a child provided personal information through the site, contact doomsprod so the information can be reviewed and removed where appropriate."],
  ["Data Requests And Deletion", "You can contact doomsprod to request access, correction, or deletion of account information. Some order, payment, security, or transaction records may need to be retained when required for legitimate business, tax, dispute, fraud-prevention, or legal reasons."],
  ["Security", "The store uses security measures such as hashed passwords, account cookies, CSRF protection, checkout webhooks, private file storage for paid downloads, and limited-time signed URLs for private files. No website can guarantee perfect security, but these controls are used to reduce unauthorized access and download abuse. For security concerns, suspected account compromise, or responsible vulnerability reports, contact adamelh1999@gmail.com."],
  ["Contact", "If you have questions about your account, purchases, download access, refunds, privacy, or email preferences, contact doomsprod at adamelh1999@gmail.com or Instagram @vdam_. Business mailing address: available upon request until a dedicated business mailbox is published."],
];

function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      description="This policy explains how doomsprod collects and uses information for accounts, checkout, receipts, and digital-download delivery."
      updatedAt="September 1, 2026"
      sections={sections}
      links={[
        { to: "/about", label: "About doomsprod" },
        { to: "/terms", label: "Terms" },
        { to: "/products", label: "Back to products" },
      ]}
    />
  );
}

export default PrivacyPolicy;
