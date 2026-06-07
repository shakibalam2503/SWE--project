import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ScheduleVisitModal from '../components/ScheduleVisitModal';
import './PropertyDetails.css';
import { useProperties } from '../hooks/useProperties';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { useChat } from '../../chat/hooks/useChat';
import { useStayRequests } from '../../stayRequest/hook/useStayRequests';
import toast from 'react-hot-toast';
import NearbyPlacesMap from '../components/NearbyPlacesMap';

const GOOGLE_MAPS_LIBRARIES = ['places'];

const AMENITY_ICONS = {
    "wi-fi":            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    "parking":          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
    "air conditioning": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16l-2 4"/><path d="M16 16l2 4"/><path d="M12 16v4"/><path d="M2 8h20"/><path d="M2 16h20"/><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>,
    "furnished":        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><line x1="2" y1="11" x2="22" y2="11"/></svg>,
    "gym":              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10v4"/><path d="M18 10v4"/><path d="M2.5 12h19"/><path d="M2 8v8"/><path d="M22 8v8"/></svg>,
    "laundry":          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="12" cy="13" r="5"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>,
    "security":         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "lift":             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" ry="2"/><path d="M12 7v10"/><polyline points="9 10 12 7 15 10"/><polyline points="9 14 12 17 15 14"/></svg>,
    "elevator":         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" ry="2"/><path d="M12 7v10"/><polyline points="9 10 12 7 15 10"/><polyline points="9 14 12 17 15 14"/></svg>,
    "generator":        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    "balcony":          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><rect x="2" y="14" width="20" height="6" rx="1"/><line x1="6" y1="14" x2="6" y2="20"/><line x1="10" y1="14" x2="10" y2="20"/><line x1="14" y1="14" x2="14" y2="20"/><line x1="18" y1="14" x2="18" y2="20"/></svg>,
};

const PropertyDetails = ({ onNavigate, isLoggedIn, user, propertyId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [property, setProperty] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const { getPropertyById } = useProperties();
    const { startConversation } = useChat();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    // Stay request state and hook
    const [isStayModalOpen, setIsStayModalOpen] = useState(false);
    const [fullName, setFullName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [moveInDate, setMoveInDate] = useState('');
    const [message, setMessage] = useState("Hello! I'm visiting and would love to stay at your property...");
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { createRequest } = useStayRequests();

    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    
    // Owner reviews state
    const [ownerReviews, setOwnerReviews] = useState([]);
    const [loadingOwnerReviews, setLoadingOwnerReviews] = useState(true);
    const [isOwnerReviewModalOpen, setIsOwnerReviewModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const fetchOwnerReviews = (ownerId) => {
        setLoadingOwnerReviews(true);
        fetch(`/api/owners/${ownerId}/reviews`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOwnerReviews(data.reviews);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingOwnerReviews(false));
    };

    useEffect(() => {
        if (!propertyId) { setLoadingDetail(false); return; }
        getPropertyById(propertyId)
            .then(data => {
                const prop = data.property || data;
                setProperty(prop);
                if (prop && prop.owner_id) {
                    fetchOwnerReviews(prop.owner_id);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingDetail(false));
            
        // Fetch reviews
        fetch(`/api/properties/${propertyId}/reviews`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setReviews(data.reviews);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingReviews(false));
    }, [propertyId]);

    const handleChatNow = async () => {
        if (!isLoggedIn) {
            onNavigate('login');
            return;
        }
        if (!property || !property.owner_id) return;
        try {
            await startConversation(property.id, property.owner_id);
            onNavigate('tenant-messages');
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    const handleStayRequestClick = () => {
        if (!isLoggedIn) {
            onNavigate('login');
            return;
        }
        setIsStayModalOpen(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            onNavigate('login');
            return;
        }
        if (!reviewComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        setSubmittingReview(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/properties/${propertyId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: reviewRating,
                    comment: reviewComment
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Review added successfully!');
                setReviewComment('');
                setReviewRating(5);
                // Refresh reviews
                const reviewsRes = await fetch(`/api/properties/${propertyId}/reviews`);
                const reviewsData = await reviewsRes.json();
                if (reviewsData.success) {
                    setReviews(reviewsData.reviews);
                }
            } else {
                toast.error(data.message || 'Failed to add review');
            }
        } catch (err) {
            toast.error('Failed to add review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleStayRequestSubmit = async (e) => {
        e.preventDefault();
        if (!property || !property.id || !property.owner_id) return;

        setSubmitting(true);
        try {
            await createRequest({
                propertyId: property.id,
                ownerId: property.owner_id,
                message,
                moveInDate
            });
            toast.success('Stay request submitted successfully!', {
                duration: 4000,
                icon: '🚀'
            });
            setIsStayModalOpen(false);
            setMoveInDate('');
            setMessage('');
            setTimeout(() => {
                onNavigate('tenant-requests');
            }, 1000);
        } catch (err) {
            toast.error(err.message || 'Failed to submit stay request.');
        } finally {
            setSubmitting(false);
        }
    };

    const heroImage = property?.images?.[0]?.image_url
        || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

    const averageOwnerRating = ownerReviews.length > 0 
        ? (ownerReviews.reduce((acc, curr) => acc + curr.rating, 0) / ownerReviews.length).toFixed(1) 
        : 0;

    const handleOwnerReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn || user?.role !== 'tenant') return;
        setSubmittingReview(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/owners/${property.owner_id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Owner review submitted successfully!');
                setIsOwnerReviewModalOpen(false);
                setReviewComment('');
                setReviewRating(5);
                fetchOwnerReviews(property.owner_id);
            } else {
                toast.error(data.message || 'Failed to submit owner review');
            }
        } catch (err) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="property-details-page">
            <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} user={user} activeTab="properties" />
            
            <div className="details-container">
                <div className="breadcrumbs">
                    <span className="breadcrumb-link" onClick={() => onNavigate('browse')}>Browse Properties</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    <span className="breadcrumb-current">{property?.title || 'Property Details'}</span>
                </div>

                {loadingDetail ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>Loading property...</div>
                ) : (
                <div className="details-grid">
                    {/* LEFT COLUMN */}
                    <div className="details-main">
                        <div className="hero-section">
                            <img src={heroImage} alt={property?.title} className="hero-image" />
                            <div className="hero-overlay">
                                <h1>{property?.title || 'Property Details'}</h1>
                                <p className="hero-address">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {property?.address}
                                </p>
                                <div className="hero-stats">
                                    <div className="hero-stat-card">
                                        <div className="stat-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                        </div>
                                        <div className="stat-text">
                                            <span className="stat-label">BEDROOMS</span>
                                            <span className="stat-value">{property?.total_bedrooms ?? '—'} Beds</span>
                                        </div>
                                    </div>
                                    <div className="hero-stat-card">
                                        <div className="stat-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                        </div>
                                        <div className="stat-text">
                                            <span className="stat-label">BATHROOMS</span>
                                            <span className="stat-value">{property?.total_bathrooms ?? '—'} Baths</span>
                                        </div>
                                    </div>
                                    {property?.property_size_sqft && (
                                        <div className="hero-stat-card">
                                            <div className="stat-icon">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 4 12 12 12 13 6 3 6"/><path d="M21 21v-8a2 2 0 0 0-2-2h-3"/><path d="M8 21v-4"/><path d="M16 21v-4"/></svg>
                                            </div>
                                            <div className="stat-text">
                                                <span className="stat-label">AREA</span>
                                                <span className="stat-value">{property.property_size_sqft} sqft</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {property?.images?.length > 1 && (
                            <div className="content-section">
                                <h2>Photos</h2>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {property.images.slice(1).map((img, i) => (
                                        <img key={i} src={img.image_url} alt={`Photo ${i + 2}`} style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="content-section">
                            <h2>Description</h2>
                            <p>{property?.description || 'No description provided.'}</p>
                        </div>

                        {property?.amenities?.length > 0 && (
                            <div className="content-section">
                                <h2>Amenities</h2>
                                <div className="amenities-grid">
                                    {property.amenities.map(a => (
                                        <div className="amenity-item" key={a.id}>
                                            {AMENITY_ICONS[a.name.toLowerCase()] || <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}
                                            {a.name.charAt(0).toUpperCase() + a.name.slice(1).replace(/_/g, ' ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="content-section">
                            <h2>Location and Nearby Places</h2>
                            <p style={{ color: '#64748b', marginBottom: '8px' }}>{[property?.area, property?.district, property?.division].filter(Boolean).join(', ')}</p>
                            <NearbyPlacesMap isLoaded={isLoaded} property={property} />
                        </div>
                        {(!isLoggedIn || user?.role !== 'owner') && (
                            <div className="content-section">
                                <h2>Reviews & Ratings</h2>
                                
                                {/* Reviews List */}
                                {loadingReviews ? (
                                    <p style={{ color: '#64748b' }}>Loading reviews...</p>
                                ) : reviews.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                                        {reviews.map(review => (
                                            <div key={review.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{review.reviewer_name || 'Anonymous'}</span>
                                                    <div style={{ display: 'flex', color: '#EAB308' }}>
                                                        {Array(review.rating).fill(0).map((_, i) => <span key={i}>★</span>)}
                                                    </div>
                                                </div>
                                                <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>{review.comment || 'No comment provided.'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#64748b', marginBottom: '32px' }}>No reviews yet. Be the first to leave a review!</p>
                                )}

                                {/* Write Review Form */}
                                {isLoggedIn ? (
                                    <form onSubmit={handleReviewSubmit} style={{ marginTop: '24px', padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Write a Review</h3>
                                        
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Rating</label>
                                            <select 
                                                value={reviewRating} 
                                                onChange={e => setReviewRating(Number(e.target.value))}
                                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '200px' }}
                                            >
                                                <option value={5}>5 - Excellent</option>
                                                <option value={4}>4 - Good</option>
                                                <option value={3}>3 - Average</option>
                                                <option value={2}>2 - Poor</option>
                                                <option value={1}>1 - Terrible</option>
                                            </select>
                                        </div>
                                        
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Your Review</label>
                                            <textarea 
                                                rows="4" 
                                                value={reviewComment}
                                                onChange={e => setReviewComment(e.target.value)}
                                                placeholder="Share your experience with this property..."
                                                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', resize: 'vertical' }}
                                                required
                                            ></textarea>
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            disabled={submittingReview}
                                            style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: submittingReview ? 'not-allowed' : 'pointer', opacity: submittingReview ? 0.7 : 1 }}
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                ) : (
                                    <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                                        <p style={{ margin: 0, color: '#475569' }}>Please <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => onNavigate('login')}>log in</span> to leave a review.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="details-sidebar">
                        {property?.images?.length > 0 && (
                            <div className="sidebar-images">
                                {property.images.slice(0, 2).map((img, i) => (
                                    <img key={i} src={img.image_url} alt={`Side ${i + 1}`} className="side-image" />
                                ))}
                            </div>
                        )}

                        <div className="sticky-sidebar">
                            <div className="pricing-card">
                                <span className="monthly-label">MONTHLY RENT</span>
                                <div className="price-display">
                                    <span className="price">${property?.monthly_rent?.toLocaleString() || '—'}</span>
                                    <span className="period">/mo</span>
                                </div>
                                {property?.owner_name && (
                                    <div className="owner-info-details" style={{ margin: '12px 0 16px 0', padding: '12px', borderRadius: '8px', border: '1px dashed var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="owner-avatar-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                {property.owner_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: '500' }}>PROPERTY OWNER</div>
                                                <div style={{ fontSize: '14px', color: 'var(--color-text-main)', fontWeight: '700' }}>{property.owner_name}</div>
                                                {(!isLoggedIn || user?.role !== 'owner') && (
                                                    ownerReviews.length > 0 ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                                                            <span style={{ color: '#EAB308', display: 'flex', alignItems: 'center' }}>★</span>
                                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{averageOwnerRating}</span>
                                                            <span>({ownerReviews.length} {ownerReviews.length === 1 ? 'review' : 'reviews'})</span>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>No reviews yet</div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        {isLoggedIn && user?.role === 'tenant' && (
                                            <button 
                                                onClick={() => setIsOwnerReviewModalOpen(true)}
                                                style={{ marginTop: '4px', padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                                            >
                                                Rate Owner
                                            </button>
                                        )}
                                    </div>
                                )}
                                
                                {(!isLoggedIn || user?.role !== 'owner') && (
                                    <button className="btn-primary-full" onClick={() => {
                                        if (!isLoggedIn) {
                                            onNavigate('login');
                                            return;
                                        }
                                        setIsModalOpen(true);
                                    }}>Schedule Visit</button>
                                )}
                                
                                {(!isLoggedIn || user?.role !== 'owner') && (
                                    <button 
                                        className="btn-primary-full btn-stay-request" 
                                        onClick={handleStayRequestClick}
                                        style={{ backgroundColor: '#10b981', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                            <polyline points="9 22 9 12 15 12 15 22"/>
                                        </svg>
                                        Request Stay
                                    </button>
                                )}

                                {(!isLoggedIn || user?.role !== 'owner') && (
                                    <>
                                        <button className="btn-outline-full" onClick={handleChatNow}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                            Chat Now
                                        </button>
                                        <p className="response-time">Typical response time: under 2 hours</p>
                                    </>
                                )}
                            </div>

                            <div className="info-banner">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                <p>Demand is high for this area. 4 other people have <strong>viewed this</strong> property in the last 24 hours.</p>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>

            <footer className="page-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <span className="footer-brand font-semibold">EasyRent</span>
                        <p className="copyright">© 2024 EasyRent Management Systems. Precision in Property.</p>
                    </div>
                    <div className="footer-links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#support">Support</a>
                    </div>
                </div>
            </footer>
            
            <ScheduleVisitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} property={property} />
            
            {/* Stay Request Modal */}
            {isStayModalOpen && (
                <div className="stay-modal-overlay" onClick={() => setIsStayModalOpen(false)}>
                    <div className="stay-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="stay-modal-header">
                            <h3>Confirm Your Stay</h3>
                            <button className="stay-modal-close" onClick={() => setIsStayModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleStayRequestSubmit}>
                            <div className="stay-modal-columns">
                                {/* LEFT COLUMN */}
                                <div className="stay-modal-col-left">
                                    <h4 className="column-label">Stay Summary</h4>
                                    <div className="stay-property-summary-card">
                                        <img src={heroImage} alt={property?.title} className="summary-thumb" />
                                        <div className="summary-details">
                                            <h5 className="summary-title">{property?.title}</h5>
                                            <p className="summary-address">{property?.address || '124 Financial District, North Tower'}</p>
                                            <div className="summary-rating">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginLeft: '4px' }}>
                                                    {reviews.length > 0 
                                                        ? `${(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} (${reviews.length} reviews)`
                                                        : 'New property'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="price-breakdown-section">
                                        <h5 className="section-subtitle">Price Breakdown</h5>
                                        <div className="price-row">
                                            <span className="price-label-text">Monthly Rent</span>
                                            <span className="price-value-text">${property?.monthly_rent?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
                                        </div>
                                        <div className="price-row">
                                            <span className="price-label-text">Security Deposit</span>
                                            <span className="price-value-text">${(Number(property?.expected_security_deposit) || (Number(property?.monthly_rent) * 0.5))?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
                                        </div>
                                        <div className="price-divider"></div>
                                        <div className="price-row total">
                                            <span className="total-label-text">Total (USD)</span>
                                            <span className="total-value-text">${(Number(property?.monthly_rent) + (Number(property?.expected_security_deposit) || (Number(property?.monthly_rent) * 0.5)))?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="protection-card">
                                        <div className="protection-header">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                            <span className="protection-title">EasyRent Protection</span>
                                        </div>
                                        <p className="protection-text">Your payment is held securely and only released to the owner 24 hours after you check-in.</p>
                                    </div>
                                </div>
                                
                                {/* RIGHT COLUMN */}
                                <div className="stay-modal-col-right">
                                    <h4 className="column-label">Personal Details</h4>
                                    
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label htmlFor="fullName">Full Name</label>
                                            <input 
                                                type="text" 
                                                id="fullName" 
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email Address</label>
                                            <input 
                                                type="email" 
                                                id="email" 
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input 
                                                type="text" 
                                                id="phone" 
                                                placeholder="+1 (555) 012-3456"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="moveInDate">Move in Date</label>
                                            <input 
                                                type="date" 
                                                id="moveInDate" 
                                                value={moveInDate}
                                                onChange={e => setMoveInDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="message">Message to Owner</label>
                                        <span className="form-label-hint">Introduce yourself and share the purpose of your trip for a faster approval.</span>
                                        <textarea 
                                            id="message" 
                                            rows="4" 
                                            placeholder="Hello! I'm visited you property  and would love to stay at your property..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="checkbox-agreement">
                                        <input 
                                            type="checkbox" 
                                            id="agreeCheckbox" 
                                            checked={agreed}
                                            onChange={e => setAgreed(e.target.checked)}
                                            required
                                        />
                                        <label htmlFor="agreeCheckbox">
                                            I agree to the <a href="#rules" onClick={e => e.preventDefault()}>House Rules</a> and EasyRent's <a href="#terms" onClick={e => e.preventDefault()}>Terms of Service</a>.
                                        </label>
                                    </div>
                                    
                                    <button type="submit" className="btn-send-stay-request" disabled={submitting || !agreed}>
                                        {submitting ? 'Sending Request...' : 'Send Stay Request ▷'}
                                    </button>
                                    
                                    <p className="request-disclaimer">
                                        You won't be charged yet. The owner has 24 hours to accept your request before it expires.
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isOwnerReviewModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setIsOwnerReviewModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setIsOwnerReviewModalOpen(false)}>&times;</button>
                        <div className="modal-header">
                            <h2 style={{ margin: 0 }}>Rate the Owner</h2>
                            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>Share your experience interacting with {property?.owner_name}.</p>
                        </div>
                        
                        <div style={{ padding: '24px' }}>
                            <form onSubmit={handleOwnerReviewSubmit}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Rating</label>
                                    <select 
                                        value={reviewRating} 
                                        onChange={e => setReviewRating(Number(e.target.value))}
                                        style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', fontSize: '15px' }}
                                    >
                                        <option value={5}>5 - Excellent</option>
                                        <option value={4}>4 - Good</option>
                                        <option value={3}>3 - Average</option>
                                        <option value={2}>2 - Poor</option>
                                        <option value={1}>1 - Terrible</option>
                                    </select>
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Review Comment (Optional)</label>
                                    <textarea 
                                        rows="4" 
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        placeholder="How was the owner's communication and responsiveness?"
                                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', resize: 'vertical', fontSize: '15px' }}
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={submittingReview}
                                    style={{ width: '100%', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '16px', cursor: submittingReview ? 'not-allowed' : 'pointer', opacity: submittingReview ? 0.7 : 1 }}
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetails;
