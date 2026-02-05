import React, { useEffect, useState, useRef } from 'react';
import AliceCarousel from 'react-alice-carousel';
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard';
import { Button } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { products } from '../../../utils/api';

const HomeSectionCarosel = ({ category, sectionTitle }) => {
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef(null);

    const responsive = {
        0: { items: 1.5 },
        560: { items: 2 },
        720: { items: 3 },
        1024: { items: 4 },
        1280: { items: 5.5 },
    };

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        loadProducts();
    }, [category]);

    const loadProducts = async () => {
        try {
            // Increase limit significantly to show "upto 300 products" style, or just a decent amount
            const params = { limit: 20 };

            if (category) {
                params.category = category;
            }

            if (sectionTitle === "Featured Products") {
                params.sort = 'random';
            }

            const response = await products.getAll(params);
            setProductList(response.data.products);
        } catch (error) {
            console.error('Error loading products:', error);
            setProductList([]);
        } finally {
            setLoading(false);
        }
    };

    const slidePrev = () => {
        if (carouselRef.current) {
            carouselRef.current.slidePrev();
        }
    };

    const slideNext = () => {
        if (carouselRef.current) {
            carouselRef.current.slideNext();
        }
    };

    const syncActiveIndex = ({ item }) => setActiveIndex(item);

    const isFeatured = sectionTitle === "Featured Products";

    if (loading) {
        return (
            <div className='relative px-4 lg:px-8 py-8'>
                <div className='flex items-center justify-center h-64'>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (productList.length === 0) {
        return (
            <div className='relative px-4 lg:px-8 py-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>{sectionTitle || category || 'Products'}</h2>
                <div className='flex items-center justify-center h-64 bg-gray-50 rounded-lg'>
                    <p className='text-gray-500'>No products available in this category</p>
                </div>
            </div>
        );
    }

    const items = productList.map((product) => (
        <HomeSectionCard key={product._id} product={product} />
    ));

    return (
        <div className='relative px-4 lg:px-8 py-8'>
            {sectionTitle && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>{sectionTitle}</h2>
                    <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm hidden sm:block">
                        View All →
                    </button>
                </div>
            )}
            <div className='relative px-5'>
                <AliceCarousel
                    ref={carouselRef}
                    items={items}
                    disableButtonsControls
                    disableDotsControls
                    responsive={responsive}
                    onSlideChanged={syncActiveIndex}
                    autoPlay={isFeatured}
                    autoPlayInterval={2000}
                    infinite={isFeatured}
                />

                {productList.length > 0 && (
                    <>
                        {activeIndex !== 0 && <Button
                            onClick={slidePrev}
                            variant='contained'
                            className="z-50 bg-white hidden sm:block"
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '0',
                                transform: 'translateY(-50%)',
                                bgcolor: "white",
                                border: "1px solid #e5e7eb",
                                minWidth: '40px',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                '&:hover': { bgcolor: '#f3f4f6' }
                            }}
                            aria-label='previous'
                        >
                            <KeyboardArrowLeftIcon sx={{ color: "black" }} />
                        </Button>}

                        {activeIndex !== items.length - Math.floor(responsive[1024].items) && <Button
                            onClick={slideNext}
                            variant='contained'
                            className="z-50 bg-white hidden sm:block"
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                right: '0',
                                transform: 'translateY(-50%)',
                                bgcolor: "white",
                                border: "1px solid #e5e7eb",
                                minWidth: '40px',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                '&:hover': { bgcolor: '#f3f4f6' }
                            }}
                            aria-label='next'
                        >
                            <KeyboardArrowRightIcon sx={{ color: "black" }} />
                        </Button>}
                    </>
                )}
            </div>
        </div>
    );
};
export default HomeSectionCarosel;