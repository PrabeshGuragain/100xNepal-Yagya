import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function AddArLocation() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'info',
    lat: '',
    lng: '',
    modelUrl: '',
    modelScale: ''
  });

  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.lat || !formData.lng) {
      setMessage('Please fill all required fields');
      return;
    }
    
    const payload = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      ...(formData.type === 'model' && {
        modelUrl: formData.modelUrl || null,
        modelScale: formData.modelScale || null
      })
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/ar-locations/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage('Location added successfully!');
        setFormData({
          name: '',
          description: '',
          type: 'info',
          lat: '',
          lng: '',
          modelUrl: '',
          modelScale: ''
        });
      } else {
        setMessage('Failed to add location');
      }
    } catch (error) {
      setMessage('Error: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Add AR Location</h1>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Boudhanath Stupa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Describe this location..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="model">Model</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="27.7263058"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="85.3559119"
                />
              </div>
            </div>

            {formData.type === 'model' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model URL</label>
                  <input
                    type="url"
                    value={formData.modelUrl}
                    onChange={(e) => setFormData({...formData, modelUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://example.com/model.gltf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model Scale</label>
                  <input
                    type="text"
                    value={formData.modelScale}
                    onChange={(e) => setFormData({...formData, modelScale: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.5 0.5 0.5"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}