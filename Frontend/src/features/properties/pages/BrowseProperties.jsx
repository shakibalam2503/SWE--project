import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import PropertyFilters from '../components/PropertyFilters';
import PropertyGrid from '../components/PropertyGrid';
import './BrowseProperties.css';

const DEFAULT_FILTERS = {
    minPrice: 0,
    maxPrice: 50000,
    propertyTypes: [],
    bedrooms: null,
    bathrooms: null,
    amenities: [],
    availableFrom: '',
};

const BrowseProperties = ({ onNavigate, isLoggedIn, user }) => {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const handleClear = () => setFilters(DEFAULT_FILTERS);

    return (
        <div className="browse-properties-page">
            <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} user={user} activeTab="properties" />
            <div className="browse-content-wrapper">
                <PropertyFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    onClear={handleClear}
                />
                <PropertyGrid onNavigate={onNavigate} filters={filters} />
            </div>
            
            <footer className="page-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <span className="footer-brand font-semibold">EasyRent</span>
                        <p className="copyright">© 2024 EasyRent Solutions. All rights reserved.</p>
                    </div>
                    <div className="footer-links">
                        <a href="#contact">Contact Us</a>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#help">Help Center</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BrowseProperties;
