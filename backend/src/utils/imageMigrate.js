/**
 * Map legacy image URLs to Cloudinary (folder: raftar-footwear).
 * Used at the API response layer so production can serve Cloudinary images
 * even if the database still holds old wp-content / uploads paths.
 */
const WP_TO_CLOUDINARY = {
  'logo': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771608/raftar-footwear/logo.webp',
  'hero-image-final': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771606/raftar-footwear/hero-image-final.png',
  'factory-image-e1785482188113': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771605/raftar-footwear/factory-image-e1785482188113.webp',
  'article-019-brown': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771590/raftar-footwear/article-019-brown.webp',
  'article-815': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771596/raftar-footwear/article-815.webp',
  'article-05': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771593/raftar-footwear/article-05.webp',
  'article-019-black': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771588/raftar-footwear/article-019-black.webp',
  'article-017': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771587/raftar-footwear/article-017.webp',
  'article-011': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771586/raftar-footwear/article-011.webp',
  'article-025': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771591/raftar-footwear/article-025.webp',
  'article-291': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771595/raftar-footwear/article-291.webp',
  'article-027': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771592/raftar-footwear/article-027.webp',
  'article-woven': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771597/raftar-footwear/article-woven.webp'
};

const UPLOAD_TO_CLOUDINARY = {
  '1788862072147-08f4008a.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869378/raftar-footwear/uploads/ozkppwho652pa4jpmy5e.jpg',
  '1788862104504-e388ee20.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869379/raftar-footwear/uploads/c5rjtuuchjnhk2tpcnpg.jpg',
  '1788857607681-a6b28f2a.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869439/raftar-footwear/uploads/jhusrrcyxhbyexam2nhy.jpg',
  '1788868449849-2c92a8e1.jpg': 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788869442/raftar-footwear/uploads/stxckgxki882obcys8at.jpg'
};

const WP_RE = /https:\/\/raftarfootwear\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([^/\s"')]+)/g;
const UP_RE = /\/uploads\/([\w.-]+\.(?:jpg|png|webp))/g;

function cloudifyString(str) {
  if (typeof str !== 'string') return str;
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

function cloudify(value) {
  if (Array.isArray(value)) return value.map(cloudify);
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) value[k] = cloudify(value[k]);
    return value;
  }
  return cloudifyString(value);
}

module.exports = { cloudify, WP_TO_CLOUDINARY, UPLOAD_TO_CLOUDINARY };