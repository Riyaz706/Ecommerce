import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, loading]);

    // Add item to cart
    const addToCart = (product, quantity = 1, size = null, color = null) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.productId === product._id &&
                    item.size === size &&
                    item.color === color
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                const updated = [...prevItems];
                updated[existingItemIndex].quantity += quantity;
                // toast.success('Cart updated!'); // Removed popup as requested
                return updated;
            } else {
                // Add new item
                // toast.success('Added to cart!'); // Removed popup as requested
                return [
                    ...prevItems,
                    {
                        productId: product._id,
                        name: product.name,
                        price: product.price,
                        discountedPrice: product.discountedPrice || product.price,
                        image: product.images?.[0]?.url || '',
                        quantity,
                        size,
                        color,
                        brand: product.brand,
                        category: product.category,
                    }
                ];
            }
        });
    };

    // Remove item from cart
    const removeFromCart = (productId, size = null, color = null) => {
        setCartItems(prevItems =>
            prevItems.filter(
                item => !(item.productId === productId &&
                    item.size === size &&
                    item.color === color)
            )
        );
        toast.info('Removed from cart');
    };

    // Update item quantity
    const updateQuantity = (productId, quantity, size = null, color = null) => {
        if (quantity < 1) {
            removeFromCart(productId, size, color);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId &&
                    item.size === size &&
                    item.color === color
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
        toast.info('Cart cleared');
    };

    // Get cart item count
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Calculate subtotal
    const getSubtotal = () => {
        return cartItems.reduce(
            (total, item) => total + (item.discountedPrice * item.quantity),
            0
        );
    };

    // Calculate delivery charges
    const getDeliveryCharges = () => {
        const subtotal = getSubtotal();
        return subtotal >= 500 ? 0 : 50;
    };

    // Calculate total
    const getTotal = () => {
        return getSubtotal() + getDeliveryCharges();
    };

    // Check if product is in cart
    const isInCart = (productId, size = null, color = null) => {
        return cartItems.some(
            item => item.productId === productId &&
                item.size === size &&
                item.color === color
        );
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getSubtotal,
        getDeliveryCharges,
        getTotal,
        isInCart,
        loading,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
