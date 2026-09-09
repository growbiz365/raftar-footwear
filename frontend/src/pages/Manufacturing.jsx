import { Link } from 'react-router-dom';

const steps = [
  { n: '01', t: 'Raw Material Selection', d: 'Premium PCU and PVC materials are selected for production.' },
  { n: '02', t: 'Design & Mold Preparation', d: 'Accurate product designs and precision molds are prepared.' },
  { n: '03', t: 'Molding & Production', d: 'Advanced machinery shapes each footwear product efficiently.' },
  { n: '04', t: 'Finishing & Trimming', d: 'Edges are trimmed and surfaces are cleaned for a smooth finish.' },
  { n: '05', t: 'Quality Inspection', d: 'Each pair is checked carefully for strength, finish and quality.' },
  { n: '06', t: 'Packing & Dispatch', d: 'Products are securely packed and dispatched on schedule.' },
];

export default function Manufacturing() {
  return (
    <div>
      <section className="bg-[#0b4f86] text-white py-16 sm:py-20 px-4 text-center">
        <p className="text-xs tracking-widest uppercase opacity-80 mb-2">Manufacturing</p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium mb-4">Modern Production Facility</h1>
        <p className="max-w-2xl mx-auto text-white/90 text-sm">
          Efficient production and strict quality control for PCU &amp; PVC footwear in Peshawar.
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h2 className="text-2xl font-medium mb-4">Our Manufacturing Process</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Every product follows a carefully controlled manufacturing process to ensure quality, durability and a reliable finish.
              Raftar Footwear Enterprises uses modern machinery and skilled teams to produce plastic chappals and slides for men, women and children.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We support bulk orders for wholesalers, dealers and distributors across Pakistan with timely delivery.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="border rounded-xl p-6 hover:shadow-md transition">
              <span className="text-3xl font-bold text-[#0b4f86]">{s.n}</span>
              <h3 className="font-medium mt-2 mb-2">{s.t}</h3>
              <p className="text-gray-500 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-12 text-center px-4">
        <h2 className="text-2xl font-medium mb-3">Need Bulk Manufacturing or Custom Orders?</h2>
        <p className="text-gray-600 text-sm mb-6 max-w-lg mx-auto">
          Contact Raftar Footwear Enterprises for wholesale rates, bulk production support and custom order inquiries.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/contact" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold">
            Contact Us
          </Link>
          <Link to="/shop" className="border border-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-black hover:text-white transition">
            View Products
          </Link>
        </div>
      </section>
    </div>
  );
}
