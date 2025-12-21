import React from 'react';
import MainCarousel from '../../components/HomeCarosel/MainCarosel';
import HomeSectionCarosel from '../../components/HomeSectionCarosel/HomeSectionCarosel';

function HomePage() {
  return (
    <div>
      <MainCarousel />

      <div className='space-y-10 py-10 px-4 lg:px-8'>
        {/* You can add specific categories here based on your products */}
        <HomeSectionCarosel sectionTitle="Featured Products" />
        <HomeSectionCarosel category="Women" sectionTitle="Women's Collection" />
        <HomeSectionCarosel category="Men" sectionTitle="Men's Collection" />
        <HomeSectionCarosel category="Accessories" sectionTitle="Accessories" />
      </div>
    </div>
  );
}

export default HomePage;