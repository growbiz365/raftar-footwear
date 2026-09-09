/**
 * Migrate ALL image references to Cloudinary.
 *
 * - Builds a name->Cloudinary URL map from the `raftar-footwear` folder.
 * - Uploads any locally stored /uploads/*.jpg referenced in the DB.
 * - Rewrites every image URL in MongoDB (products, categories, blogs, settings)
 *   from https://raftarfootwear.com/wp-content/... and /uploads/... to Cloudinary.
 * - Writes the final mapping to src/uploads/wp-originals/mapping.json for reference.
 *
 * Run:  node scripts/migrate-to-cloudinary.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('../src/config/cloudinary');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const Blog = require('../src/models/Blog');
const Setting = require('../src/models/Setting');

const UPLOADS_DIR = path.join(__dirname, '..', 'src', 'uploads');
const OUT_DIR = path.join(UPLOADS_DIR, 'wp-originals');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function fetchFolderMap(folder) {
  const map = {};
  const res = await cloudinary.search
    .expression(`folder:${folder}`)
    .max_results(500)
    .execute();
  for (const r of res.resources || []) {
    const base = r.public_id.split('/').pop().replace(/\.[^.]+$/, '');
    map[base] = r.secure_url;
  }
  return map;
}

async function uploadLocalFile(file) {
  const filePath = path.join(UPLOADS_DIR, file);
  const buf = fs.readFileSync(filePath);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'raftar-footwear/uploads', resource_type: 'image' },
      (err, r) => (err ? reject(new Error(err.message)) : resolve(r.secure_url))
    );
    stream.on('error', reject);
    stream.end(buf);
  });
}

function rewriteUrl(str, wpMap, localMap, countRef) {
  const wp = str.match(/https:\/\/raftarfootwear\.com\/wp-content\/uploads\/(\d{4}\/\d{2})\/([^/]+)/);
  if (wp) {
    const base = wp[2].replace(/\.[^.]+$/, '');
    const url = wpMap[base];
    if (url) {
      countRef.n += 1;
      return url;
    }
    console.warn(`[migrate] no Cloudinary match for ${str}`);
    return str;
  }
  const local = str.match(/^\/uploads\/([^/]+)$/);
  if (local) {
    const url = localMap[local[1]];
    if (url) {
      countRef.n += 1;
      return url;
    }
    console.warn(`[migrate] local file not uploaded: /uploads/${local[1]}`);
    return str;
  }
  return str;
}

function walk(value, wpMap, localMap, countRef) {
  if (Array.isArray(value)) return value.map((v) => walk(v, wpMap, localMap, countRef));
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) value[k] = walk(value[k], wpMap, localMap, countRef);
    return value;
  }
  if (typeof value === 'string') return rewriteUrl(value, wpMap, localMap, countRef);
  return value;
}

async function migrate() {
  const wpMap = await fetchFolderMap('raftar-footwear');
  console.log('Cloudinary raftar-footwear assets:', Object.keys(wpMap).length);
  if (!Object.keys(wpMap).length) throw new Error('Empty Cloudinary folder');

  // Collect local files that are actually referenced in the DB
  const db = JSON.stringify([
    ...(await Product.find()).map((p) => ({ images: p.images, colorVariants: p.colorVariants })),
    ...(await Category.find()).map((c) => ({ i: c.image })),
    ...(await Blog.find()).map((b) => ({ i: b.coverImage })),
  ]);
  const refs = new Set([...db.matchAll(/\/uploads\/([\w.-]+\.(?:jpg|png|webp))/g)].map((m) => m[1]));
  console.log('local /uploads files referenced in DB:', refs.size);

  const localMap = {};
  for (const f of refs) {
    if (!fs.existsSync(path.join(UPLOADS_DIR, f))) {
      console.warn(`[migrate] missing local file: ${f}`);
      continue;
    }
    const url = await uploadLocalFile(f);
    localMap[f] = url;
    console.log('  uploaded:', f, '→', url);
  }

  const counts = { n: 0 };
  const walkfn = (v) => walk(v, wpMap, localMap, counts);

  let pc = 0;
  for (const p of await Product.find().lean()) {
    const images = walkfn(p.images);
    const colorVariants = walkfn(p.colorVariants);
    if (JSON.stringify(images) !== JSON.stringify(p.images) || JSON.stringify(colorVariants) !== JSON.stringify(p.colorVariants)) {
      await Product.updateOne({ _id: p._id }, { $set: { images, colorVariants } });
      pc += 1;
    }
  }

  let cc = 0;
  for (const c of await Category.find().lean()) {
    const image = walkfn(c.image);
    if (image !== c.image) {
      await Category.updateOne({ _id: c._id }, { $set: { image } });
      cc += 1;
    }
  }

  let bc = 0;
  for (const b of await Blog.find().lean()) {
    const coverImage = walkfn(b.coverImage);
    if (coverImage !== b.coverImage) {
      await Blog.updateOne({ _id: b._id }, { $set: { coverImage } });
      bc += 1;
    }
  }

  let sc = 0;
  for (const s of await Setting.find().lean()) {
    const value = walkfn(s.value);
    if (JSON.stringify(value) !== JSON.stringify(s.value)) {
      await Setting.updateOne({ _id: s._id }, { $set: { value } });
      sc += 1;
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'mapping.json'),
    JSON.stringify({ wp: wpMap, uploads: localMap }, null, 2)
  );

  console.log('URLs replaced:', counts.n);
  console.log('Updated — products:', pc, '| categories:', cc, '| blogs:', bc, '| settings:', sc);
  console.log('Mapping saved to src/uploads/wp-originals/mapping.json');
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
    await migrate();
    await mongoose.disconnect();
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  }
})();