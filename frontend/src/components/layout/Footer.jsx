import { Link } from 'react-router-dom';
import { useSettings } from '../../store/settingsContext';
import { DEFAULT_LOGO } from '../../data/catalog';

const PHONE = '03338788861';

export default function Footer() {
  const { settings } = useSettings();
  const logo =
    typeof settings?.logo === 'string' && settings.logo.trim()
      ? settings.logo.trim()
      : DEFAULT_LOGO;

  return (
    <footer className="bg-slate-900 text-white pt-10 sm:pt-16 pb-24 md:pb-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="mb-4">
              <Link to="/" className="inline-block">
                <img
                  src={logo}
                  alt="Raftar Footwear"
                  className="h-12 sm:h-14 w-auto object-contain max-w-[220px]"
                  loading="lazy"
                />
              </Link>
              <p className="text-[10px] tracking-[0.25em] text-slate-500 mt-2 uppercase">
                Enterprises · Peshawar
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Manufacturer of plastic chappal and footwear. Deals in all kinds of PCU & PVC standard products. Wholesale packs 1, 6 & 12 pairs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-white">Shop</Link></li>
              <li><Link to="/collections/raftar" className="hover:text-white">Raftar Footwear</Link></li>
              <li><Link to="/collections/superstar" className="hover:text-white">Superstar Footwear</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/manufacturing" className="hover:text-white">Manufacturing</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Our Products</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/collections/men" className="hover:text-white">Men's Footwear</Link></li>
              <li><Link to="/collections/women" className="hover:text-white">Women's Footwear</Link></li>
              <li><Link to="/collections/children" className="hover:text-white">Children's Footwear</Link></li>
              <li><Link to="/collections/slides" className="hover:text-white">Slides</Link></li>
              <li><Link to="/collections/chappals" className="hover:text-white">Chappals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Contact Info</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📍 Plot # 70B, Near Masjid Qasim, Small Industrial Estate, Kohat Road, Peshawar.</li>
              <li>
                <a href={`tel:${PHONE}`} className="hover:text-white font-medium text-white">
                  ☎ {PHONE}
                </a>
              </li>
              <li>
                <a href="https://wa.me/923338788861" target="_blank" rel="noreferrer" className="hover:text-white">
                  💬 WhatsApp Order
                </a>
              </li>
              <li>
                <a href="mailto:info@raftarfootwear.com" className="hover:text-white">
                  ✉ info@raftarfootwear.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 Raftar Footwear Enterprises. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
