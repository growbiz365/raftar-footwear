const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|jpg)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function compressToJpeg(buffer) {
  return sharp(buffer)
    .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
}

function uploadToCloudinary(buffer, folder = 'revone') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'jpg' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// Persistent local fallback so images never break when Cloudinary is offline.
function saveLocal(buffer) {
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

function handleSingleUpload(req, res, next) {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return next();
    let compressed;
    try {
      compressed = await compressToJpeg(req.file.buffer);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Image processing failed: ' + e.message });
    }
    try {
      req.uploadedUrl = await uploadToCloudinary(compressed);
    } catch (e) {
      console.error('Cloudinary upload error:', e.message, '— storing locally');
      req.uploadedUrl = saveLocal(compressed);
    }
    next();
  });
}

function handleMultiUpload(req, res, next) {
  upload.array('images', 8)(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.files?.length) return next();
    try {
      req.uploadedUrls = await Promise.all(
        req.files.map(async (f) => {
          const compressed = await compressToJpeg(f.buffer);
          try {
            return await uploadToCloudinary(compressed);
          } catch (e) {
            console.error('Cloudinary upload error:', e.message, '— storing locally');
            return saveLocal(compressed);
          }
        })
      );
      next();
    } catch (e) {
      console.error('Image processing error:', e.message);
      res.status(500).json({ success: false, message: 'Image processing failed: ' + e.message });
    }
  });
}

module.exports = { upload, handleSingleUpload, handleMultiUpload, compressToJpeg };