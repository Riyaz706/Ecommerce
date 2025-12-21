import React, { useEffect, useState } from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { carousels } from '../../../utils/api';

const MainCarousel = () => {
    const [carouselData, setCarouselData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCarousels();
    }, []);

    const loadCarousels = async () => {
        try {
            const response = await carousels.getAll();
            setCarouselData(response.data.carousels);
        } catch (error) {
            console.error('Error loading carousels:', error);
            // Fall back to empty array if API fails
            setCarouselData([]);
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

    if (carouselData.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100">
                <p className="text-gray-500">No carousel images available</p>
            </div>
        );
    }

    const items = carouselData.map((item) => (
        <img
            key={item._id}
            src={item.image.url}
            className='cursor-pointer w-full'
            role='presentation'
            alt={item.title || 'Carousel image'}
        />
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
