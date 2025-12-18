import React from 'react'
import MainCarousel from '../../components/HomeCarosel/MainCarosel';
import HomeSectionCarosel from '../../components/HomeSectionCarosel/HomeSectionCarosel';

function HomePage() {
  return (
    <div>
        <MainCarousel />
        <div>
            <HomeSectionCarosel />
        </div>
    </div>
  )
}

export default HomePage;