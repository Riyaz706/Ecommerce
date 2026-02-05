import React from 'react';
import MainCarousel from '../../components/HomeCarosel/MainCarosel';
import HomeSectionCarosel from '../../components/HomeSectionCarosel/HomeSectionCarosel';

function HomePage() {
  return (
    <div>
      <MainCarousel />

      <div className='space-y-10 py-10 px-4 lg:px-8'>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: "🚚", title: "Free Shipping", desc: "On all orders over ₹500" },
            { icon: "🎧", title: "24/7 Support", desc: "Dedicated support team" },
            { icon: "🛡️", title: "Secure Payment", desc: "100% secure checkout" },
            { icon: "↩️", title: "Easy Returns", desc: "30 day return policy" }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition">
              <span className="text-4xl mb-4">{feature.icon}</span>
              <h3 className="font-bold text-lg text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* You can add specific categories here based on your products */}
        <HomeSectionCarosel category="Women" sectionTitle="Women's Collection" />
        <HomeSectionCarosel category="Men" sectionTitle="Men's Collection" />
        <HomeSectionCarosel category="Kids" sectionTitle="Kids Collection" />
        <HomeSectionCarosel category="Beauty" sectionTitle="Beauty Products" />
      </div>
    </div>
  );
}

export default HomePage;