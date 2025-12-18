import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import MainCarouselData from './MainCaroselData';
import 'react-alice-carousel/lib/alice-carousel.css';



const MainCarousel = () => {

    const items = MainCarouselData.map((item) => (
        <img src={item.image} className='cursor-pointer' role='presentation' alt={item.id} />
));

    return (
        <AliceCarousel
        items={items}
        disableButtonsControls
        autoPlay
        autoPlayInterval={1500}
        infinite
        />
    );
};

export default MainCarousel;
