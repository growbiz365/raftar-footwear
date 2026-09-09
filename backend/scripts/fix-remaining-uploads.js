/**
 * Fix remaining /uploads references missed by migrate-to-cloudinary.js.
 * - Downloads the asdasd image from the deployed server if missing locally.
 * - Uploads both leftover files to Cloudinary.
 * - Rewrites setting "popup" image and product "asdasd" images/colorVariants.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');
const cloudinary = require('../src/config/cloudinary');
const Product = require('../src/models/Product');
const Setting = require('../src/models/Setting');

const UPLOADS_DIR = path.join(__dirname, '..', 'src', 'uploads');

const TARGETS = {
  '1788857607681-a6b28f2a.jpg': null,
  '1788868449849-2c92a8e1.jpg': 'https://raftarfootwear.com/uploads/1788868449849-2c92a8e1.jpg',
};

function ensureLocal(file, remote) {
  const fp = path.join(UPLOADS_DIR, file);
  if (fs.existsSync(fp)) return true;
  if (!remote) return false;
  console.log('downloading missing file:', file);
  return new Promise((resolve, reject) => {
    https.get(remote, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`GET ${remote} -> ${res.statusCode}`));
      const ws = fs.createWriteStream(fp);
      ws.on('finish', () => { ws.close(); resolve(true); });
      ws.on('error', reject);
      res.pipe(ws);
    }).on('error', reject);
  });
}

async function uploadLocalFile(file) {
  const fp = path.join(UPLOADS_DIR, file);
  const buf = fs.readFileSync(fp);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'raftar-footwear/uploads', resource_type: 'image' },
      (err, r) => (err ? reject(new Error(err.message)) : resolve(r.secure_url))
    );
    stream.on('error', reject);
    stream.end(buf);
  });
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });

    const map = {};
    for (const [file, remote] of Object.entries(TARGETS)) {
      const ok = await ensureLocal(file, remote);
      if (!ok) throw new Error(`cannot obtain local file: ${file}`);
      map[file] = await uploadLocalFile(file);
      console.log('uploaded:', file, '→', map[file]);
    }

    let changed = 0;

    for (const p of await Product.find({ slug: 'asdasd' }).lean()) {
      let diff = false;
      const images = (p.images || []).map((i) => {
        const m = i.match(/\/uploads\/([\w.-]+\.(?:jpg|png|webp))$/);
        if (m && map[m[1]]) { diff = true; return map[m[1]]; }
        return i;
      });
      const colorVariants = (p.colorVariants || []).map((cv) => {
        const m = cv.image && cv.image.match(/\/uploads\/([\w.-]+\.(?:jpg|png|webp))$/);
        if (m && map[m[1]]) { diff = true; return { ...cv, image: map[m[1]] }; }
        return cv;
      });
      if (diff) {
        await Product.updateOne({ _id: p._id }, { $set: { images, colorVariants } });
        changed += 1;
      }
    }

    for (const s of await Setting.find({ key: 'popup' }).lean()) {
      const blob = JSON.stringify(s.value);
      let v = s.value;
      for (const [file, url] of Object.entries(map)) {
        const re = new RegExp(`\\/uploads\\/${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
        if (re.test(blob)) {
          v = JSON.parse(blob.replace(re, url));
          changed += 1;
        }
      }
      if (changed) await Setting.updateOne({ _id: s._id }, { $set: { value: v } });
    }

    console.log('docs changed:', changed);

    const remaining = [];
    for (const p of await Product.find().lean()) {
      (p.images || []).forEach((i) => { if (i.includes('/uploads/')) remaining.push('product:' + p.slug + ':' + i); });
      (p.colorVariants || []).forEach((cv) => { if (cv.image?.includes('/uploads/')) remaining.push('product:' + p.slug + ':cv:' + cv.image); });
    }
    for (const s of await Setting.find().lean()) if (JSON.stringify(s.value).includes('/uploads/')) remaining.push('setting:' + s.key);
    console.log('remaining /uploads refs:', remaining.length ? remaining : 'NONE');

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('error:', e.message);
    process.exit(1);
  }
})();