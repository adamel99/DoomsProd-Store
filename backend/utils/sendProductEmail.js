const { Resend } = require("resend");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const resend = new Resend(process.env.RESEND_API_KEY);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function isUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

async function getSignedFileUrl(key) {
  if (isUrl(key)) return key;
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

async function sendProductEmail(email, fileKeys = []) {
  console.log("📧 Preparing email to:", email);
  console.log("🔗 File keys:", fileKeys);

  const downloadLinks = await Promise.all(
    fileKeys.map(async (key) => {
      try {
        const url = await getSignedFileUrl(key);
        const fileName = decodeURIComponent(key.split("/").pop());
        console.log(`✅ Signed URL for: ${key}`);
        return { url, fileName };
      } catch (err) {
        console.error(`❌ Failed to generate signed URL for: ${key}`, err);
        throw err;
      }
    })
  );

  console.log("📤 Final download links:", downloadLinks);

  const { data, error } = await resend.emails.send({
    from: "doomsprod <noreply@dooma.studio>",
    to: email,
    subject: "Your download from doomsprod is ready",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background-color:#0e0b0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0e0b0d;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1a1118;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:560px;width:100%;">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#1a0a12,#2a0f1c);padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(228,63,111,0.2);">
                      <div style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:#E43F6F;box-shadow:0 0 12px rgba(228,63,111,0.8);margin-bottom:16px;"></div>
                      <h1 style="margin:0;font-size:26px;font-weight:800;color:#FFEAEC;letter-spacing:-0.5px;">doomsprod</h1>
                      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,234,236,0.4);letter-spacing:1px;text-transform:uppercase;">Beat Store</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#FFEAEC;">Your files are ready to download</h2>
                      <p style="margin:0 0 28px;font-size:15px;color:rgba(255,234,236,0.5);line-height:1.6;">
                        Thank you for your purchase. Your download links are below and will expire in <strong style="color:rgba(255,234,236,0.7);">1 hour</strong>. Please save your files before they expire.
                      </p>

                      <!-- Download buttons -->
                      ${downloadLinks.map(({ url, fileName }) => `
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                          <tr>
                            <td style="background-color:rgba(228,63,111,0.08);border:1px solid rgba(228,63,111,0.25);border-radius:12px;padding:16px 20px;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td>
                                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,234,236,0.5);text-transform:uppercase;letter-spacing:0.5px;">Download</p>
                                    <p style="margin:0;font-size:14px;font-weight:700;color:#FFEAEC;word-break:break-all;">${fileName}</p>
                                  </td>
                                  <td align="right" style="padding-left:16px;">
                                    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#E43F6F,#c02d5a);color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;white-space:nowrap;">
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
                          <td style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 20px;">
                            <p style="margin:0;font-size:13px;color:rgba(255,234,236,0.4);line-height:1.6;">
                              If you have any issues with your download, reply to this email and we'll get it sorted. We'd love to hear what you create — feel free to send back any finished tracks!
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                      <p style="margin:0;font-size:12px;color:rgba(255,234,236,0.2);line-height:1.6;">
                        You received this email because you made a purchase at doomsprod.<br/>
                        &copy; ${new Date().getFullYear()} doomsprod &middot; <a href="https://dooma.studio" style="color:rgba(228,63,111,0.5);text-decoration:none;">dooma.studio</a>
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

  console.log("✅ Email sent successfully! ID:", data.id);
}

module.exports = { sendProductEmail, getSignedFileUrl };
