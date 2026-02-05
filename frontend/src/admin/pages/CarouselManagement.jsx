import React, { useEffect, useState } from 'react';
import { adminCarousels } from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

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

const CarouselManagement = () => {
    const [carousels, setCarousels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        link: '',
        order: 0,
    });
    const [image, setImage] = useState(null);

    useEffect(() => {
        loadCarousels();
    }, []);

    const loadCarousels = async () => {
        try {
            const response = await adminCarousels.getAll();
            setCarousels(response.data.carousels);
        } catch (error) {
            toast.error('Failed to load carousels');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            toast.error('Please select an image');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('link', formData.link);
        data.append('order', formData.order);
        data.append('image', image);

        try {
            await adminCarousels.create(data);
            toast.success('Carousel added successfully');
            setShowModal(false);
            resetForm();
            loadCarousels();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add carousel');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carousel?')) {
            try {
                await adminCarousels.delete(id);
                toast.success('Carousel deleted successfully');
                loadCarousels();
            } catch (error) {
                toast.error('Failed to delete carousel');
            }
        }
    };

    const resetForm = () => {
        setFormData({ title: '', link: '', order: 0 });
        setImage(null);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Carousel / Offer Banners</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Carousel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {carousels.map((carousel) => (
                    <div key={carousel._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="relative">
                            <img
                                src={getImageUrl(carousel.image.url)}
                                alt={carousel.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                }}
                            />
                            <button
                                onClick={() => handleDelete(carousel._id)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg">{carousel.title || 'Untitled'}</h3>
                            <p className="text-sm text-gray-600 mt-1">Order: {carousel.order}</p>
                            {carousel.link && (
                                <p className="text-xs text-blue-600 mt-1 truncate">Link: {carousel.link}</p>
                            )}
                            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${carousel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {carousel.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {carousels.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No carousel images yet. Add your first one!
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-4">Add Carousel Image</h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., Summer Sale"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image *</label>
                                    <input
                                        type="file"
                                        required
                                        accept="image/*"
                                        onChange={(e) => setImage(e.target.files[0])}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Recommended: 1920x600px</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                                    >
                                        Add Carousel
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

export default CarouselManagement;
