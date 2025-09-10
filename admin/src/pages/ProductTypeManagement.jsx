// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

// eslint-disable-next-line react/prop-types
const ProductTypeManagement = ({ token }) => {
    const [productTypes, setProductTypes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    
    // Form states
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');

    // Fetch product types
    const fetchProductTypes = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product-type/all`);
            if (response.data.success) {
                setProductTypes(response.data.data);
            }
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to fetch product types');
        }
    };

    useEffect(() => {
        fetchProductTypes();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { category, type, code, description };
            if (editingId) {
                // Update
                await axios.put(
                    `${backendUrl}/api/product-type/update/${editingId}`,
                    data,
                    { headers: { token } }
                );
                toast.success('Product type updated successfully');
            } else {
                // Add new
                await axios.post(
                    `${backendUrl}/api/product-type/add`,
                    data,
                    { headers: { token } }
                );
                toast.success('Product type added successfully');
            }

            // Reset form and refresh list
            setCategory('');
            setType('');
            setCode('');
            setDescription('');
            setEditingId(null);
            fetchProductTypes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    // Handle edit click
    const handleEdit = (productType) => {
        setEditingId(productType._id);
        setCategory(productType.category);
        setType(productType.type);
        setCode(productType.code);
        setDescription(productType.description || '');
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product type?')) {
            try {
                await axios.delete(
                    `${backendUrl}/api/product-type/delete/${id}`,
                    { headers: { token } }
                );
                toast.success('Product type deleted successfully');
                fetchProductTypes();
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                toast.error('Failed to delete product type');
            }
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Product Type Management</h2>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Fruit">Fruit</option>
                            <option value="Box">Box</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block mb-2">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="Tropical">Tropical</option>
                            <option value="Imported">Imported</option>
                            <option value="Seasonal">Seasonal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            rows="3"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    {editingId ? 'Update Product Type' : 'Add Product Type'}
                </button>
            </form>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b">Category</th>
                            <th className="px-6 py-3 border-b">Type</th>
                            <th className="px-6 py-3 border-b">Code</th>
                            <th className="px-6 py-3 border-b">Description</th>
                            <th className="px-6 py-3 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productTypes.map((productType) => (
                            <tr key={productType._id}>
                                <td className="px-6 py-4 border-b">{productType.category}</td>
                                <td className="px-6 py-4 border-b">{productType.type}</td>
                                <td className="px-6 py-4 border-b">{productType.code}</td>
                                <td className="px-6 py-4 border-b">{productType.description}</td>
                                <td className="px-6 py-4 border-b">
                                    <button
                                        onClick={() => handleEdit(productType)}
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(productType._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductTypeManagement;
