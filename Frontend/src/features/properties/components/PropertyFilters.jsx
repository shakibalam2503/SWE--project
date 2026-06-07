import React from 'react';
import './PropertyFilters.css';

const PROPERTY_TYPES = ['apartment', 'house', 'hostel', 'commercial'];
const AMENITY_OPTIONS = ['Swimming Pool', 'Gym', 'Parking', 'WiFi', 'Air Conditioning', 'Generator', 'Security', 'Elevator', 'Pet Friendly'];

const PropertyFilters = ({ filters, onFilterChange, onClear }) => {
    const handlePriceChange = (e, key) => {
        const val = parseInt(e.target.value, 10);
        if (key === 'minPrice' && val > filters.maxPrice) return;
        if (key === 'maxPrice' && val < filters.minPrice) return;
        onFilterChange({ ...filters, [key]: val });
    };

    const handleTypeToggle = (type) => {
        const updated = filters.propertyTypes.includes(type)
            ? filters.propertyTypes.filter(t => t !== type)
            : [...filters.propertyTypes, type];
        onFilterChange({ ...filters, propertyTypes: updated });
    };

    const handleBedroomsChange = (val) => onFilterChange({ ...filters, bedrooms: val });
    const handleBathroomsChange = (val) => onFilterChange({ ...filters, bathrooms: val });

    const handleAmenityToggle = (amenity) => {
        const updated = filters.amenities.includes(amenity)
            ? filters.amenities.filter(a => a !== amenity)
            : [...filters.amenities, amenity];
        onFilterChange({ ...filters, amenities: updated });
    };

    const handleAvailabilityChange = (e) => {
        onFilterChange({ ...filters, availableFrom: e.target.value });
    };

    const hasActiveFilters =
        filters.minPrice > 0 ||
        filters.maxPrice < 50000 ||
        filters.propertyTypes.length > 0 ||
        filters.bedrooms !== null ||
        filters.bathrooms !== null ||
        filters.amenities.length > 0 ||
        filters.availableFrom !== '';

    return (
        <aside className="property-filters">
            <div className="filters-header">
                <div className="filters-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14"></line>
                        <line x1="4" y1="10" x2="4" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="3"></line>
                        <line x1="20" y1="21" x2="20" y2="16"></line>
                        <line x1="20" y1="12" x2="20" y2="3"></line>
                        <line x1="1" y1="14" x2="7" y2="14"></line>
                        <line x1="9" y1="8" x2="15" y2="8"></line>
                        <line x1="17" y1="16" x2="23" y2="16"></line>
                    </svg>
                    <h2>Filters</h2>
                </div>
                <p className="filters-subtitle">Narrow your search</p>
            </div>

            {/* Price Range */}
            <div className="filter-group">
                <h3 className="filter-group-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Price Range
                </h3>
                <div className="price-range-container">
                    <div className="price-inputs-row">
                        <input
                            type="range"
                            min="0" max="50000" step="500"
                            value={filters.minPrice}
                            onChange={(e) => handlePriceChange(e, 'minPrice')}
                            className="price-slider"
                        />
                        <input
                            type="range"
                            min="0" max="50000" step="500"
                            value={filters.maxPrice}
                            onChange={(e) => handlePriceChange(e, 'maxPrice')}
                            className="price-slider"
                        />
                    </div>
                    <div className="range-values">
                        <span>৳{filters.minPrice.toLocaleString()}</span>
                        <span>{filters.maxPrice >= 50000 ? '৳50,000+' : `৳${filters.maxPrice.toLocaleString()}`}</span>
                    </div>
                </div>
            </div>

            {/* Property Type */}
            <div className="filter-group">
                <h3 className="filter-group-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Property Type
                </h3>
                {PROPERTY_TYPES.map(type => (
                    <label key={type} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.propertyTypes.includes(type)}
                            onChange={() => handleTypeToggle(type)}
                        />
                        <span className="checkbox-custom"></span>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                ))}
            </div>

            {/* Bedrooms */}
            <div className="filter-group">
                <h3 className="filter-group-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="14" width="18" height="8" rx="2" ry="2"></rect><path d="M5 14v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"></path><path d="M12 21v-7"></path></svg>
                    Bedrooms
                </h3>
                <div className="segmented-control">
                    {[null, 1, 2, 3].map((val, i) => (
                        <button
                            key={i}
                            className={`segment ${filters.bedrooms === val ? 'active' : ''}`}
                            onClick={() => handleBedroomsChange(val)}
                        >
                            {val === null ? 'Any' : `${val}+`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bathrooms */}
            <div className="filter-group">
                <h3 className="filter-group-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                    Bathrooms
                </h3>
                <div className="segmented-control">
                    {[null, 1, 2, 3].map((val, i) => (
                        <button
                            key={i}
                            className={`segment ${filters.bathrooms === val ? 'active' : ''}`}
                            onClick={() => handleBathroomsChange(val)}
                        >
                            {val === null ? 'Any' : `${val}+`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Amenities */}
            <div className="filter-group">
                <h3 className="filter-group-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Amenities
                </h3>
                {AMENITY_OPTIONS.map(amenity => (
                    <label key={amenity} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity)}
                            onChange={() => handleAmenityToggle(amenity)}
                        />
                        <span className="checkbox-custom"></span>
                        {amenity}
                    </label>
                ))}
            </div>

            {/* Availability */}
            <div className="filter-group">
                <h3 className="filter-group-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Available From
                </h3>
                <input
                    type="date"
                    className="date-input"
                    value={filters.availableFrom}
                    onChange={handleAvailabilityChange}
                />
            </div>

            {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={onClear}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Clear All Filters
                </button>
            )}
        </aside>
    );
};

export default PropertyFilters;
