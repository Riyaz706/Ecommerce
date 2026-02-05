import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const HomeSectionCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  if (!product) return null;

  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image';
  const discountedPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;

  return (
    <div
      className='group relative cursor-pointer flex flex-col items-center bg-white rounded-xl shadow-sm hover:shadow-2xl overflow-hidden w-full transition-all duration-300'
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className='aspect-[3/4] w-full relative overflow-hidden'>
        <img
          className='object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-110'
          src={imageUrl}
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
          }}
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className='absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md'>
            -{product.discountPercent}%
          </div>
        )}

        {/* Overlay Actions */}
        <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className='bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-purple-600 hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300'
          >
            Quick Add
          </button>
        </div>
      </div>

      <div className='p-4 w-full'>
        <h3 className='text-md font-semibold text-gray-900 truncate'>{product.name}</h3>
        <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>{product.brand || product.category}</p>

        <div className='flex items-center gap-2'>
          <span className='text-lg font-bold text-gray-900'>₹{discountedPrice?.toLocaleString()}</span>
          {hasDiscount && (
            <span className='text-sm text-gray-400 line-through'>₹{product.price?.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeSectionCard;