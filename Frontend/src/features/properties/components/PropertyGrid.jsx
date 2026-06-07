import React, { useEffect, useState, useMemo } from 'react';
import PropertyCard from './PropertyCard';
import './PropertyGrid.css';
import { useProperties } from '../hooks/useProperties';

const PropertyGrid = ({ onNavigate, filters }) => {
    const { properties, loading, fetchAllProperties } = useProperties();
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchAllProperties();
    }, [fetchAllProperties]);

    // Apply filters client-side in real-time
    const filteredProperties = useMemo(() => {
        let result = [...properties];

        // Text search
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(q) ||
                p.address?.toLowerCase().includes(q) ||
                p.area?.toLowerCase().includes(q) ||
                p.district?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            );
        }

        if (filters) {
            // Price range
            result = result.filter(p => {
                const rent = parseFloat(p.monthly_rent) || 0;
                if (filters.minPrice > 0 && rent < filters.minPrice) return false;
                if (filters.maxPrice < 50000 && rent > filters.maxPrice) return false;
                return true;
            });

            // Property types
            if (filters.propertyTypes.length > 0) {
                result = result.filter(p => filters.propertyTypes.includes(p.property_type));
            }

            // Bedrooms
            if (filters.bedrooms !== null) {
                result = result.filter(p => (p.total_bedrooms || 0) >= filters.bedrooms);
            }

            // Bathrooms
            if (filters.bathrooms !== null) {
                result = result.filter(p => (p.total_bathrooms || 0) >= filters.bathrooms);
            }

            // Available from
            if (filters.availableFrom) {
                result = result.filter(p => {
                    if (!p.available_from) return true;
                    return new Date(p.available_from) <= new Date(filters.availableFrom);
                });
            }

            // Amenities — client-side match on the property_amenities loaded in cover (best-effort on name)
            // Full amenity filtering requires property detail level; we do soft match on description
        }

        // Sort
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'price_asc') {
            result.sort((a, b) => parseFloat(a.monthly_rent) - parseFloat(b.monthly_rent));
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => parseFloat(b.monthly_rent) - parseFloat(a.monthly_rent));
        }

        return result;
    }, [properties, filters, searchText, sortBy]);

    const activeFilterCount = filters
        ? [
            filters.propertyTypes.length > 0,
            filters.bedrooms !== null,
            filters.bathrooms !== null,
            filters.amenities.length > 0,
            filters.availableFrom !== '',
            filters.minPrice > 0,
            filters.maxPrice < 50000,
          ].filter(Boolean).length
        : 0;

    return (
        <main className="property-grid-area">
            <div className="search-sort-bar">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search properties by title, area or address..."
                            className="main-search-input"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {searchText && (
                            <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 8px' }}
                                onClick={() => setSearchText('')}
                                aria-label="Clear search"
                            >✕</button>
                        )}
                    </div>
                    <button className="btn-ai" onClick={() => onNavigate('aisearch')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Search with AI
                    </button>
                </div>
                
                <div className="sort-container">
                    {activeFilterCount > 0 && (
                        <span className="active-filter-badge">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
                    )}
                    <span className="sort-label">Sort by:</span>
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price (Low to High)</option>
                        <option value="price_desc">Price (High to Low)</option>
                    </select>
                </div>
            </div>

            <div className="properties-container">
                {loading ? (
                    <div className="grid-message-container">Loading properties...</div>
                ) : filteredProperties.length > 0 ? (
                    filteredProperties.map(prop => {
                        const formattedProp = {
                            id: prop.id,
                            title: prop.title,
                            price: `৳${parseFloat(prop.monthly_rent)?.toLocaleString()}`,
                            address: prop.address || prop.district,
                            description: prop.description,
                            beds: prop.total_bedrooms,
                            baths: prop.total_bathrooms,
                            sqft: prop.property_size_sqft || null,
                            imageUrl: prop.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
                            badges: [],
                            area: prop.area,
                            propertyType: prop.property_type,
                        };
                        return <PropertyCard key={prop.id} property={formattedProp} onNavigate={onNavigate} />;
                    })
                ) : (
                    <div className="grid-message-container">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <p style={{ fontWeight: 600, marginBottom: '6px' }}>No properties match your filters</p>
                        <p style={{ fontSize: '14px' }}>Try adjusting your search criteria or clear filters</p>
                    </div>
                )}
            </div>

            {filteredProperties.length > 0 && (
                <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '13px' }}>
                    Showing {filteredProperties.length} of {properties.length} properties
                </div>
            )}
        </main>
    );
};

export default PropertyGrid;
