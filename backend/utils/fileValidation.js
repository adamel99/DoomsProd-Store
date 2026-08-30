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

const validateUploadedFileSignatures = async (req, res, next) => {
  try {
    const files = Object.values(req.files || {}).flat();

    for (const file of files) {
      const firstBytes = file.buffer?.subarray(0, 32) || Buffer.alloc(0);
      const detected = detectType(firstBytes);

      if (!expectedType(file.fieldname).includes(detected)) {
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
        return res.status(400).json({ message: "Uploaded file is too large." });
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { validateUploadedFileSignatures, validateUploadedFileSizes };
