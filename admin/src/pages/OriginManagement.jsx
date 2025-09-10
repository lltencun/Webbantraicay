// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

// eslint-disable-next-line react/prop-types
const OriginManagement = ({ token }) => {
  const [origins, setOrigins] = useState([]);
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [farmName, setFarmName] = useState('');
  const [cultivationMethod, setCultivationMethod] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOrigins();
  }, []);

  const fetchOrigins = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/origin/all');
      if (response.data.success) {
        setOrigins(response.data.data);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch origins');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        country,
        region,
        farm_name: farmName,
        cultivation_method: cultivationMethod,
      };

      if (editingId) {
        await axios.put(backendUrl + `/api/origin/update/${editingId}`, data, {
          headers: { token },
        });
        toast.success('Origin updated successfully');
      } else {
        await axios.post(backendUrl + '/api/origin/add', data, {
          headers: { token },
        });
        toast.success('Origin added successfully');
      }

      setCountry('');
      setRegion('');
      setFarmName('');
      setCultivationMethod('');
      setEditingId(null);
      fetchOrigins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (origin) => {
    setCountry(origin.country);
    setRegion(origin.region);
    setFarmName(origin.farm_name);
    setCultivationMethod(origin.cultivation_method);
    setEditingId(origin._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this origin?')) {
      try {
        await axios.delete(backendUrl + `/api/origin/delete/${id}`, {
          headers: { token },
        });
        toast.success('Origin deleted successfully');
        fetchOrigins();
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error('Failed to delete origin');
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Origin Management</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Region</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Farm Name</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Cultivation Method</label>
            <input
              type="text"
              value={cultivationMethod}
              onChange={(e) => setCultivationMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? 'Update Origin' : 'Add Origin'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">Country</th>
              <th className="px-6 py-3 border-b">Region</th>
              <th className="px-6 py-3 border-b">Farm Name</th>
              <th className="px-6 py-3 border-b">Cultivation Method</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {origins.map((origin) => (
              <tr key={origin._id}>
                <td className="px-6 py-4 border-b">{origin.country}</td>
                <td className="px-6 py-4 border-b">{origin.region}</td>
                <td className="px-6 py-4 border-b">{origin.farm_name}</td>
                <td className="px-6 py-4 border-b">{origin.cultivation_method}</td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => handleEdit(origin)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(origin._id)}
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

export default OriginManagement;
