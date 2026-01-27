import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { OfferCard } from '../components/OfferCard';
import { categoryData } from '../utils/categoryData';

export function AdminContent() {
    const { adminUser } = useAuth();
    // const [activeTab, setActiveTab] = useState('categories'); // REMOVED
    const [categories, setCategories] = useState([]);
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // If valid, we are editing
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [catRes, offRes] = await Promise.all([
                fetch(`${API_URL}/categories`),
                fetch(`${API_URL}/offers`)
            ]);

            const cats = catRes.ok ? await catRes.json() : [];
            const offs = offRes.ok ? await offRes.json() : [];

            // Merge dynamic and static categories
            const dynamicSlugs = new Set(cats.map(c => c.name));
            const allCategories = [...cats];

            Object.keys(categoryData).forEach(slug => {
                if (!dynamicSlugs.has(slug)) {
                    allCategories.push({
                        _id: slug, // Use slug as partial ID
                        name: slug,
                        title: categoryData[slug].title
                    });
                }
            });

            setCategories(allCategories);
            setOffers(Array.isArray(offs) ? offs : []);
        } catch (err) {
            setError('Failed to fetch data');
            console.error("Fetch Data Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const openValidModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            // Editing
            setFormData(item);
            setPreviewImage(item.imageUrl);
        } else {
            // New
            setFormData({
                title: '', description: '', link: '',
                titleColor: '#ffffff', descriptionColor: '#ffffff',
                position: 'left', order: 0
            });
            setPreviewImage('');
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Validate
        if (!editingItem && !selectedFile) {
            // If creating new, image is required
            alert("Image is required for new items");
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (selectedFile) {
            data.append('image', selectedFile);
        }

        const endpoint = 'offers';
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem ? `${API_URL}/${endpoint}/${editingItem._id}` : `${API_URL}/${endpoint}`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${adminUser.token}`
                },
                body: data
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message);
            }

            setIsModalOpen(false);
            fetchData(); // Refresh
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to save");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const endpoint = 'offers';
        try {
            const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminUser.token}`
                }
            });
            if (res.ok) {
                fetchData();
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex border-b">
                <button
                    className="px-6 py-3 font-medium border-b-2 border-blue-600 text-blue-600"
                >
                    Offer Cards
                </button>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => openValidModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <span>+</span> Add New Offer
                </button>
            </div>

            {isLoading && <p>Loading...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => (
                    <div key={offer._id} className="relative group">
                        <OfferCard offer={offer} />
                        <div className="absolute top-2 right-2 flex gap-2 z-20">
                            <button onClick={() => openValidModal(offer)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors" title="Edit">✏️</button>
                            <button onClick={() => handleDelete(offer._id)} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-gray-100 transition-colors" title="Delete">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} Offer</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Common Fields */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Image</label>
                                {previewImage && (
                                    <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded mb-2 border" />
                                )}
                                <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm" />
                            </div>

                            {/* Offer Specific */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title Color</label>
                                    <input
                                        type="color"
                                        value={formData.titleColor || '#ffffff'}
                                        onChange={e => setFormData({ ...formData, titleColor: e.target.value })}
                                        className="w-full h-10 p-1 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Text Color</label>
                                    <input
                                        type="color"
                                        value={formData.descriptionColor || '#ffffff'}
                                        onChange={e => setFormData({ ...formData, descriptionColor: e.target.value })}
                                        className="w-full h-10 p-1 border rounded"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Text Position</label>
                                <select
                                    value={formData.position || 'left'}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Display Location</label>
                                <select
                                    value={formData.category || 'home'}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="home">Home Page (Top)</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.title} Page (Top)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                {/* <label className="block text-sm font-medium mb-1">Link Category</label> */}
                                {/* <select
                                    value={formData.link || ''}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select a Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={`/category/${cat.name}`}>
                                            {cat.title} ({cat.name})
                                        </option>
                                    ))}
                                </select> */}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-secondary flex-1"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
