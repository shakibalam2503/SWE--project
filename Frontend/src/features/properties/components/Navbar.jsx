import React, { useState } from 'react';
import './Navbar.css';
import { useAuth } from '../../auth/hooks/useAuth';

const Navbar = ({ onNavigate, activeTab }) => {
    const { isLoggedIn, user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    const isPremiumView = isLoggedIn && (user?.role === 'tenant' || user?.role === 'owner');

    if (isPremiumView) {
        const isOwner = user?.role === 'owner';

        return (
            <header className="tenant-navbar-container">
                {/* Left: Premium logo */}
                <div className="tenant-navbar-logo" onClick={() => onNavigate && onNavigate(isOwner ? 'ownerdashboard' : 'tenant-dashboard')} style={{ cursor: 'pointer' }}>
                    <span className="tenant-logo-bold">EasyRent</span>
                    <span className="tenant-logo-sub">PROPERTY MANAGEMENT</span>
                </div>

                {/* Center: Active tab pills */}
                <nav className="tenant-navbar-links">
                    <button 
                        onClick={() => onNavigate && onNavigate(isOwner ? 'ownerdashboard' : 'tenant-dashboard')} 
                        className={`tenant-nav-pill ${activeTab === 'dashboard' ? 'active' : ''}`}
                    >
                        Dashboard
                    </button>
                    <button 
                        onClick={() => onNavigate && onNavigate(isOwner ? 'owner-properties' : 'browse')} 
                        className={`tenant-nav-pill ${activeTab === 'properties' ? 'active' : ''}`}
                    >
                        Properties
                    </button>
                    <button 
                        onClick={() => onNavigate && onNavigate(isOwner ? 'owner-requests' : 'tenant-requests')} 
                        className={`tenant-nav-pill ${activeTab === 'requests' ? 'active' : ''}`}
                    >
                        Requests
                    </button>
                    <button 
                        onClick={() => onNavigate && onNavigate(isOwner ? 'owner-visits' : 'tenant-visits')} 
                        className={`tenant-nav-pill ${activeTab === 'visits' ? 'active' : ''}`}
                    >
                        Visits
                    </button>
                    <button 
                        onClick={() => onNavigate && onNavigate('tenant-messages')} 
                        className={`tenant-nav-pill ${activeTab === 'messages' ? 'active' : ''}`}
                    >
                        Messages
                    </button>
                    <button 
                        onClick={() => onNavigate && onNavigate('agreements')} 
                        className={`tenant-nav-pill ${activeTab === 'agreements' ? 'active' : ''}`}
                    >
                        Agreements
                    </button>
                    {isOwner ? (
                        <button 
                            onClick={() => onNavigate && onNavigate('owner-payments')} 
                            className={`tenant-nav-pill ${activeTab === 'payments' ? 'active' : ''}`}
                        >
                            Payments
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => onNavigate && onNavigate('tenant-stay')} 
                                className={`tenant-nav-pill ${activeTab === 'leases' ? 'active' : ''}`}
                            >
                                Leases
                            </button>
                            <button 
                                onClick={() => onNavigate && onNavigate('tenant-payments')} 
                                className={`tenant-nav-pill ${activeTab === 'payments' ? 'active' : ''}`}
                            >
                                Payments
                            </button>
                        </>
                    )}
                </nav>

                {/* Right: Search, Notification, Inline Profile Dropdown */}
                <div className="tenant-navbar-right">
                    <div className="tenant-search-wrapper">
                        <svg className="tenant-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                            type="text" 
                            className="tenant-search-input" 
                            placeholder={activeTab === 'messages' ? 'Search conversations...' : 'Search...'} 
                        />
                    </div>

                    <button className="tenant-icon-button" aria-label="Notifications">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span className="tenant-bell-badge"></span>
                    </button>

                    <div className="tenant-user-controls" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div className="tenant-profile-flex" onClick={() => setShowDropdown(!showDropdown)}>
                            <div className="tenant-avatar-wrapper">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User Profile" className="tenant-profile-img" />
                                ) : (
                                    <div className="tenant-profile-initials">
                                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                                    </div>
                                )}
                                <span className="tenant-online-dot"></span>
                            </div>
                            <span className="tenant-profile-name">{user?.name || 'James Wilson'}</span>
                        </div>

                        {showDropdown && (
                            <div className="profile-dropdown" style={{ position: 'absolute', top: '100%', right: '0', marginTop: '12px', background: 'var(--color-background-white)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', overflow: 'hidden', minWidth: '200px', zIndex: 100 }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-main)', marginBottom: '4px' }}>{user?.name || 'User'}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>{user?.email || ''}</div>
                                </div>
                                <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate(isOwner ? 'ownerdashboard' : 'tenant-dashboard'); }} className="dropdown-item-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                                        Dashboard
                                    </button>
                                    <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate(isOwner ? 'owner-requests' : 'tenant-requests'); }} className="dropdown-item-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        Stay requests
                                    </button>
                                    <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate(isOwner ? 'owner-visits' : 'tenant-visits'); }} className="dropdown-item-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        Visits
                                    </button>
                                    {!isOwner && (
                                        <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('tenant-stay'); }} className="dropdown-item-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                            Current stay
                                        </button>
                                    )}
                                    <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('tenant-messages'); }} className="dropdown-item-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        Messages
                                    </button>
                                    <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('agreements'); }} className="dropdown-item-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        Agreements
                                    </button>
                                    {isOwner ? (
                                        <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('owner-payments'); }} className="dropdown-item-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                            Payments & Tracker
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('tenant-stay'); }} className="dropdown-item-btn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                                Current stay
                                            </button>
                                            <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('tenant-payments'); }} className="dropdown-item-btn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                                Payment
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div style={{ padding: '8px' }}>
                                    <button onClick={() => { setShowDropdown(false); logout(); if (onNavigate) onNavigate('browse'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', borderRadius: '6px', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        );
    }

    // Standard Fallback Navbar for Non-Tenant
    return (
        <header className="navbar-container">
            <div className="navbar-left">
                <div className="navbar-logo" onClick={() => onNavigate && onNavigate('browse')} style={{ cursor: 'pointer' }}>
                    <span className="logo-text-bold">Easy</span>
                    <span className="logo-text-light">Rent</span>
                </div>
                <nav className="navbar-links">
                    <button onClick={() => onNavigate && onNavigate('browse')} className="nav-link active">Home</button>
                    <a href="#contact" className="nav-link" style={{ textDecoration: 'none' }}>Contact Us</a>
                </nav>
            </div>
            <div className="navbar-right">
                <button className="icon-button" aria-label="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>
                <button className="icon-button" aria-label="Help">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </button>
                
                {isLoggedIn ? (
                    <div className="user-controls" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                        <div className="profile-wrapper" title={user?.name} onClick={() => setShowDropdown(!showDropdown)} style={{cursor: 'pointer'}}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="User Profile" className="profile-img" />
                            ) : (
                                <div className="profile-initials" style={{backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        {showDropdown && (
                            <div className="profile-dropdown" style={{position: 'absolute', top: '100%', right: '0', marginTop: '12px', background: 'var(--color-background-white)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', overflow: 'hidden', minWidth: '200px', zIndex: 100}}>
                                <div style={{padding: '16px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc'}}>
                                    <div style={{fontWeight: '600', fontSize: '14px', color: 'var(--color-text-main)', marginBottom: '4px'}}>{user?.name || 'User'}</div>
                                    <div style={{fontSize: '12px', color: 'var(--color-text-light)'}}>{user?.email || ''}</div>
                                </div>
                                {isLoggedIn && (
                                    <div style={{padding: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                        <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate(user?.role === 'owner' ? 'ownerdashboard' : 'tenant-dashboard'); }} className="dropdown-item-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                                            Dashboard
                                        </button>
                                        <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate(user?.role === 'owner' ? 'owner-requests' : 'tenant-requests'); }} className="dropdown-item-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            Stay requests
                                        </button>
                                        {user?.role === 'tenant' && (
                                            <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('tenant-stay'); }} className="dropdown-item-btn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                                Current stay
                                            </button>
                                        )}
                                        <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('tenant-messages'); }} className="dropdown-item-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                            Messages
                                        </button>
                                        <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('agreements'); }} className="dropdown-item-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            Agreements
                                        </button>
                                        {user?.role === 'tenant' && (
                                            <button onClick={() => { setShowDropdown(false); if (onNavigate) onNavigate('tenant-payments'); }} className="dropdown-item-btn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                                Payment
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div style={{padding: '8px'}}>
                                    <button onClick={() => { setShowDropdown(false); logout(); if (onNavigate) onNavigate('browse'); }} style={{width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', borderRadius: '6px', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <button className="btn-login-nav" onClick={() => onNavigate && onNavigate('login')}>Log In</button>
                        <button className="btn-signup-nav" onClick={() => onNavigate && onNavigate('signup')}>Sign Up</button>
                        <div className="profile-wrapper empty">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
