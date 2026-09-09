import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <section className="bg-[#0b4f86] text-white py-16 sm:py-20 px-4 text-center">
        <p className="text-xs tracking-widest uppercase opacity-80 mb-2">Contact Us</p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium mb-4">Get in Touch</h1>
        <p className="max-w-xl mx-auto text-white/90 text-sm">
          Contact Raftar Footwear Enterprises for wholesale rates, product inquiries, dealership opportunities and bulk manufacturing support.
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">📍 Address</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Plot # 70B, Near Masjid Qasim, Small Industrial Estate,<br />
                Kohat Road, Peshawar, Pakistan.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">☎ Phone</h3>
              <p className="text-gray-600 text-sm space-y-1">
                <a href="tel:03338788861" className="block hover:text-[#0b4f86] font-medium">03338788861</a>
                <a href="https://wa.me/923338788861" target="_blank" rel="noreferrer" className="block hover:text-[#0b4f86]">WhatsApp: 03338788861</a>
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">✉ Email</h3>
              <a href="mailto:info@raftarfootwear.com" className="text-gray-600 text-sm hover:text-[#0b4f86]">info@raftarfootwear.com</a>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">🌐 Website</h3>
              <a href="https://raftarfootwear.com" target="_blank" rel="noreferrer" className="text-gray-600 text-sm hover:text-[#0b4f86]">raftarfootwear.com</a>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-medium mb-4">Send a Message</h2>
            {sent ? (
              <p className="text-emerald-600 text-sm">Thank you! We will contact you soon regarding your inquiry.</p>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <input required placeholder="Your Name" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0b4f86]" />
                <input required type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0b4f86]" />
                <input placeholder="Phone" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0b4f86]" />
                <select className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0b4f86]">
                  <option>Wholesale / Bulk Order</option>
                  <option>Dealership Inquiry</option>
                  <option>Product Information</option>
                  <option>Custom Manufacturing</option>
                  <option>Other</option>
                </select>
                <textarea required rows={4} placeholder="Your message" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0b4f86]" />
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
