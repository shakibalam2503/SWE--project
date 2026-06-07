import React, { useState, useEffect, useCallback } from 'react';
import './OwnerPayments.css';
import Navbar from '../../properties/components/Navbar';
import toast from 'react-hot-toast';

const OwnerPayments = ({ onNavigate }) => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCashModal, setShowCashModal] = useState(false);

    // Cash form state
    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [cashForm, setCashForm] = useState({
        propertyId: '',
        tenantId: '',
        amount: '',
        paymentMonth: (() => {
            const n = new Date();
            return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
        })(),
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payments/owner');
            const data = await res.json();
            if (res.ok) {
                setPayments(data.payments || []);
                setStats(data.stats || null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOwnerProperties = useCallback(async () => {
        try {
            const res = await fetch('/api/properties/my-properties');
            const data = await res.json();
            if (res.ok) setProperties(data.properties || []);
        } catch (e) {}
    }, []);

    const fetchApprovedTenants = useCallback(async () => {
        try {
            const res = await fetch('/api/stay-request/owner');
            const data = await res.json();
            if (res.ok) {
                const approved = (data.requests || []).filter(r => r.status === 'approved');
                setTenants(approved);
            }
        } catch (e) {}
    }, []);

    useEffect(() => {
        fetchPayments();
        fetchOwnerProperties();
        fetchApprovedTenants();
    }, [fetchPayments, fetchOwnerProperties, fetchApprovedTenants]);

    const handleCashSubmit = async (e) => {
        e.preventDefault();
        if (!cashForm.propertyId || !cashForm.tenantId || !cashForm.amount || !cashForm.paymentMonth) {
            toast.error('Please fill all required fields.');
            return;
        }
        if (selectedMonthFullyPaid) {
            toast.error('Rent is already fully paid for this month.');
            return;
        }
        const enteredAmount = parseFloat(cashForm.amount);
        if (enteredAmount > selectedMonthRemaining) {
            toast.error(`Amount exceeds remaining rent of ৳${selectedMonthRemaining.toLocaleString()}.`);
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/payments/cash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: cashForm.propertyId,
                    tenantId: cashForm.tenantId,
                    amount: enteredAmount,
                    paymentMonth: cashForm.paymentMonth,
                    notes: cashForm.notes,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success('Cash payment recorded successfully!');
            setShowCashModal(false);
            setCashForm(f => ({ ...f, amount: '', notes: '' }));
            await fetchPayments();
        } catch (err) {
            toast.error(err.message || 'Failed to record payment.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatMonth = (m) => {
        if (!m) return '-';
        const [y, mo] = m.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[parseInt(mo)-1]} ${y}`;
    };

    // Group payments by month for tracker view
    const paymentsByMonth = payments.reduce((acc, p) => {
        const key = p.payment_month;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
    }, {});
    const sortedMonths = Object.keys(paymentsByMonth).sort().reverse();

    // Calculate remaining and total paid for selected property + tenant + month in Cash form
    const selectedTenantRecord = tenants.find(
        t => t.property_id === cashForm.propertyId && t.tenant_id === cashForm.tenantId
    );

    const propertyMonthlyRent = selectedTenantRecord ? parseFloat(selectedTenantRecord.monthly_rent || 0) : 0;

    const selectedMonthTotalPaid = payments
        .filter(
            p =>
                p.property_id === cashForm.propertyId &&
                p.tenant_id === cashForm.tenantId &&
                p.payment_month === cashForm.paymentMonth &&
                p.status === 'completed'
        )
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const selectedMonthRemaining = Math.max(0, propertyMonthlyRent - selectedMonthTotalPaid);
    const selectedMonthFullyPaid = selectedMonthRemaining <= 0 && propertyMonthlyRent > 0;

    return (
        <div className="owner-payments-layout">
            <Navbar onNavigate={onNavigate} activeTab="payments" />

            <main className="owner-payments-main">
                <div className="op-header">
                    <div>
                        <h1 className="op-heading">Rent Tracker & Payments</h1>
                        <p className="op-subheading">Track all rent payments — both bKash (tenant-initiated) and cash (your records).</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-add-cash" onClick={() => setShowCashModal(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Cash Payment
                        </button>
                        <button onClick={() => onNavigate('ownerdashboard')} className="btn-back-dashboard">
                            ← Dashboard
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                {stats && (
                    <div className="op-stats-row">
                        <div className="op-stat-card">
                            <span className="op-stat-label">Total Collected</span>
                            <span className="op-stat-value">৳{parseFloat(stats.total_collected || 0).toLocaleString()}</span>
                        </div>
                        <div className="op-stat-card">
                            <span className="op-stat-label">This Month</span>
                            <span className="op-stat-value">৳{parseFloat(stats.this_month_total || 0).toLocaleString()}</span>
                            <span className="op-stat-sub">{stats.this_month_count || 0} payments</span>
                        </div>
                        <div className="op-stat-card bkash">
                            <span className="op-stat-label">📱 bKash Received</span>
                            <span className="op-stat-value">৳{parseFloat(stats.bkash_total || 0).toLocaleString()}</span>
                        </div>
                        <div className="op-stat-card cash">
                            <span className="op-stat-label">💵 Cash Received</span>
                            <span className="op-stat-value">৳{parseFloat(stats.cash_total || 0).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Rent Tracker Table */}
                <div className="op-section-card">
                    <h2 className="op-section-title">Payment History</h2>
                    {loading ? (
                        <div className="op-loading">Loading payments...</div>
                    ) : payments.length === 0 ? (
                        <div className="op-empty">
                            <p>No payments recorded yet.</p>
                            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Record cash payments or wait for tenants to pay via bKash.</p>
                        </div>
                    ) : (
                        <div className="op-tracker">
                            {sortedMonths.map(month => (
                                <div key={month} className="op-month-block">
                                    <div className="op-month-header">
                                        <span className="op-month-label">{formatMonth(month)}</span>
                                        <span className="op-month-total">
                                            ৳{paymentsByMonth[month].reduce((s, p) => s + parseFloat(p.amount), 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="op-payments-list">
                                        {paymentsByMonth[month].map(p => (
                                            <div key={p.id} className="op-payment-row">
                                                <div className="op-payment-info">
                                                    <span className={`op-method-badge ${p.payment_type}`}>
                                                        {p.payment_type === 'bkash' ? '📱 bKash' : '💵 Cash'}
                                                    </span>
                                                    <div className="op-payment-details">
                                                        <span className="op-tenant-name">{p.tenant_name}</span>
                                                        <span className="op-property-name">{p.property_title}</span>
                                                        {p.notes && <span className="op-notes">Note: {p.notes}</span>}
                                                    </div>
                                                </div>
                                                <div className="op-payment-right">
                                                    <span className="op-amount">৳{parseFloat(p.amount).toLocaleString()}</span>
                                                    <span className="op-date">{new Date(p.paid_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Cash Payment Modal */}
            {showCashModal && (
                <div className="op-modal-overlay">
                    <div className="op-modal-card">
                        <div className="op-modal-header">
                            <h3>Record Cash Payment</h3>
                            <button onClick={() => setShowCashModal(false)} className="btn-close-modal">×</button>
                        </div>
                        <form onSubmit={handleCashSubmit} className="op-modal-form">
                            <div className="op-form-group">
                                <label>Property *</label>
                                <select
                                    required
                                    value={cashForm.propertyId}
                                    onChange={e => {
                                        const propertyIdVal = e.target.value;
                                        setCashForm(f => {
                                            const updated = { ...f, propertyId: propertyIdVal };
                                            if (propertyIdVal && f.tenantId) {
                                                const match = tenants.find(
                                                    t => t.tenant_id === f.tenantId && t.property_id === propertyIdVal
                                                );
                                                if (!match) {
                                                    updated.tenantId = '';
                                                }
                                            }
                                            return updated;
                                        });
                                    }}
                                >
                                    <option value="">Select property...</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="op-form-group">
                                <label>Tenant *</label>
                                <select
                                    required
                                    value={cashForm.tenantId}
                                    onChange={e => {
                                        const tenantIdVal = e.target.value;
                                        setCashForm(f => {
                                            const updated = { ...f, tenantId: tenantIdVal };
                                            if (tenantIdVal) {
                                                const record = tenants.find(t => t.tenant_id === tenantIdVal);
                                                if (record) {
                                                    updated.propertyId = record.property_id;
                                                }
                                            }
                                            return updated;
                                        });
                                    }}
                                >
                                    <option value="">Select tenant...</option>
                                    {tenants
                                        .filter(t => !cashForm.propertyId || t.property_id === cashForm.propertyId)
                                        .map(t => (
                                            <option key={t.tenant_id} value={t.tenant_id}>
                                                {t.tenant_name} — {t.title}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="op-form-row">
                                <div className="op-form-group">
                                    <label>Amount (৳) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        placeholder={selectedMonthRemaining > 0 ? `Max ৳${selectedMonthRemaining}` : "e.g. 12000"}
                                        value={cashForm.amount}
                                        disabled={selectedMonthFullyPaid}
                                        onChange={e => setCashForm(f => ({ ...f, amount: e.target.value }))}
                                    />
                                </div>
                                <div className="op-form-group">
                                    <label>Payment Month *</label>
                                    <input
                                        type="month"
                                        required
                                        value={cashForm.paymentMonth}
                                        onChange={e => setCashForm(f => ({ ...f, paymentMonth: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {selectedTenantRecord && (
                                <div className="op-modal-info-banner">
                                    <div className="info-row">
                                        <span>Monthly Rent:</span>
                                        <strong>৳{propertyMonthlyRent.toLocaleString()}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>Paid for {formatMonth(cashForm.paymentMonth)}:</span>
                                        <span className={selectedMonthFullyPaid ? "text-success font-bold" : "font-medium"}>
                                            ৳{selectedMonthTotalPaid.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span>Remaining:</span>
                                        <strong className={selectedMonthFullyPaid ? "text-success" : "text-warning"}>
                                            ৳{selectedMonthRemaining.toLocaleString()}
                                        </strong>
                                    </div>
                                    {selectedMonthFullyPaid && (
                                        <div className="fully-paid-alert">
                                            ⚠️ Rent is already fully paid for this month.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="op-form-group">
                                <label>Notes (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Received in person, late payment..."
                                    value={cashForm.notes}
                                    onChange={e => setCashForm(f => ({ ...f, notes: e.target.value }))}
                                />
                            </div>
                            <div className="op-modal-footer">
                                <button type="button" onClick={() => setShowCashModal(false)} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-record-cash" disabled={submitting || selectedMonthFullyPaid}>
                                    {submitting ? 'Recording...' : '💵 Record Cash Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerPayments;
