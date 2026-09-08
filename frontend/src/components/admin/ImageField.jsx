import { useState, useRef } from 'react';
import { Upload, Link2, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

/**
 * Image picker: paste URL or upload file.
 * onChange(url: string)
 */
export default function ImageField({ label, value, onChange, help }) {
  const [mode, setMode] = useState('url'); // 'url' | 'file'
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/admin/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.data?.url || data?.url;
      if (url) onChange(url);
      else throw new Error('No URL returned');
    } catch (e) {
      // Fallback: embed as a base64 data URL so the image persists across
      // sessions and works on the storefront (blob: URLs break everywhere).
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        onChange(dataUrl);
        setErr('Uploaded as base64 (upload endpoint offline). Consider keeping image files small.');
      } catch {
        setErr(e.response?.data?.message || e.message || 'Upload failed');
      }
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      {help && <p className="text-xs text-gray-400">{help}</p>}

      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            mode === 'url' ? 'bg-[#0b4f86] text-white border-[#0b4f86]' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <Link2 size={14} /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            mode === 'file' ? 'bg-[#0b4f86] text-white border-[#0b4f86]' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <Upload size={14} /> Upload file
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20 focus:border-[#0b4f86]"
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#0b4f86]/40 transition cursor-pointer bg-gray-50"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadFile(e.target.files?.[0])}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin" /> Uploading…
            </div>
          ) : (
            <>
              <Upload size={22} className="mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-600">Click to choose image</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · auto-compressed</p>
            </>
          )}
        </div>
      )}

      {err && <p className="text-xs text-amber-600">{err}</p>}

      {value && (
        <div className="relative inline-block mt-1">
          <img
            src={value}
            alt=""
            className="h-28 w-auto max-w-full object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.style.opacity = '0.4';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-white border shadow rounded-full p-1 text-gray-500 hover:text-rose-600"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
