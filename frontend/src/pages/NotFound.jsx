import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
      <p className="text-[11px] sm:text-xs tracking-[0.25em] text-gray-400 uppercase">Error 404</p>
      <h1 className="font-display text-6xl sm:text-8xl font-medium text-[#0b4f86] mt-2">404</h1>
      <h2 className="font-display text-2xl sm:text-3xl font-medium text-slate-900 mt-4">
        Page not found
      </h2>
      <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mt-3">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex bg-[#0b4f86] text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a] transition shadow-lg shadow-blue-200"
        >
          Back to Home
        </Link>
        <Link
          to="/shop"
          className="inline-flex border-2 border-[#0b4f86] text-[#0b4f86] px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}