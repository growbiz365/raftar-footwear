/**
 * Map legacy image URLs to Cloudinary (folder: raftar-footwear).
 * Used at the API response layer so production can serve Cloudinary images
 * even if the database still holds old wp-content / uploads paths.
 * All static imagery was removed — only the logo mapping remains.
 */
const WP_TO_CLOUDINARY = {
  'logo': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771608/raftar-footwear/logo.webp'
};

const UPLOAD_TO_CLOUDINARY = {
  '1788862072147-08f4008a.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869378/raftar-footwear/uploads/ozkppwho652pa4jpmy5e.jpg',
  '1788862104504-e388ee20.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869379/raftar-footwear/uploads/c5rjtuuchjnhk2tpcnpg.jpg',
  '1788857607681-a6b28f2a.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869439/raftar-footwear/uploads/jhusrrcyxhbyexam2nhy.jpg',
  '1788868449849-2c92a8e1.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869442/raftar-footwear/uploads/stxckgxki882obcys8at.jpg'
};

const WP_RE = /https:\/\/raftarfootwear\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([^/\s"')]+)/g;
const UP_RE = /\/uploads\/([\w.-]+\.(?:jpg|png|webp))/g;

// Some older uploads stored the image as a data URL whose
// `data:image/jpeg;base64,` prefix was lost — leaving a bare base64 string
// that the browser tries to request as a relative URL. Restore the prefix
// for common image signatures so these render correctly again.
const BARE_BASE64_RE = /^(\/9j\/|iVBORw0KGgo|UklGR|R0lGOD)/;

function cloudifyString(str) {
  if (typeof str !== 'string') return str;
  if (BARE_BASE64_RE.test(str)) {
    return `data:image/jpeg;base64,${str}`;
  }
  if (str.includes('wp-content')) {
    str = str.replace(WP_RE, (full, file) => {
      const base = file.replace(/\.[^.]+$/, '');
      return WP_TO_CLOUDINARY[base] || full;
    });
  }
  if (str.includes('/uploads/')) {
    str = str.replace(UP_RE, (full, file) => UPLOAD_TO_CLOUDINARY[file] || full);
  }
  return str;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function cloudify(value) {
  if (Array.isArray(value)) return value.map(cloudify);
  if (value instanceof Date || value instanceof RegExp || Buffer.isBuffer(value)) return value;
  if (value && typeof value === 'object') {
    if (typeof value.toObject === 'function') {
      return cloudify(value.toObject({ depopulate: true }));
    }
    if (isPlainObject(value)) {
      for (const k of Object.keys(value)) value[k] = cloudify(value[k]);
      return value;
    }
    return value;
  }
  return cloudifyString(value);
}

module.exports = { cloudify, WP_TO_CLOUDINARY, UPLOAD_TO_CLOUDINARY };