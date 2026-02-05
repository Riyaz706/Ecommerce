import React, { useEffect, useState } from 'react';
import { adminProducts } from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Helper function to get image URL
const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL (Cloudinary or external), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    // If it's a relative path starting with /, return as is (proxy will handle it)
    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }
    
    // Otherwise, prepend /uploads
    return `/uploads/${imageUrl}`;
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPercent: '',
        category: '',
        brand: '',
    });
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [images, setImages] = useState([]);

    // Pagination & Filter state
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadProducts();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [page, search, filterCategory]); // Reload when these change

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await adminProducts.getAll({
                page,
                limit,
                search,
                category: filterCategory
            });
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.pages);
            setTotalProducts(response.data.pagination.total);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Calculate total quantity from sizes and colors
        const totalSizeQuantity = sizes.reduce((sum, size) => sum + (parseInt(size.quantity) || 0), 0);
        const totalColorQuantity = colors.reduce((sum, color) => sum + (parseInt(color.quantity) || 0), 0);
        const totalQuantity = Math.max(totalSizeQuantity, totalColorQuantity);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        // Append sizes and colors as JSON
        data.append('sizes', JSON.stringify(sizes));
        data.append('colors', JSON.stringify(colors));
        data.append('quantity', totalQuantity);

        // Append images if any are selected
        if (images && images.length > 0) {
            Array.from(images).forEach(file => {
                data.append('images', file);
            });
        }

        try {
            if (editingProduct) {
                await adminProducts.update(editingProduct._id, data);
                toast.success('Product updated successfully');
            } else {
                await adminProducts.create(data);
                toast.success('Product created successfully');
            }

            setShowModal(false);
            resetForm();
            loadProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminProducts.delete(id);
                toast.success('Product deleted successfully');
                loadProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            discountPercent: product.discountPercent || '',
            category: product.category,
            brand: product.brand || '',
        });
        // Load sizes and colors
        setSizes(product.sizes && product.sizes.length > 0 ? product.sizes : []);
        // Handle both old format (array of strings) and new format (array of objects)
        if (product.colors && product.colors.length > 0) {
            const colorsData = product.colors.map(color => 
                typeof color === 'string' ? { name: color, quantity: 0 } : color
            );
            setColors(colorsData);
        } else {
            setColors([]);
        }
        setImages([]); // Reset images when editing
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            discountPercent: '',
            category: '',
            brand: '',
        });
        setSizes([]);
        setColors([]);
        setImages([]);
        setEditingProduct(null);
    };

    const addSize = () => {
        setSizes([...sizes, { name: '', quantity: 0 }]);
    };

    const removeSize = (index) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const updateSize = (index, field, value) => {
        const updatedSizes = [...sizes];
        updatedSizes[index] = { ...updatedSizes[index], [field]: value };
        setSizes(updatedSizes);
    };

    const addColor = () => {
        setColors([...colors, { name: '', quantity: 0 }]);
    };

    const removeColor = (index) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const updateColor = (index, field, value) => {
        const updatedColors = [...colors];
        updatedColors[index] = { ...updatedColors[index], [field]: value };
        setColors(updatedColors);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Products</h2>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
                <div className="w-[200px]">
                    <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        <option value="">All Categories</option>
                        <option value="Women">Women</option>
                        <option value="Men">Men</option>
                        <option value="Kids">Kids</option>
                        <option value="Beauty">Beauty</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Image</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Category</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Price</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Stock</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        {product.images?.[0]?.url ? (
                                            <img 
                                                src={getImageUrl(product.images[0].url)} 
                                                alt={product.name} 
                                                className="h-12 w-12 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 font-medium">{product.name}</td>
                                    <td className="py-3 px-4">{product.category}</td>
                                    <td className="py-3 px-4">₹{product.price.toLocaleString()}</td>
                                    <td className="py-3 px-4">{product.quantity}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({totalProducts} results)
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-4">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        rows="3"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Discount %</label>
                                        <input
                                            type="number"
                                            value={formData.discountPercent}
                                            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Women">Women</option>
                                            <option value="Men">Men</option>
                                            <option value="Kids">Kids</option>
                                            <option value="Beauty">Beauty</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Brand</label>
                                        <input
                                            type="text"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Sizes with Quantities */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium">Sizes & Quantities</label>
                                        <button
                                            type="button"
                                            onClick={addSize}
                                            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Add Size
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {sizes.map((size, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Size (e.g., S, M, L)"
                                                    value={size.name}
                                                    onChange={(e) => updateSize(index, 'name', e.target.value)}
                                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Quantity"
                                                    min="0"
                                                    value={size.quantity}
                                                    onChange={(e) => updateSize(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSize(index)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {sizes.length === 0 && (
                                            <p className="text-sm text-gray-500">No sizes added. Click "Add Size" to add sizes with quantities.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Colors with Quantities */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium">Colors & Quantities</label>
                                        <button
                                            type="button"
                                            onClick={addColor}
                                            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Add Color
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {colors.map((color, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Color (e.g., Red, Blue)"
                                                    value={color.name}
                                                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Quantity"
                                                    min="0"
                                                    value={color.quantity}
                                                    onChange={(e) => updateColor(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeColor(index)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {colors.length === 0 && (
                                            <p className="text-sm text-gray-500">No colors added. Click "Add Color" to add colors with quantities.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setImages(e.target.files)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                                    >
                                        {editingProduct ? 'Update' : 'Create'} Product
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
