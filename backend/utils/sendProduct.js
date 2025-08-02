const nodemailer = require("nodemailer");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Check if string is a full URL
function isUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Generate signed S3 URL from a file key or return URL as-is
async function getSignedFileUrl(key) {
  if (isUrl(key)) return key;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
}

// Send purchase confirmation email with download links
async function sendProductEmail(email, fileKeys = []) {
  console.log("📧 Preparing email to:", email);
  console.log("🔗 File keys:", fileKeys);

  const downloadLinks = await Promise.all(
    fileKeys.map(async (key) => {
      try {
        const url = await getSignedFileUrl(key);
        console.log(`✅ Signed URL for: ${key}`);
        return url;
      } catch (err) {
        console.error(`❌ Failed for: ${key}`, err);
        throw err;
      }
    })
  );

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Your Store" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: "🎧 Your Download is Ready!",
    html: `
      <p>Thanks for your purchase! Here are your download links:</p>
      <ul>
        ${downloadLinks.map(link => `<li><a href="${link}">${link}</a></li>`).join("")}
      </ul>
      <p><small>These links expire in 1 hour.</small></p>
    `,
  });

  console.log("✅ Email sent!");
}

module.exports = { sendProductEmail, getSignedFileUrl };
