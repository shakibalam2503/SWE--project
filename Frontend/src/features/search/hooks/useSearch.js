import { useRef } from 'react';
import { useSearchState } from '../states/SearchContext';
import { searchProperties } from '../services/search.service';

const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Session ID will be generated once per page load via React state

export const useSearch = () => {
    const {
        messages,
        setMessages,
        properties,
        setProperties,
        landmarkData,
        setLandmarkData,
        loading,
        setLoading,
        hoveredPropertyId,
        setHoveredPropertyId,
        clearSearch
    } = useSearchState();

    // Generate a fresh Session ID exactly ONCE per page load using useRef
    const sessionRef = useRef(generateUUID());
    const sessionId = sessionRef.current;

    const submitQuery = async (query) => {
        if (!query.trim()) return;

        // Add user message to chat
        const userMsg = { type: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            // Call the service with query and sessionId
            const { properties: results, text, landmarkData: landmarks } = await searchProperties(query, sessionId);
            
            // Format properties (similar to PropertyGrid formatting)
            const formattedResults = (results || []).map(prop => ({
                id: prop.id || Math.random().toString(),
                title: prop.title,
                price: prop.monthly_rent ? Number(prop.monthly_rent) : 0,
                address: prop.address || prop.district,
                description: prop.description,
                beds: prop.total_bedrooms,
                baths: prop.total_bathrooms,
                sqft: prop.property_size_sqft || null,
                imageUrl: prop.cover_image || 'https://via.placeholder.com/800x500?text=No+Image',
                latitude: (prop.latitude && !isNaN(Number(prop.latitude))) ? Number(prop.latitude) : (45.523064 + (Math.random() - 0.5) * 0.05),
                longitude: (prop.longitude && !isNaN(Number(prop.longitude))) ? Number(prop.longitude) : (-122.676483 + (Math.random() - 0.5) * 0.05),
                matchScore: Math.floor(Math.random() * 10) + 90 // Mock match score
            }));

            setProperties(formattedResults);
            setLandmarkData(landmarks || null);

            // Add AI response to chat
            const aiMsg = { 
                type: 'ai', 
                text: text || `I've found ${formattedResults.length} properties that match your criteria for "${query}".`,
                results: formattedResults 
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Search error:", error);
            const errorMsg = { 
                type: 'ai', 
                text: "I'm sorry, I encountered an error while searching. Please try again." 
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        properties,
        loading,
        hoveredPropertyId,
        setHoveredPropertyId,
        submitQuery
    };
};
