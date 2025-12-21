import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { products } from '../../../utils/api';
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard';

const ProductListing = () => {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filters
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        loadProducts();
    }, [category, searchParams]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = {};

            if (category) params.category = category;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (sortBy) params.sort = sortBy;

            const response = await products.getAll(params);
            setProductList(response.data.products);
            setTotalProducts(response.data.total || response.data.products.length);
        } catch (error) {
            console.error('Error loading products:', error);
            setProductList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = () => {
        const params = {};
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sortBy) params.sort = sortBy;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSortBy('');
        setSearchParams({});
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {category ? `${category}'s Collection` : 'All Products'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">{totalProducts} products</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                    {/* Filters Sidebar */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h3 className="text-lg font-semibold mb-4">Filters</h3>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price Range
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        placeholder="Min Price"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Price"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Default</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name_asc">Name: A to Z</option>
                                    <option value="name_desc">Name: Z to A</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={handleFilterChange}
                                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {productList.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <p className="text-gray-500 text-lg">No products found</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productList.map((product) => (
                                    <HomeSectionCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
