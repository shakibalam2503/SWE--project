import React, { useEffect, useState } from 'react';
import './TenantRequests.css';
import Navbar from '../../properties/components/Navbar';
import StayRequestCard from '../component/StayRequestCard';
import { useStayRequests } from '../hook/useStayRequests';
import toast from 'react-hot-toast';

const TenantRequests = ({ onNavigate }) => {
    const { requests, loading, error, fetchMyRequests } = useStayRequests();
    const [filter, setFilter] = useState('all');
    
    // Modal states
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

    useEffect(() => {
        fetchMyRequests();
    }, [fetchMyRequests]);

    // Handle "Sign Lease"
    const handleSignLease = (id, propertyTitle) => {
        toast.success(`Congratulations! Lease for "${propertyTitle}" has been signed successfully! 🎉 Welcome home!`, {
            duration: 5000,
            icon: '🏠'
        });
    };

    // Filtered requests list
    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    return (
        <div className="tenant-requests-layout">
            <Navbar onNavigate={onNavigate} activeTab="requests" />

            <main className="tenant-requests-main">
                {/* Header Section */}
                <div className="tenant-requests-header">
                    <div className="header-text-container">
                        <h1 className="requests-title">My Stay Requests</h1>
                        <p className="requests-subtitle">Manage and track your active rental applications.</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="filter-pill-container">
                        <button 
                            className={`filter-pill-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-pill-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button 
                            className={`filter-pill-btn ${filter === 'approved' ? 'active' : ''}`}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="error-banner">
                        <p>{error}</p>
                        <button className="error-retry-btn" onClick={fetchMyRequests}>Retry</button>
                    </div>
                )}

                {/* Main Content Area */}
                {loading ? (
                    <div className="requests-loading-wrapper">
                        <div className="spinner"></div>
                        <p>Fetching your active stay requests...</p>
                    </div>
                ) : (
                    <div className="requests-grid">
                        {/* Dynamic Request Cards */}
                        {filteredRequests.map(request => (
                            <StayRequestCard 
                                key={request.id} 
                                request={request}
                                onSignLease={handleSignLease}
                                onViewFeedback={setSelectedFeedback}
                                onViewDetails={setSelectedRequestDetails}
                            />
                        ))}

                        {/* "Finding a new place?" Dashed Card */}
                        <div className="finding-place-card">
                            <div className="icon-wrapper">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                <span className="plus-overlay">+</span>
                            </div>
                            <h3 className="finding-title">Finding a new place?</h3>
                            <p className="finding-description">
                                Explore our premium properties and start a new request today.
                            </p>
                            <button className="btn-browse-properties" onClick={() => onNavigate('browse')}>
                                Browse Properties
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal: View Landlord Feedback */}
            {selectedFeedback && (
                <div className="requests-modal-overlay" onClick={() => setSelectedFeedback(null)}>
                    <div className="requests-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Application Feedback</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedFeedback(null)}>&times;</button>
                        </div>
                        <div className="modal-body feedback">
                            <div className="feedback-quote-icon">“</div>
                            <p className="feedback-text">{selectedFeedback}</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-close" onClick={() => setSelectedFeedback(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: View Details */}
            {selectedRequestDetails && (
                <div className="requests-modal-overlay" onClick={() => setSelectedRequestDetails(null)}>
                    <div className="requests-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Application Details</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedRequestDetails(null)}>&times;</button>
                        </div>
                        <div className="modal-body details">
                            <div className="details-row">
                                <span className="details-label">Property:</span>
                                <span className="details-val bold">{selectedRequestDetails.title}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Rent:</span>
                                <span className="details-val highlight">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(selectedRequestDetails.monthly_rent)}/mo</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Location:</span>
                                <span className="details-val">{selectedRequestDetails.area || 'Brooklyn, NY'}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Status:</span>
                                <span className={`status-badge inline ${selectedRequestDetails.status}`}>{selectedRequestDetails.status}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Move-In Date:</span>
                                <span className="details-val">{selectedRequestDetails.move_in_date ? new Date(selectedRequestDetails.move_in_date).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Not specified'}</span>
                            </div>
                            <div className="details-divider"></div>
                            <div className="details-row vertical">
                                <span className="details-label">Your message to landlord:</span>
                                <p className="details-message-content">"{selectedRequestDetails.message || 'No custom message was attached.'}"</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-close" onClick={() => setSelectedRequestDetails(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantRequests;
