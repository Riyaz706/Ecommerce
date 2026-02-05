import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../../../utils/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const response = await products.getOne(id);
            setProduct(response.data.product);

            // Set default selections
            if (response.data.product.sizes?.length > 0) {
                // Initialize with the name property
                setSelectedSize(response.data.product.sizes[0].name);
            }
            if (response.data.product.colors?.length > 0) {
                // Handle both old format (string) and new format (object with name)
                const firstColor = response.data.product.colors[0];
                setSelectedColor(typeof firstColor === 'string' ? firstColor : firstColor.name);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Product not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product.sizes?.length > 0 && !selectedSize) {
            toast.error('Please select a size');
            return;
        }
        if (product.colors?.length > 0 && !selectedColor) {
            toast.error('Please select a color');
            return;
        }

        addToCart(product, quantity, selectedSize, selectedColor);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Product not found</p>
            </div>
        );
    }

    const discountedPrice = product.discountedPrice || product.price;
    const hasDiscount = product.discountPercent > 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 p-8">
                        {/* Images */}
                        <div>
                            {/* Main Image */}
                            <div className="mb-4">
                                <img
                                    src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600'}
                                    alt={product.name}
                                    className="w-full aspect-[4/5] lg:h-[30rem] object-cover rounded-lg"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/600'}
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {product.images?.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image.url}
                                            alt={`${product.name} ${index + 1}`}
                                            onClick={() => setSelectedImage(index)}
                                            className={`h-20 object-cover rounded cursor-pointer border-2 ${selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                                                }`}
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                            {product.brand && (
                                <p className="text-lg text-gray-600 mb-4">by {product.brand}</p>
                            )}

                            {/* Rating */}
                            {product.rating > 0 && (
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({product.numReviews || 0} reviews)
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ₹{discountedPrice.toLocaleString()}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <span className="text-2xl text-gray-500 line-through">
                                                ₹{product.price.toLocaleString()}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                {product.discountPercent}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-2">Description</h3>
                                <p className="text-gray-600">{product.description}</p>
                            </div>

                            {/* Size Selection */}
                            {product.sizes?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Select Size</h3>
                                    <div className="flex gap-2">
                                        {product.sizes.map((sizeObj) => (
                                            <button
                                                key={sizeObj.name}
                                                onClick={() => setSelectedSize(sizeObj.name)}
                                                className={`px-4 py-2 border rounded-lg ${selectedSize === sizeObj.name
                                                    ? 'border-purple-600 bg-purple-50 text-purple-600'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {sizeObj.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection */}
                            {product.colors?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Select Color</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {product.colors.map((color, index) => {
                                            // Handle both old format (string) and new format (object with name)
                                            const colorName = typeof color === 'string' ? color : color.name;
                                            const colorKey = typeof color === 'string' ? color : color.name || index;
                                            return (
                                                <button
                                                    key={colorKey}
                                                    onClick={() => setSelectedColor(colorName)}
                                                    className={`px-4 py-2 border rounded-lg ${selectedColor === colorName
                                                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {colorName}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Quantity</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                        className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        ({product.quantity} available)
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition"
                                    disabled={product.quantity === 0}
                                >
                                    {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition"
                                    disabled={product.quantity === 0}
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-8 border-t pt-6 space-y-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-semibold">Category:</span>
                                    <span>{product.category}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-semibold">Availability:</span>
                                    <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
