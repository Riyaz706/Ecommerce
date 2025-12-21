import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const HomeSectionCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  if (!product) return null;

  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image';
  const discountedPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price; // Better check

  return (
    <div
      className='cursor-pointer flex flex-col items-center bg-white rounded-lg shadow-lg overflow-hidden w-[15rem] mx-3 hover:shadow-xl transition-shadow duration-300'
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className='h-[20rem] w-full relative'> {/* Increased height for better visibility */}
        <img
          className='object-cover object-top w-full h-full'
          src={imageUrl}
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
          }}
        />
        {hasDiscount && (
          <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold'>
            {product.discountPercent}% OFF
          </div>
        )}
      </div>

      <div className='p-4 w-full'>
        <h3 className='text-lg font-medium text-gray-900 truncate'>{product.name}</h3>
        <p className='mt-1 text-sm text-gray-500 truncate'>{product.brand || product.category}</p>

        <div className='mt-2 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-lg font-bold text-gray-900'>₹{discountedPrice?.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className='text-sm text-gray-500 line-through'>₹{product.price?.toLocaleString()}</span>
                <span className='text-sm text-green-600 font-semibold'>{product.discountPercent}% off</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className='mt-3 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors duration-300 font-medium'
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default HomeSectionCard;