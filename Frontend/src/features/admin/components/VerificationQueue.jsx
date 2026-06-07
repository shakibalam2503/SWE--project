import React, { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import './VerificationQueue.css';

const VerificationQueue = () => {
    const { pendingUsers, loading, fetchPendingUsers, approveUser, rejectUser } = useAdmin();
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    // Handle auto-selection when users list changes
    useEffect(() => {
        if (pendingUsers.length > 0 && !selectedUser) {
            setSelectedUser(pendingUsers[0]);
        } else if (pendingUsers.length === 0 && selectedUser !== null) {
            setSelectedUser(null);
        } else if (selectedUser) {
            // Check if selected user is still in the pending queue
            const stillExists = pendingUsers.find(u => u.id === selectedUser.id);
            if (!stillExists && pendingUsers.length > 0) {
                 setSelectedUser(pendingUsers[0]);
            } else if (!stillExists && pendingUsers.length === 0) {
                setSelectedUser(null);
            }
        }
    }, [pendingUsers, selectedUser, setSelectedUser]);

    const handleApprove = () => {
        if (selectedUser) {
            approveUser(selectedUser.id);
        }
    };

    const handleReject = () => {
        if (selectedUser) {
            rejectUser(selectedUser.id);
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="vq-container">
            <div className="vq-header">
                <div className="vq-title">
                    <h1>Verification Queue</h1>
                    <p>Manage and review identification documents for platform safety.</p>
                </div>
                <div className="vq-stats">
                    <div className="stat-box">
                        <h4>Pending Queue</h4>
                        <span>{pendingUsers.length}</span>
                    </div>
                    <div className="stat-box dark">
                        <h4>Verified Today</h4>
                        <span>--</span>
                    </div>
                </div>
            </div>

            <div className="vq-content">
                <div className="queue-list">
                    <div className="ql-header">
                        <h3>Accounts Pending</h3>
                        <div className="filter-pills">
                            <span className="filter-pill active">All</span>
                            <span className="filter-pill">Owners</span>
                            <span className="filter-pill">Tenants</span>
                        </div>
                    </div>
                    <div className="ql-items">
                        {loading && <div className="empty-state">Loading...</div>}
                        {!loading && pendingUsers.length === 0 && (
                            <div className="empty-state">No pending users</div>
                        )}
                        {pendingUsers.map(user => (
                            <div 
                                key={user.id} 
                                className={`ql-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className="ql-avatar">
                                    {getInitials(user.name)}
                                </div>
                                <div className="ql-info">
                                    <h4>{user.name}</h4>
                                    <p>{user.role || 'User'} • ID: ER-{user.id}</p>
                                    <div className="ql-status">
                                        <span className="status-dot"></span> Pending
                                    </div>
                                </div>
                                <button className="btn-review">Review NID</button>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="queue-details">
                    {selectedUser ? (
                        <>
                            <div className="qd-header">
                                <div className="qd-user">
                                    <div className="qd-avatar">
                                        {getInitials(selectedUser.name)}
                                    </div>
                                    <div className="qd-info">
                                        <span className="qd-badge">Active Selection</span>
                                        <h2>{selectedUser.name}</h2>
                                        <p>Submitting for: {selectedUser.role} Account Verification</p>
                                        <div className="qd-contact-info">
                                            <span>Email: {selectedUser.email}</span>
                                            {selectedUser.phone && <span>Phone: {selectedUser.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="qd-meta">
                                    <span>Submitted on</span>
                                    <p>{formatDate(selectedUser.created_at)}</p>
                                </div>
                            </div>
                            
                            <div className="qd-body">
                                <div className="nid-section">
                                    <div className="nid-card">
                                        <div className="nid-title">
                                            <span>NID Front View</span>
                                            <span style={{cursor: 'pointer'}}>🔍</span>
                                        </div>
                                        <div className="nid-img-wrapper">
                                            {selectedUser.nid_front_url ? (
                                                <img src={selectedUser.nid_front_url} alt="NID Front" />
                                            ) : (
                                                <span>No Front Image</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="nid-card">
                                        <div className="nid-title">
                                            <span>NID Back View</span>
                                            <span style={{cursor: 'pointer'}}>🔍</span>
                                        </div>
                                        <div className="nid-img-wrapper">
                                            {selectedUser.nid_back_url ? (
                                                <img src={selectedUser.nid_back_url} alt="NID Back" />
                                            ) : (
                                                <span>No Back Image</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom stats removed as requested */}
                            
                            <div className="qd-actions">
                                <button className="btn-approve" onClick={handleApprove}>
                                     Approve Verification
                                </button>
                                <button className="btn-reject" onClick={handleReject}>
                                     Reject Account
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            Select a user from the queue to review
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationQueue;
