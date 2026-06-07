import React, { useEffect } from 'react';
import './IncomingRequests.css';
import { useStayRequests } from '../../stayRequest/hook/useStayRequests';

const IncomingRequests = ({ onNavigate }) => {
    const { requests, loading, fetchOwnerRequests } = useStayRequests();

    useEffect(() => {
        fetchOwnerRequests();
    }, [fetchOwnerRequests]);

    // Show only pending requests as "Incoming" on the dashboard
    const pendingRequests = requests.filter(r => r.status === 'pending');

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs < 1) return 'Just now';
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="requests-container">
            <div className="section-header">
                <h3 className="section-title">Incoming Requests</h3>
                {pendingRequests.length > 0 && (
                    <span className="request-badge">{pendingRequests.length}</span>
                )}
            </div>
            
            <div className="requests-list">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading requests...</div>
                ) : pendingRequests.length > 0 ? (
                    pendingRequests.map(request => {
                        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.tenant_name)}&background=e2e8f0&color=475569`;
                        return (
                            <div key={request.id} className="request-card">
                                <div className="request-header">
                                    <img src={avatarUrl} alt={request.tenant_name} className="request-avatar" />
                                    <div className="request-meta">
                                        <span className="request-name">{request.tenant_name}</span>
                                        <span className="request-time">{formatTime(request.created_at)}</span>
                                    </div>
                                </div>
                                <div className="request-body">
                                    <div className="request-property-link">
                                        Interested in: <span className="property-highlight">{request.title}</span>
                                    </div>
                                    <p className="request-message">"{request.message}"</p>
                                </div>
                                <div className="request-actions">
                                    <button 
                                        className="btn-view-details-small"
                                        onClick={() => onNavigate && onNavigate('owner-requests')}
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        className="btn-message-small"
                                        onClick={() => onNavigate && onNavigate('tenant-messages')}
                                    >
                                        Message
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No pending requests.</div>
                )}
            </div>
        </div>
    );
};

export default IncomingRequests;
