const API_URL = '/api/properties';

const propertiesApi = {
    createProperty: async (propertyData) => {
        console.log(propertyData.amenities)
        try {
            // Because we include files, we must wrap propertyData in FormData
            // If the user already sends an object with files array, we encode it here.
            const formData = new FormData();
            
            Object.entries(propertyData).forEach(([key, value]) => {
                if (key === 'files' && Array.isArray(value)) {
                    value.forEach(file => formData.append('property_images', file));
                } else if (key === 'amenities' && Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (key === 'local_area') {
                    formData.append('area', value);
                } else if (key === 'area') {
                    // Map frontend 'area' (property size, sqft) to DB column 'property_size_sqft'
                    if (value !== null && value !== '') formData.append('property_size_sqft', value);
                } else if (value !== null && value !== '') {
                    formData.append(key, value);
                }
            });

            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData // No Content-Type header so browser can set boundary automatically
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create property');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getOwnerProperties: async () => {
        try {
            const response = await fetch(`${API_URL}/my-properties`, {
                method: 'GET'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch properties');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getAllProperties: async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'GET'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch properties');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getPropertyById: async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'GET'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch property details');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteProperty: async (id, token) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete property');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateProperty: async (id, propertyData, token) => {
        try {
            const formData = new FormData();
            
            // Append all non-file fields
            Object.keys(propertyData).forEach(key => {
                if (key === 'files') return; // Skip files array
                if (key === 'amenities') {
                    formData.append('amenities', JSON.stringify(propertyData[key] || []));
                } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
                    formData.append(key, propertyData[key]);
                }
            });

            // Append new files if any
            if (propertyData.files && propertyData.files.length > 0) {
                propertyData.files.forEach(file => {
                    formData.append('property_images', file);
                });
            }

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update property');
            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default propertiesApi;
