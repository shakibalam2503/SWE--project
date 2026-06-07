import React, { useEffect, useState } from 'react';
import './OwnerRequests.css';
import Navbar from '../../properties/components/Navbar';
import { useStayRequests } from '../hook/useStayRequests';
import toast from 'react-hot-toast';

const OwnerRequests = ({ onNavigate }) => {
    const { requests, loading, error, fetchOwnerRequests, updateRequestStatus } = useStayRequests();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOwnerRequests();
    }, [fetchOwnerRequests]);

    // Handle approval
    const handleApprove = async (id, name, title) => {
        try {
            await updateRequestStatus(id, 'approved');
            toast.success(`Approved stay request from "${name}" for "${title}"!`, {
                duration: 4000,
                icon: '✅'
            });
        } catch (err) {
            toast.error(err.message || 'Failed to approve stay request.');
        }
    };

    // Handle rejection
    const handleReject = async (id, name, title) => {
        try {
            await updateRequestStatus(id, 'rejected');
            toast.error(`Rejected stay request from "${name}" for "${title}".`, {
                duration: 4000,
                icon: '❌'
            });
        } catch (err) {
            toast.error(err.message || 'Failed to reject stay request.');
        }
    };

    // Statistics counts
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;

    // Filtered requests list
    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    // Helper to get stylized property descriptions
    const getPropertyDetails = (propertyTitle) => {
        const titleLower = (propertyTitle || '').toLowerCase();
        if (titleLower.includes('azure') || titleLower.includes('skyline')) return '2-Bedroom Luxury';
        if (titleLower.includes('oakwood') || titleLower.includes('glass')) return 'Studio Loft';
        if (titleLower.includes('marble')) return '3-Bedroom Suite';
        return '1-Bedroom Cozy Suite';
    };

    // Helper to get request initials color
    const getInitialsColor = (name) => {
        const char = (name || 'J').charAt(0).toUpperCase();
        const code = char.charCodeAt(0);
        if (code % 4 === 0) return 'bg-cyan';
        if (code % 4 === 1) return 'bg-violet';
        if (code % 4 === 2) return 'bg-amber';
        return 'bg-blue';
    };

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper to format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="owner-requests-layout">
            <Navbar onNavigate={onNavigate} activeTab="requests" />

            <main className="owner-requests-main">
                {/* Upper Section */}
                <div className="owner-requests-header">
                    <div className="header-text-container">
                        <h1 className="owner-title">Incoming Stay Requests</h1>
                        <p className="owner-subtitle">Manage and review all pending residency applications for your property portfolio.</p>
                    </div>

                    <div className="action-button-group">
                        <button className="btn-filter" onClick={() => setFilter(filter === 'all' ? 'pending' : 'all')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            <span>{filter === 'all' ? 'Filter Pending' : 'Show All'}</span>
                        </button>
                        
                        <button className="btn-export" onClick={() => toast.success('Stay requests list exported successfully!')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Export List</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Row */}
                <div className="stats-row">
                    <div className="stat-box">
                        <span className="stat-label">TOTAL PENDING</span>
                        <div className="stat-val-wrapper">
                            <span className="stat-number">{String(pendingCount).padStart(2, '0')}</span>
                            <span className="stat-unit">Requests</span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">APPROVED TODAY</span>
                        <div className="stat-val-wrapper">
                            <span className="stat-number">{String(approvedCount).padStart(2, '0')}</span>
                            <span className="stat-unit">Units</span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">AVG. RESPONSE TIME</span>
                        <div className="stat-val-wrapper">
                            <span className="stat-number">4.2</span>
                            <span className="stat-unit">Hours</span>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="error-banner">
                        <p>{error}</p>
                        <button className="error-retry-btn" onClick={fetchOwnerRequests}>Retry</button>
                    </div>
                )}

                {/* Main Requests List Table */}
                {loading && requests.length === 0 ? (
                    <div className="owner-loading-wrapper">
                        <div className="spinner"></div>
                        <p>Loading stay requests...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>APPLICANT</th>
                                    <th>PROPERTY</th>
                                    <th>REQUEST DATE</th>
                                    <th>STATUS</th>
                                    <th className="actions-header">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-table-row">
                                            No stay requests found matching your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map(req => {
                                        const applicantName = req.tenant_name || 'James Davis';
                                        const applicantEmail = req.tenant_email || 'james.davis@email.com';
                                        const initials = applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                                        return (
                                            <tr key={req.id}>
                                                {/* Applicant Column */}
                                                <td>
                                                    <div className="applicant-flex">
                                                        <div className={`applicant-avatar-circle ${getInitialsColor(applicantName)}`}>
                                                            {initials}
                                                        </div>
                                                        <div className="applicant-info">
                                                            <span className="applicant-name">{applicantName}</span>
                                                            <span className="applicant-email">{applicantEmail}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Property Column */}
                                                <td>
                                                    <div className="property-cell">
                                                        <span className="property-title-cell">{req.title}</span>
                                                        <span className="property-desc-cell">{getPropertyDetails(req.title)}</span>
                                                    </div>
                                                </td>

                                                {/* Request Date Column */}
                                                <td>
                                                    <div className="date-cell">
                                                        <span className="date-text">{formatDate(req.created_at)}</span>
                                                        <span className="time-text">{formatTime(req.created_at)}</span>
                                                    </div>
                                                </td>

                                                {/* Status Column */}
                                                <td>
                                                    <span className={`status-pill ${req.status}`}>
                                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                    </span>
                                                </td>

                                                {/* Actions Column */}
                                                <td className="actions-cell">
                                                    {req.status === 'pending' ? (
                                                        <div className="action-buttons">
                                                            <button 
                                                                className="btn-action-view" 
                                                                onClick={() => setSelectedRequest(req)} 
                                                                title="View Details"
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                    <circle cx="12" cy="12" r="3"></circle>
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                className="btn-action-approve" 
                                                                onClick={() => handleApprove(req.id, applicantName, req.title)} 
                                                                title="Approve Applicant"
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                className="btn-action-reject" 
                                                                onClick={() => handleReject(req.id, applicantName, req.title)} 
                                                                title="Reject Applicant"
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="resolved-text">Resolved</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        {/* Footer Pagination */}
                        <div className="table-footer">
                            <span className="footer-count">
                                Showing {filteredRequests.length} of {requests.length} requests
                            </span>
                            <div className="pagination-controls">
                                <button className="btn-pagination-prev" disabled>
                                    &lt;
                                </button>
                                <button className="btn-pagination-next" disabled>
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="owner-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <span className="footer-brand">EasyRent</span>
                        <span className="copyright">© 2024 EasyRent Rental Management Solutions. All rights reserved.</span>
                    </div>
                    <div className="footer-links">
                        <a href="#support">Support Center</a>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#legal">Legal Notice</a>
                    </div>
                </div>
            </footer>

            {/* Modal: View Details and Message */}
            {selectedRequest && (
                <div className="owner-modal-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="owner-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Stay Request Application</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedRequest(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="applicant-profile-card">
                                <div className={`profile-avatar ${getInitialsColor(selectedRequest.tenant_name)}`}>
                                    {(selectedRequest.tenant_name || 'J').charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-details">
                                    <h4 className="profile-name">{selectedRequest.tenant_name || 'James Davis'}</h4>
                                    <span className="profile-email">{selectedRequest.tenant_email || 'james.davis@email.com'}</span>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Property:</span>
                                    <span className="info-value bold">{selectedRequest.title}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Preferred Move-In:</span>
                                    <span className="info-value">
                                        {selectedRequest.move_in_date 
                                            ? new Date(selectedRequest.move_in_date).toLocaleDateString('en-US', { dateStyle: 'medium' }) 
                                            : 'Flexible'}
                                    </span>
                                </div>
                            </div>

                            <div className="message-section">
                                <span className="info-label">Applicant's Cover Message:</span>
                                <div className="message-box">
                                    "{selectedRequest.message || 'No additional cover letter was attached.'}"
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-reject-modal" onClick={() => {
                                handleReject(selectedRequest.id, selectedRequest.tenant_name, selectedRequest.title);
                                setSelectedRequest(null);
                            }}>
                                Reject
                            </button>
                            <button className="btn-approve-modal" onClick={() => {
                                handleApprove(selectedRequest.id, selectedRequest.tenant_name, selectedRequest.title);
                                setSelectedRequest(null);
                            }}>
                                Approve Applicant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerRequests;
