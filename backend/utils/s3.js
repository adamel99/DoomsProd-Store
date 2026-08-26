// utils/s3.js
const { S3Client } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const path = require("path");
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

const publicBucket = process.env.AWS_S3_BUCKET_NAME;
const privateDownloadsBucket = process.env.AWS_PRIVATE_S3_BUCKET_NAME || "doomsstore-private-downloads";
const allowedUploadFields = new Set(["image", "zipFile", "mp3File", "wavFile"]);
const allowedMimeTypesByField = {
  image: new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]),
  mp3File: new Set(["audio/mpeg", "audio/mp3"]),
  wavFile: new Set(["audio/wav", "audio/wave", "audio/x-wav", "audio/vnd.wave"]),
  zipFile: new Set(["application/zip", "application/x-zip-compressed", "application/x-zip"]),
};
const allowedExtensionsByField = {
  image: new Set([".jpg", ".jpeg", ".png", ".webp"]),
  mp3File: new Set([".mp3"]),
  wavFile: new Set([".wav"]),
  zipFile: new Set([".zip"]),
};

const bucketForUpload = (file) => (
  ["image", "mp3File"].includes(file.fieldname) ? publicBucket : privateDownloadsBucket
);

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: (req, file, cb) => {
      cb(null, bucketForUpload(file));
    },
    // Remove or comment out the line below:
    // acl: "public-read",

    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const uniqueFileName = `${crypto.randomUUID()}${ext}`;
      cb(null, `products/${uniqueFileName}`);
    },
  }),
  limits: {
    fileSize: 500 * 1024 * 1024,
    files: 4,
    fields: 12,
    fieldSize: 10 * 1024,
    parts: 20,
  },

  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();

    if (!allowedUploadFields.has(file.fieldname)) {
      return cb(new Error("Invalid upload field."));
    }

    if (!allowedMimeTypesByField[file.fieldname]?.has(file.mimetype)) {
      return cb(new Error("Invalid file type for this upload field."));
    }

    if (!allowedExtensionsByField[file.fieldname]?.has(ext)) {
      return cb(new Error("Invalid file extension for this upload field."));
    }

    return cb(null, true);
  },
});


module.exports = upload;
