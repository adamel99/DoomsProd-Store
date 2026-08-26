const { DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const readFirstBytes = async (stream, byteCount = 32) => {
  const chunks = [];
  let length = 0;

  for await (const chunk of stream) {
    chunks.push(chunk);
    length += chunk.length;
    if (length >= byteCount) break;
  }

  return Buffer.concat(chunks).subarray(0, byteCount);
};

const isJpeg = (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
const isPng = (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isWebp = (buffer) => buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
const isZip = (buffer) => buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
const isMp3 = (buffer) => buffer.subarray(0, 3).toString() === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
const isWav = (buffer) => buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WAVE";

const expectedType = (fieldname) => {
  if (fieldname === "image") return ["image"];
  if (fieldname === "zipFile") return ["zip"];
  if (fieldname === "mp3File") return ["mp3"];
  if (fieldname === "wavFile") return ["wav"];
  return [];
};

const maxSizeByField = {
  image: 10 * 1024 * 1024,
  mp3File: 30 * 1024 * 1024,
  wavFile: 200 * 1024 * 1024,
  zipFile: 500 * 1024 * 1024,
};

const detectType = (buffer) => {
  if (isJpeg(buffer) || isPng(buffer) || isWebp(buffer)) return "image";
  if (isZip(buffer)) return "zip";
  if (isMp3(buffer)) return "mp3";
  if (isWav(buffer)) return "wav";
  return null;
};

const publicBucket = process.env.AWS_S3_BUCKET_NAME;
const privateDownloadsBucket = process.env.AWS_PRIVATE_S3_BUCKET_NAME || "doomsstore-private-downloads";

const bucketForFile = (file) => (
  ["image", "mp3File"].includes(file.fieldname) ? publicBucket : privateDownloadsBucket
);

const deleteUploadedFile = async (file) => {
  if (!file?.key) return;
  await s3.send(new DeleteObjectCommand({
    Bucket: bucketForFile(file),
    Key: file.key,
  }));
};

const validateUploadedFileSignatures = async (req, res, next) => {
  try {
    const files = Object.values(req.files || {}).flat();

    for (const file of files) {
      const command = new GetObjectCommand({
        Bucket: bucketForFile(file),
        Key: file.key,
      });
      const object = await s3.send(command);
      const firstBytes = await readFirstBytes(object.Body);
      const detected = detectType(firstBytes);

      if (!expectedType(file.fieldname).includes(detected)) {
        await Promise.all(files.map(deleteUploadedFile));
        return res.status(400).json({ message: "Invalid uploaded file content." });
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

const validateUploadedFileSizes = async (req, res, next) => {
  try {
    const files = Object.values(req.files || {}).flat();

    for (const file of files) {
      const maxSize = maxSizeByField[file.fieldname];
      if (!maxSize || file.size > maxSize) {
        await Promise.all(files.map(deleteUploadedFile));
        return res.status(400).json({ message: "Uploaded file is too large." });
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { validateUploadedFileSignatures, validateUploadedFileSizes };
