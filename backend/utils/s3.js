// utils/s3.js
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    // Remove or comment out the line below:
    // acl: "public-read",

    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueFileName = `${Date.now()}-${file.originalname}`;
      console.log("Uploading to S3 key:", uniqueFileName); // 👈 should match what S3 shows
      cb(null, `products/${uniqueFileName}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024
  }, // 100MB

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "audio/mpeg",                    // mp3
      "audio/wav",                     // wav
      "audio/wave",                    // wav (some browsers)
      "audio/x-wav",                   // wav (some browsers)
      "audio/vnd.wave",                // wav (some browsers)
      "application/zip",               // zip
      "application/x-zip-compressed",  // zip
      "application/octet-stream",      // zip/wav fallback
      "application/x-zip",             // zip (some browsers)
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, JPG, MP3, WAV, and ZIP allowed."));
    }
  },
});


module.exports = upload;
