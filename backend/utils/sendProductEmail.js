const { Resend } = require("resend");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const emailTheme = require("./emailTheme");

const resend = new Resend(process.env.RESEND_API_KEY);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const privateDownloadsBucket = process.env.AWS_PRIVATE_S3_BUCKET_NAME || "doomsstore-private-downloads";
const SIGNED_URL_EXPIRES_IN_SECONDS = 900;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getSignedFileUrl(key) {
  if (typeof key !== "string" || !key.startsWith("products/")) {
    throw new Error("Invalid download key");
  }

  const command = new GetObjectCommand({
    Bucket: privateDownloadsBucket,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: SIGNED_URL_EXPIRES_IN_SECONDS });
}

async function getSignedDownload(file) {
  const key = typeof file === "string" ? file : file?.key;
  const type = typeof file === "string" ? null : file?.type;
  if (file?.url) return { type, url: file.url };
  const url = await getSignedFileUrl(key);
  return { type, url };
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatPurchaseTime(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatReceiptItem(item) {
  const details = [
    item.type ? item.type.replace("_", " ") : null,
    item.license,
    item.quantity > 1 ? `Qty ${item.quantity}` : null,
  ].filter(Boolean).join(" · ");

  return {
    title: escapeHtml(item.title || "Product"),
    details: escapeHtml(details || "Digital download"),
    terms: escapeHtml(item.licenseTerms || item.licenseDescription || ""),
    price: formatCurrency(item.price),
  };
}

async function sendProductEmail(email, files = [], receipt = {}) {
  const { colors, clay } = emailTheme;
  receipt = receipt || {};
  const username = escapeHtml(receipt.username || "there");
  const receiptItems = Array.isArray(receipt.items) ? receipt.items.map(formatReceiptItem) : [];
  const totalPaid = formatCurrency(receipt.totalPaid);
  const purchaseTime = formatPurchaseTime(receipt.purchasedAt);
  const downloadLinks = await Promise.all(
    files.map(async (file) => {
      try {
        const key = typeof file === "string" ? file : file?.key;
        const type = typeof file === "string" ? null : file?.type;
        const url = file?.url || await getSignedFileUrl(key);
        const fileName = escapeHtml(decodeURIComponent((key || file?.url || "").split("?")[0].split("/").pop()));
        return { type, url, fileName };
      } catch (err) {
        console.error("❌ Failed to generate signed URL for download:", err);
        throw err;
      }
    })
  );

  const { data, error } = await resend.emails.send({
    from: "doomsprod <noreply@dooma.studio>",
    to: email,
    subject: "Your doomsprod receipt and downloads",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background-color:${colors.page};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${colors.text};">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${colors.page};padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:${colors.surface};background-image:${clay.surfaceSoft};border-radius:20px;border:${clay.border};box-shadow:${clay.raised};overflow:hidden;max-width:560px;width:100%;">

                  <!-- Header -->
                  <tr>
                    <td style="background:${clay.surface};padding:40px 40px 32px;text-align:center;border-bottom:${clay.hairline};">
                      <div style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${colors.primary};box-shadow:0 0 14px rgba(255,87,159,0.48);margin-bottom:16px;"></div>
                      <h1 style="margin:0;font-size:26px;font-weight:800;color:${colors.text};letter-spacing:-0.5px;">doomsprod</h1>
                      <p style="margin:8px 0 0;font-size:13px;color:${colors.textMuted};letter-spacing:1px;text-transform:uppercase;">Beat Store</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${colors.text};">Hey ${username}, thanks for purchasing</h2>
                      <p style="margin:0 0 28px;font-size:15px;color:${colors.textMuted};line-height:1.6;">
                        Your files are ready below. Private ZIP/WAV download links expire in <strong style="color:${colors.text};">15 minutes</strong>. Public MP3 links may remain available.
                      </p>

                      <!-- Receipt -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:${colors.surfaceCool};border:${clay.hairline};border-radius:14px;overflow:hidden;">
                        <tr>
                          <td style="padding:18px 20px;border-bottom:${clay.hairline};">
                            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${colors.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Receipt</p>
                            <p style="margin:0;font-size:18px;font-weight:800;color:${colors.text};">Order #${escapeHtml(receipt.orderId || "")}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 20px 16px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:14px 0;border-bottom:${clay.hairline};font-size:13px;color:${colors.textMuted};">Username</td>
                                <td align="right" style="padding:14px 0;border-bottom:${clay.hairline};font-size:13px;font-weight:700;color:${colors.text};">${username}</td>
                              </tr>
                              <tr>
                                <td style="padding:14px 0;border-bottom:${clay.hairline};font-size:13px;color:${colors.textMuted};">Purchased</td>
                                <td align="right" style="padding:14px 0;border-bottom:${clay.hairline};font-size:13px;font-weight:700;color:${colors.text};">${escapeHtml(purchaseTime)}</td>
                              </tr>
                              <tr>
                                <td style="padding:14px 0;font-size:13px;color:${colors.textMuted};">Paid</td>
                                <td align="right" style="padding:14px 0;font-size:13px;font-weight:800;color:${colors.text};">${escapeHtml(totalPaid)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        ${receiptItems.length ? `
                          <tr>
                            <td style="padding:0 20px 20px;">
                              ${receiptItems.map((item) => `
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-top:${clay.hairline};">
                                  <tr>
                                    <td style="padding:14px 0;">
                                      <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:${colors.text};">${item.title}</p>
                                      <p style="margin:0;font-size:12px;color:${colors.textMuted};text-transform:capitalize;">${item.details}</p>
                                      ${item.terms ? `<p style="margin:8px 0 0;font-size:12px;color:${colors.inkSoft};line-height:1.5;">${item.terms}</p>` : ""}
                                    </td>
                                    <td align="right" style="padding:14px 0 14px 16px;font-size:14px;font-weight:800;color:${colors.text};">${item.price}</td>
                                  </tr>
                                </table>
                              `).join("")}
                            </td>
                          </tr>
                        ` : ""}
                      </table>

                      <!-- Download buttons -->
                      ${downloadLinks.map(({ type, url, fileName }) => `
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                          <tr>
                            <td style="background:${clay.surfaceCool};border:${clay.hairline};border-radius:14px;padding:16px 20px;box-shadow:${clay.raisedSmall};">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td>
                                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${colors.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Download</p>
                                    <p style="margin:0;font-size:14px;font-weight:700;color:${colors.text};word-break:break-all;">${type ? type.toUpperCase() : fileName}</p>
                                  </td>
                                  <td align="right" style="padding-left:16px;">
                                    <a href="${url}" style="display:inline-block;background:${clay.brandSoft};color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 20px;border-radius:10px;white-space:nowrap;">
                                      Download
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      `).join("")}

                      <!-- Note -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                        <tr>
                          <td style="background-color:rgba(255,87,159,0.08);border:${clay.hairline};border-radius:12px;padding:16px 20px;">
                            <p style="margin:0;font-size:13px;color:${colors.textMuted};line-height:1.6;">
                              If you have any issues with your download, reply to this email and we'll get it sorted. We'd love to hear what you create — feel free to send back any finished tracks!
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 40px;border-top:${clay.hairline};text-align:center;">
                      <p style="margin:0;font-size:12px;color:${colors.textQuiet};line-height:1.6;">
                        You received this email because you made a purchase at doomsprod.<br/>
                        &copy; ${new Date().getFullYear()} doomsprod &middot; <a href="https://dooma.studio" style="color:${colors.primary};text-decoration:none;">dooma.studio</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("❌ Resend error:", error);
    throw new Error(error.message);
  }

  return data;
}

module.exports = { sendProductEmail, getSignedFileUrl, getSignedDownload };
