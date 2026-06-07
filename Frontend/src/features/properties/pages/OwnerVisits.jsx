import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const OwnerVisits = ({ onNavigate }) => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/appointments/owner', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setVisits(data.appointments);
            }
        } catch (err) {
            console.error('Failed to fetch visits:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="owner-requests-layout">
            <Navbar onNavigate={onNavigate} activeTab="visits" />

            <main className="owner-requests-main">
                <div className="owner-requests-header">
                    <div className="header-text-container">
                        <h1 className="owner-title">Property Visits</h1>
                        <p className="owner-subtitle">View and manage scheduled property visits from interested tenants.</p>
                    </div>
                </div>

                <div className="requests-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading scheduled visits...</div>
                    ) : visits.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '64px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>No Visits Scheduled</h3>
                            <p style={{ margin: 0, color: '#64748b' }}>You don't have any property visits scheduled right now.</p>
                        </div>
                    ) : (
                        visits.map(visit => (
                            <div key={visit.id} className="request-card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>{visit.property_title}</h3>
                                    <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px' }}><strong>Tenant:</strong> {visit.tenant_name}</p>
                                    <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px' }}><strong>Phone:</strong> {visit.tenant_phone}</p>
                                    <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px' }}><strong>Date:</strong> {visit.scheduled_date}</p>
                                    <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px' }}><strong>Time:</strong> {visit.scheduled_time}</p>
                                    {visit.message && (
                                        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>"{visit.message}"</p>
                                    )}
                                </div>
                                <div>
                                    <span style={{
                                        display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                                        backgroundColor: '#dcfce7', color: '#166534'
                                    }}>
                                        SCHEDULED
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default OwnerVisits;
