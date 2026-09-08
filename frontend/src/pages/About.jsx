import { Link } from 'react-router-dom';

const IMG = {
  factory: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771605/raftar-footwear/factory-image-e1785482188113.webp',
  hero: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771606/raftar-footwear/hero-image-final.png',
};

export default function About() {
  return (
    <div>
      <section className="bg-[#0b4f86] text-white py-16 sm:py-20 px-4 text-center">
        <p className="text-xs tracking-widest uppercase opacity-80 mb-2">About Us</p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium mb-4">About Raftar Footwear Enterprises</h1>
        <p className="max-w-2xl mx-auto text-white/90 text-sm sm:text-base">
          Trusted manufacturer of plastic chappal and footwear in Peshawar.
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <img src={IMG.factory} alt="Factory" className="rounded-xl w-full object-cover aspect-[4/3]" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-medium mb-4">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Raftar Footwear Enterprises is a trusted name in Peshawar, specializing in high-quality plastic chappal and footwear.
              With modern manufacturing facilities, skilled craftsmanship and strict quality control, we deliver comfortable, durable and stylish footwear.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              We cater to wholesalers, distributors and retailers across Pakistan with bulk manufacturing and timely delivery.
              We manufacture plastic chappal and footwear and deal in all kinds of PCU and PVC standard products designed for comfort, durability and everyday use.
            </p>
            <Link to="/shop" className="inline-block bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800">View Products</Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2 text-[#0b4f86]">Our Mission</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To manufacture high-quality PCU and PVC footwear that ensures comfort, durability and value while maintaining strict quality standards.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2 text-[#0b4f86]">Our Vision</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To become a leading footwear manufacturer in Pakistan, recognized for innovation, quality and reliability.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2 text-[#0b4f86]">Our Values</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Quality materials, modern manufacturing, customer satisfaction, honest business and continuous improvement.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-medium text-center mb-10">Why Choose Raftar Footwear?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'PCU & PVC Products', d: 'Premium-grade materials for long-lasting and comfortable footwear.' },
            { t: 'Modern Manufacturing', d: 'Advanced machinery and skilled teams ensure quality production.' },
            { t: 'Bulk Order Support', d: 'Reliable supply support for wholesalers, distributors and retailers.' },
            { t: 'Wide Product Range', d: 'Footwear for men, women, children and everyday use.' },
          ].map((x, i) => (
            <div key={i} className="border rounded-xl p-5 text-center">
              <h3 className="font-medium mb-2">{x.t}</h3>
              <p className="text-gray-500 text-sm">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0b4f86] text-white py-12 text-center px-4">
        <h2 className="text-2xl font-medium mb-3">Looking for Bulk Footwear Orders?</h2>
        <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm">
          Contact Raftar Footwear Enterprises for wholesale rates, dealership inquiries and bulk manufacturing support.
        </p>
        <Link to="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold">Contact Us</Link>
      </section>
    </div>
  );
}
