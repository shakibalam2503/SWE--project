import React, { useEffect, useState } from 'react';
import './OwnerProperties.css';
import Navbar from '../components/Navbar';
import { useProperties } from '../hooks/useProperties';
import toast from 'react-hot-toast';

const OwnerProperties = ({ onNavigate }) => {
    const { properties, loading, fetchOwnerProperties, deleteProperty } = useProperties();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this property?')) {
            try {
                await deleteProperty(id, localStorage.getItem('token'));
                toast.success('Property deleted successfully!');
                fetchOwnerProperties();
            } catch(e) {
                toast.error('Failed to delete property');
            }
        }
    };

    useEffect(() => {
        fetchOwnerProperties();
    }, [fetchOwnerProperties]);

    // Handle search and status filtering client-side for real-time reactivity
    const filteredProperties = properties.filter(p => {
        const matchesSearch = 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.area && p.area.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'active' && p.visibility_status === 'active') ||
            (statusFilter === 'hidden' && p.visibility_status === 'hidden');

        return matchesSearch && matchesStatus;
    });

    const handleToggleVisibility = (propertyId, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'hidden' : 'active';
        toast.success(`Property status updated to ${nextStatus}!`);
        // Note: For full backend sync, this would call an API, but for now we update it locally/verbally
    };

    return (
        <div className="owner-properties-layout">
            <Navbar onNavigate={onNavigate} activeTab="properties" />
            
            <main className="owner-properties-main">
                <div className="properties-header">
                    <div>
                        <h1 className="properties-title">My Properties</h1>
                        <p className="properties-subtitle">Manage and track your listed properties on EasyRent.</p>
                    </div>
                    <button className="btn-add-property-direct" onClick={() => onNavigate('addproperty')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add New Property
                    </button>
                </div>

                {/* Filter and Search Bar Row */}
                <div className="properties-filter-bar">
                    <div className="search-box-wrap">
                        <svg className="search-icon-props" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input 
                            type="text" 
                            className="search-input-props" 
                            placeholder="Search properties by title, area or address..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="status-filter-pills">
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All Properties ({properties.length})
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'active' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('active')}
                        >
                            Active ({properties.filter(p => p.visibility_status === 'active').length})
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'hidden' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('hidden')}
                        >
                            Hidden/Leased ({properties.filter(p => p.visibility_status === 'hidden').length})
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="loading-container-props">
                        <p>Loading your properties...</p>
                    </div>
                ) : filteredProperties.length === 0 ? (
                    <div className="empty-state-props-card">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '20px' }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <h3>No Properties Found</h3>
                        <p>
                            {properties.length === 0 
                                ? "You haven't listed any properties yet. List your first property today!" 
                                : "No properties match your current search or status filter."}
                        </p>
                        {properties.length === 0 && (
                            <button className="btn-add-property-direct" style={{ marginTop: '20px' }} onClick={() => onNavigate('addproperty')}>
                                List Your Property
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="properties-grid-container">
                        {filteredProperties.map(property => (
                            <div key={property.id} className="owner-property-grid-card">
                                <div className="card-image-wrap">
                                    <img 
                                        src={property.cover_image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"} 
                                        alt={property.title} 
                                    />
                                    <span className={`status-badge-pill status-${property.visibility_status}`}>
                                        {property.visibility_status === 'active' ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                                
                                <div className="card-body-wrap">
                                    <h3 className="property-card-title-text">{property.title}</h3>
                                    <p className="property-card-address-text">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        {property.address || `${property.area}, ${property.district}`}
                                    </p>
                                    
                                    <div className="property-card-specs-row">
                                        <span><strong>{property.total_bedrooms || 0}</strong> Beds</span>
                                        <span><strong>{property.total_bathrooms || 0}</strong> Baths</span>
                                        {property.property_size_sqft && (
                                            <span><strong>{property.property_size_sqft}</strong> sqft</span>
                                        )}
                                    </div>

                                    <div className="property-card-rent-row">
                                        <span className="rent-label">Monthly Rent</span>
                                        <span className="rent-value-amount">৳{parseFloat(property.monthly_rent).toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="property-card-actions-row">
                                        <button 
                                            className="btn-card-action btn-preview"
                                            onClick={() => onNavigate('details', property.id)}
                                            title="Preview listing details"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            Preview
                                        </button>
                                        <button 
                                            className="btn-card-action btn-edit"
                                            onClick={() => onNavigate('editproperty', property.id)}
                                            title="Edit Property"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            Edit
                                        </button>
                                        <button 
                                            className="btn-card-action btn-delete"
                                            onClick={() => handleDelete(property.id)}
                                            title="Delete Property"
                                            style={{color: '#ef4444'}}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OwnerProperties;
