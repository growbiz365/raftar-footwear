export function toAbsoluteUrl(src) {
  if (!src) return '';
  if (/^data:/.test(src) || /^https?:\/\//.test(src)) return src;
  if (src.startsWith('/')) return `${window.location.origin}${src}`;
  return src;
}

export function embedImageInText(src) {
  const url = toAbsoluteUrl(src);
  if (!url) return '';
  return `  • Image: ${url}`;
}

export function openWhatsApp(phone, message) {
  const base = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(base, '_blank');
}

export function messageAlreadySent(phone, body) {
  try {
    const sent = JSON.parse(localStorage.getItem('sentWhatAppMessages') || '[]');
    return sent.some((s) => s.phone === phone && s.body === body);
  } catch {
    return false;
  }
}

export function markWhatsAppSent(phone, body) {
  try {
    const sent = JSON.parse(localStorage.getItem('sentWhatAppMessages') || '[]');
    sent.push({ phone, body, t: Date.now() });
    if (sent.length > 200) sent.splice(0, sent.length - 200);
    localStorage.setItem('sentWhatAppMessages', JSON.stringify(sent));
  } catch {
    /* ignore */
  }
}