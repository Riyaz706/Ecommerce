import React, { useEffect, useState } from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { carousels } from '../../../utils/api';
import MainCarouselData from './MainCaroselData';

const MainCarousel = () => {
    const [carouselData, setCarouselData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCarousels();
    }, []);

    const loadCarousels = async () => {
        try {
            // Add timestamp to bypass cache
            const response = await carousels.getAll();
            if (response.data && response.data.carousels && response.data.carousels.length > 0) {
                setCarouselData(response.data.carousels);
            } else {
                console.warn('API returned empty carousel data, using fallback');
                setCarouselData(MainCarouselData);
            }
        } catch (error) {
            console.error('Error loading carousels:', error);
            // Fall back to static data if API fails
            setCarouselData(MainCarouselData);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Since we have a fallback, this should theoretically never happen unless MainCarouselData is also empty
    if (carouselData.length === 0) {
        return null;
    }

    const items = carouselData.map((item) => (
        <div key={item._id || item.id} className="relative w-full h-[20rem] sm:h-[25rem] md:h-[30rem] lg:h-[34rem]">
            <img
                src={item.image.url || item.image}
                className='w-full h-full object-cover'
                role='presentation'
                alt={item.title || 'Carousel image'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center text-center text-white px-4">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                    {item.title || 'New Season Arrivals'}
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl mb-8 font-light drop-shadow-md">
                    Check out the latest trends
                </p>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-300 shadow-lg transform hover:scale-105">
                    Shop Now
                </button>
            </div>
        </div>
    ));

    return (
        <div className="relative z-10">
            <AliceCarousel
                items={items}
                disableButtonsControls
                autoPlay
                autoPlayInterval={2000}
                infinite
                mouseTracking
            />
        </div>
    );
};

export default MainCarousel;
