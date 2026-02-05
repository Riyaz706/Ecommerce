import React, { useEffect, useState, Fragment } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { products } from '../../../utils/api';
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard';

const ProductListing = () => {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Initialize state from URL params
    const [selectedPriceRange, setSelectedPriceRange] = useState(
        searchParams.get('priceRange') || 'all'
    );
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');

    const priceRanges = [
        { id: 'all', label: 'All Prices', min: '', max: '' },
        { id: 'under_500', label: 'Under ₹500', min: '0', max: '500' },
        { id: '500_1000', label: '₹500 - ₹1,000', min: '500', max: '1000' },
        { id: '1000_5000', label: '₹1,000 - ₹5,000', min: '1000', max: '5000' },
        { id: '5000_10000', label: '₹5,000 - ₹10,000', min: '5000', max: '10000' },
        { id: 'above_10000', label: 'Over ₹10,000', min: '10000', max: '' },
    ];

    useEffect(() => {
        // Sync local state with URL if URL changes (e.g. back button)
        const rangeFromUrl = searchParams.get('priceRange') || 'all';
        const sortFromUrl = searchParams.get('sort') || '';

        setSelectedPriceRange(rangeFromUrl);
        setSortBy(sortFromUrl);

        loadProducts();
    }, [category, searchParams]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = {};

            // Get values directly from searchParams to ensure consistency
            const rangeId = searchParams.get('priceRange');
            const sort = searchParams.get('sort');

            if (category) params.category = category;

            if (rangeId && rangeId !== 'all') {
                const range = priceRanges.find(r => r.id === rangeId);
                if (range) {
                    if (range.min) params.minPrice = range.min;
                    if (range.max) params.maxPrice = range.max;
                }
            }

            if (sort) params.sort = sort;

            // Use the correct API call
            // If we have a category, the backend route /products/category/:category might not support params unless we updated it.
            // Assumption: Backend logic updated to support filters on category route, or we use getAll with category param.

            let response;
            if (category) {
                // Determine if we use specific endpoint or generic getAll
                // Using getAll ensures unified filtering logic if backend supports it
                // APIUtils.products.getByCategory usually hits /products/category/:id
                // Let's use getByCategory since that's likely what backend expects for specific category listing
                // but pass all params
                response = await products.getByCategory(category, params);
            } else {
                response = await products.getAll(params);
            }

            setProductList(response.data.products);
            setTotalProducts(response.data.total || response.data.products.length);
        } catch (error) {
            console.error('Error loading products:', error);
            setProductList([]);
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newRangeId, newSort) => {
        const params = {};
        if (newRangeId && newRangeId !== 'all') params.priceRange = newRangeId;
        if (newSort) params.sort = newSort;
        setSearchParams(params);
    };

    const handlePriceChange = (rangeId) => {
        setSelectedPriceRange(rangeId);
        updateFilters(rangeId, sortBy);
    };

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        updateFilters(selectedPriceRange, newSort);
    };

    const clearFilters = () => {
        setSelectedPriceRange('all');
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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {category ? `${category}'s Collection` : 'All Products'}
                    </h1>
                    <p className="mt-2 text-gray-500 text-lg">
                        Explore our latest styles and exclusive collections ({totalProducts} items)
                    </p>
                </div>
            </div>

            {/* Mobile Filter Dialog */}
            <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                                <div className="flex items-center justify-between px-4">
                                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                    <button
                                        type="button"
                                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                                        onClick={() => setMobileFiltersOpen(false)}
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>

                                {/* Mobile Filters Form */}
                                <form className="mt-4 border-t border-gray-200 px-4">
                                    {/* Sort By Mobile */}
                                    <div className="py-6 border-b border-gray-200">
                                        <span className="font-medium text-gray-900 block mb-3">Sort By</span>
                                        <select
                                            value={sortBy}
                                            onChange={handleSortChange}
                                            className="w-full bg-gray-50 border-0 rounded-lg py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm sm:leading-6"
                                        >
                                            <option value="">Featured</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                            <option value="name_asc">Name: A to Z</option>
                                            <option value="name_desc">Name: Z to A</option>
                                        </select>
                                    </div>

                                    <div className="pt-6">
                                        <span className="font-medium text-gray-900 block mb-3">Check Price</span>
                                        <div className="space-y-4">
                                            {priceRanges.map((range) => (
                                                <div key={range.id} className="flex items-center">
                                                    <input
                                                        id={`mobile-price-${range.id}`}
                                                        name="mobile-price-range"
                                                        type="radio"
                                                        checked={selectedPriceRange === range.id}
                                                        onChange={() => handlePriceChange(range.id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <label
                                                        htmlFor={`mobile-price-${range.id}`}
                                                        className="ml-3 min-w-0 flex-1 text-gray-500"
                                                    >
                                                        {range.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                clearFilters();
                                                setMobileFiltersOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 lg:hidden mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Filters</h1>
                    <button
                        type="button"
                        className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setMobileFiltersOpen(true)}
                    >
                        <span className="sr-only">Filters</span>
                        <FilterListIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="lg:grid lg:grid-cols-4 lg:gap-12">
                    {/* Filters Sidebar (Desktop) */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            <div className="flex items-center justify-between pb-4 border-b">
                                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="w-full bg-gray-50 border-0 rounded-lg py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-purple-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="">Featured</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name_asc">Name: A to Z</option>
                                    <option value="name_desc">Name: Z to A</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                                    Price Range
                                </label>
                                <div className="space-y-3">
                                    {priceRanges.map((range) => (
                                        <div key={range.id} className="flex items-center group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    id={`price-${range.id}`}
                                                    name="price-range"
                                                    type="radio"
                                                    checked={selectedPriceRange === range.id}
                                                    onChange={() => handlePriceChange(range.id)}
                                                    className="h-5 w-5 border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                                                />
                                            </div>
                                            <label
                                                htmlFor={`price-${range.id}`}
                                                className="ml-3 text-sm text-gray-600 group-hover:text-purple-600 transition-colors cursor-pointer"
                                            >
                                                {range.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="lg:col-span-3 mt-8 lg:mt-0">
                        {productList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <span className="text-4xl mb-4">🔍</span>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition shadow-lg"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-8">
                                {productList.map((product) => (
                                    <HomeSectionCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductListing;
