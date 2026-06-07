import React, { useState, useEffect, useCallback } from 'react';
import './AdminLayout.css';
import { useAuth } from '../../auth/hooks/useAuth';
import VerificationQueue from './VerificationQueue';

// ─── Admin Dashboard Stats ────────────────────────────────────────────────────
const AdminDashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error('Failed to load admin stats', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    if (loading) return <div className="admin-stats-loading">Loading stats...</div>;

    const u = stats?.userStats || {};
    const p = stats?.propertyStats || {};
    const r = stats?.requestStats || {};

    return (
        <div className="admin-dashboard-home">
            <div className="admin-stats-header">
                <h1>Platform Overview</h1>
                <p>Real-time metrics across the EasyRentBD platform</p>
            </div>
            <div className="admin-stats-grid">
                <div className="admin-stat-card blue">
                    <div className="asc-icon">👥</div>
                    <div className="asc-body">
                        <span className="asc-label">Total Users</span>
                        <span className="asc-value">{u.total_users || 0}</span>
                        <span className="asc-sub">{u.total_tenants || 0} tenants · {u.total_owners || 0} owners</span>
                    </div>
                </div>
                <div className="admin-stat-card orange">
                    <div className="asc-icon">⏳</div>
                    <div className="asc-body">
                        <span className="asc-label">Pending Verifications</span>
                        <span className="asc-value">{u.pending_verifications || 0}</span>
                        <span className="asc-sub">{u.verified_users || 0} verified users</span>
                    </div>
                </div>
                <div className="admin-stat-card green">
                    <div className="asc-icon">🏠</div>
                    <div className="asc-body">
                        <span className="asc-label">Properties</span>
                        <span className="asc-value">{p.total_properties || 0}</span>
                        <span className="asc-sub">{p.active_listings || 0} active · {p.rented_out || 0} rented</span>
                    </div>
                </div>
                <div className="admin-stat-card purple">
                    <div className="asc-icon">📋</div>
                    <div className="asc-body">
                        <span className="asc-label">Stay Requests</span>
                        <span className="asc-value">{r.total_requests || 0}</span>
                        <span className="asc-sub">{r.approved || 0} approved · {r.pending || 0} pending</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Admin User Management ────────────────────────────────────────────────────
const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/admin/users')
            .then(r => r.json())
            .then(d => { setUsers(d.users || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = users.filter(u => {
        if (filter === 'all') return true;
        return u.role === filter || u.status === filter;
    });

    const statusColor = (s) => {
        if (s === 'accepted') return '#16a34a';
        if (s === 'pending') return '#d97706';
        return '#dc2626';
    };

    return (
        <div className="admin-user-management">
            <div className="aum-header">
                <h1>User Management</h1>
                <p>All registered users on the platform</p>
            </div>
            <div className="aum-filters">
                {['all','tenant','owner','pending','accepted','rejected'].map(f => (
                    <button key={f} className={`aum-filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="admin-stats-loading">Loading users...</div>
            ) : (
                <div className="aum-table-wrapper">
                    <table className="aum-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id}>
                                    <td className="aum-name">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phone}</td>
                                    <td><span className="aum-role-badge">{u.role}</span></td>
                                    <td>
                                        <span className="aum-status-badge" style={{ color: statusColor(u.status) }}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className="aum-empty">No users match this filter.</p>}
                </div>
            )}
        </div>
    );
};

// ─── Admin Layout (with nav) ──────────────────────────────────────────────────
const AdminLayout = ({ onNavigate }) => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('pending-verifications');

    const handleLogout = async () => {
        await logout();
        if (onNavigate) onNavigate('login');
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'user-management', label: 'User Management' },
        { id: 'pending-verifications', label: 'Pending Verifications' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AdminDashboardStats />;
            case 'user-management': return <AdminUserManagement />;
            case 'pending-verifications': return <VerificationQueue />;
            default: return <VerificationQueue />;
        }
    };

    return (
        <div className="admin-layout-container">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-brand-horizontal">
                        <h2>EasyRent</h2>
                        <span className="admin-badge">Admin</span>
                    </div>
                    <nav className="admin-top-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="admin-header-right">
                    <div className="header-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <div className="admin-profile-top" onClick={handleLogout} title="Logout" style={{ cursor: 'pointer' }}>
                        <span className="profile-initials">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
                        <div className="profile-details-mini">
                            <span className="profile-name">{user?.name || 'Admin'}</span>
                            <span className="profile-role">Logout</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="admin-main-horizontal">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminLayout;
