// Guard against legacy image references that are broken:
//  - bare base64 without a mime prefix → re-add `data:image/jpeg;base64,`
//    so the browser renders the bytes instead of requesting a bogus URL.
const BARE_BASE64_RE = /^(\/9j\/|iVBORw0KGgo|UklGR|R0lGOD)/;

export function safeImage(url) {
  if (typeof url !== 'string' || !url) return '';
  if (BARE_BASE64_RE.test(url)) return `data:image/jpeg;base64,${url}`;
  return url;
}