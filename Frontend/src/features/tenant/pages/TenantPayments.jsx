import React, { useState, useEffect, useCallback } from 'react';
import './TenantPayments.css';
import Navbar from '../../properties/components/Navbar';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/hooks/useAuth';

const TenantPayments = ({ onNavigate }) => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [approvedStay, setApprovedStay] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [bkashNumber, setBkashNumber] = useState('');
    const [paymentMonth, setPaymentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [checkoutStatus, setCheckoutStatus] = useState('idle');
    const [txnRef, setTxnRef] = useState('');

    const fetchPaymentHistory = useCallback(async () => {
        try {
            const res = await fetch('/api/payments/my');
            const data = await res.json();
            if (res.ok) setPayments(data.payments || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPayments(false);
        }
    }, []);

    const fetchApprovedStay = useCallback(async () => {
        try {
            const res = await fetch('/api/stay-request/my');
            const data = await res.json();
            if (res.ok) {
                const approved = (data.requests || []).find(r => r.status === 'approved');
                setApprovedStay(approved || null);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        fetchPaymentHistory();
        fetchApprovedStay();
    }, [fetchPaymentHistory, fetchApprovedStay]);

    const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.amount), 0);

    const monthlyRent = parseFloat(approvedStay?.monthly_rent || 0);

    const currentMonthTotalPaid = payments
        .filter(p => p.payment_month === paymentMonth && p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const currentMonthRemaining = Math.max(0, monthlyRent - currentMonthTotalPaid);
    
    const currentMonthFullyPaid = currentMonthRemaining <= 0 && monthlyRent > 0;

    const handleBkashSubmit = async (e) => {
        e.preventDefault();
        if (!approvedStay) {
            toast.error('No active lease found. You need an approved stay request to pay rent.');
            return;
        }
        if (bkashNumber.length < 11) {
            toast.error('Enter a valid 11-digit bKash number.');
            return;
        }
        if (currentMonthFullyPaid) {
            toast.error(`Rent for ${paymentMonth} is already fully paid.`);
            return;
        }

        setCheckoutStatus('processing');
        try {
            const res = await fetch('/api/payments/bkash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: approvedStay.property_id,
                    amount: currentMonthRemaining,
                    paymentMonth,
                    bkashNumber,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setTxnRef(data.payment?.transaction_id || 'TXN-SUCCESS');
            setCheckoutStatus('success');
            await fetchPaymentHistory();
            setTimeout(() => {
                setShowModal(false);
                setCheckoutStatus('idle');
                setBkashNumber('');
                toast.success('🎉 Rent paid successfully via bKash!');
            }, 3000);
        } catch (err) {
            setCheckoutStatus('idle');
            toast.error(err.message || 'Payment failed. Try again.');
        }
    };

    const formatMonth = (m) => {
        if (!m) return '-';
        const [y, mo] = m.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[parseInt(mo)-1]} ${y}`;
    };

    return (
        <div className="tenant-payments-layout">
            <Navbar onNavigate={onNavigate} activeTab="payments" />
            
            <main className="tenant-payments-main">
                <div className="payments-header">
                    <div>
                        <h1 className="payments-heading">Rent Payments &amp; Billing</h1>
                        <p className="payments-subheading">Pay your monthly rent via bKash and view your complete payment history.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => onNavigate('tenant-dashboard')} className="btn-back-dashboard">
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Summary Banner */}
                <div className="billing-banner-flex">
                    <div className="billing-stat-box">
                        <span className="label">Total Rent Paid</span>
                        <h2 className="balance-val success-color">৳{totalPaid.toLocaleString()}</h2>
                        <p className="desc">{payments.length} payment{payments.length !== 1 ? 's' : ''} recorded</p>
                    </div>
                    {approvedStay ? (
                        <div className="billing-stat-box">
                            <span className="label">Current Property</span>
                            <h2 className="balance-val" style={{ fontSize: '20px' }}>{approvedStay.property_title || approvedStay.title || 'Active Lease'}</h2>
                            <p className="desc">Monthly rent: ৳{monthlyRent.toLocaleString()}</p>
                        </div>
                    ) : (
                        <div className="billing-stat-box">
                            <span className="label">Current Property</span>
                            <h2 className="balance-val" style={{ fontSize: '16px', color: '#94a3b8' }}>No active lease</h2>
                            <p className="desc">Get an approved stay request to pay rent</p>
                        </div>
                    )}
                    <div className="billing-actions">
                        {currentMonthFullyPaid ? (
                            <div className="paid-this-month">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Rent fully paid for {formatMonth(paymentMonth)}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                {currentMonthTotalPaid > 0 && (
                                    <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '500' }}>
                                        Partial: ৳{currentMonthTotalPaid.toLocaleString()} paid, ৳{currentMonthRemaining.toLocaleString()} remaining
                                    </span>
                                )}
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="btn-pay-outstanding"
                                    disabled={!approvedStay}
                                    title={!approvedStay ? 'Need an active approved lease to pay rent' : ''}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                    Pay {currentMonthTotalPaid > 0 ? 'Remaining' : 'Rent'} via bKash
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment History */}
                <div className="invoices-section-card">
                    <h2>Payment History</h2>
                    <div className="table-responsive-wrapper">
                        {loadingPayments ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Loading payment history...</div>
                        ) : payments.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                <p style={{ fontWeight: 600, marginBottom: 6 }}>No payments yet</p>
                                <p style={{ fontSize: 14 }}>Pay your rent via bKash and it will appear here.</p>
                            </div>
                        ) : (
                            <table className="invoices-table">
                                <thead>
                                    <tr>
                                        <th>Txn ID</th>
                                        <th>Property</th>
                                        <th>Month</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id}>
                                            <td className="font-bold" style={{ fontSize: 12, fontFamily: 'monospace' }}>{p.transaction_id || p.id.slice(0, 8)}</td>
                                            <td>{p.property_title || '-'}</td>
                                            <td>{formatMonth(p.payment_month)}</td>
                                            <td className="font-medium">৳{parseFloat(p.amount).toLocaleString()}</td>
                                            <td>
                                                <span className={`status-pill ${p.payment_type === 'bkash' ? 'status-bkash' : 'status-cash'}`}>
                                                    {p.payment_type === 'bkash' ? '📱 bKash' : '💵 Cash'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-pill status-${p.status}`}>{p.status}</span>
                                            </td>
                                            <td style={{ fontSize: 13 }}>{new Date(p.paid_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* bKash Payment Modal */}
            {showModal && (
                <div className="checkout-modal-overlay">
                    <div className="checkout-modal-card">
                        {checkoutStatus === 'idle' && (
                            <>
                                <div className="modal-header">
                                    <div>
                                        <h3>Pay Rent via bKash</h3>
                                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>EasyRentBD Secure Payment</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="btn-close-modal">×</button>
                                </div>

                                <div className="bkash-gateway-banner">
                                    <div className="bkash-logo-area">
                                        <div className="bkash-logo-circle">b</div>
                                        <div>
                                            <span className="bkash-brand">bKash</span>
                                            <span className="bkash-tagline">Secure Mobile Payment</span>
                                        </div>
                                    </div>
                                    <div className="bkash-amount-display">
                                        <span>Amount</span>
                                        <strong>৳{currentMonthRemaining.toLocaleString()}</strong>
                                    </div>
                                </div>

                                <div className="invoice-preview-bar">
                                    <div>
                                        <p className="invoice-desc">
                                            {approvedStay?.property_title || 'Property Rent'} — {formatMonth(paymentMonth)}
                                        </p>
                                        <p className="invoice-total">Owner: {approvedStay?.owner_name || 'Landlord'}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Payment Month</label>
                                        <input
                                            type="month"
                                            value={paymentMonth}
                                            onChange={e => setPaymentMonth(e.target.value)}
                                            style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                                        />
                                    </div>
                                </div>

                                <form onSubmit={handleBkashSubmit} className="checkout-form">
                                    <div className="bkash-fields-container">
                                        <div className="form-group-full">
                                            <label className="input-label">Your bKash Account Number</label>
                                            <input
                                                type="tel"
                                                required
                                                maxLength="11"
                                                className="modal-input text-center bkash-input"
                                                placeholder="017XXXXXXXX"
                                                value={bkashNumber}
                                                onChange={(e) => setBkashNumber(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>
                                        <p className="wallet-disclaimer">
                                            A dummy OTP confirmation will be sent. This is a simulated bKash gateway — no real money is transferred.
                                        </p>
                                    </div>

                                    <button type="submit" className="btn-modal-checkout bkash-pay-btn">
                                        <span>Pay ৳{currentMonthRemaining.toLocaleString()} via bKash</span>
                                    </button>
                                    
                                    <div className="checkout-trust-flex">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        <span>Simulated bKash Gateway · EasyRentBD Demo</span>
                                    </div>
                                </form>
                            </>
                        )}

                        {checkoutStatus === 'processing' && (
                            <div className="checkout-status-pane">
                                <div className="bkash-processing-logo">b</div>
                                <div className="payment-spinner"></div>
                                <h4>Processing bKash Payment...</h4>
                                <p>Connecting to bKash gateway. Please wait.</p>
                            </div>
                        )}

                        {checkoutStatus === 'success' && (
                            <div className="checkout-status-pane">
                                <div className="success-scale-checkmark">
                                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                                        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                    </svg>
                                </div>
                                <h4 className="success-heading">Payment Successful!</h4>
                                <p className="success-text">Rent paid via bKash. Transaction ID: <strong>{txnRef}</strong></p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantPayments;
