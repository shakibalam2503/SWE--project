import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './ScheduleVisitModal.css';

const ScheduleVisitModal = ({ isOpen, onClose, property }) => {
    const getNextDays = () => {
        const days = [];
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        for (let i = 1; i <= 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({
                day: dayNames[d.getDay()],
                date: d.getDate().toString(),
                fullDate: d.toISOString().split('T')[0]
            });
        }
        return days;
    };

    const [dates] = useState(getNextDays());
    const [selectedDateObj, setSelectedDateObj] = useState(dates[0]);
    const [selectedTime, setSelectedTime] = useState('10:30 AM');
    
    // User info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const u = JSON.parse(userStr);
                    setName(u.name || '');
                    setEmail(u.email || '');
                    setPhone(u.phone || '');
                } catch (e) {}
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const times = [
        '9:00 AM', '10:30 AM', '1:00 PM',
        '2:30 PM', '4:00 PM', '5:30 PM'
    ];

    const handleSubmit = async () => {
        if (!property) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    propertyId: property.id,
                    scheduledDate: selectedDateObj.fullDate,
                    scheduledTime: selectedTime,
                    message: message || `Hi, I am ${name}. I would like to schedule a visit.`
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Visit scheduled successfully!');
                onClose();
            } else {
                toast.error(data.message || 'Failed to schedule visit');
            }
        } catch (err) {
            toast.error('Failed to schedule visit');
        } finally {
            setSubmitting(false);
        }
    };

    const propertyImage = property?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Schedule a Visit</h2>
                    <button className="btn-close-modal" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="property-snippet">
                        <img src={propertyImage} alt="Property" className="snippet-img" />
                        <div className="snippet-info">
                            <h4>{property?.title || 'Property'}</h4>
                            <p>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {property?.address || 'Address'}
                            </p>
                        </div>
                    </div>

                    <div className="form-section">
                        <h5 className="section-label">SELECT DATE</h5>
                        <div className="dates-row">
                            {dates.map((d, i) => (
                                <button 
                                    key={i} 
                                    className={`date-btn ${selectedDateObj.fullDate === d.fullDate ? 'active' : ''}`}
                                    onClick={() => setSelectedDateObj(d)}
                                >
                                    <span className="date-day">{d.day}</span>
                                    <span className="date-num">{d.date}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <h5 className="section-label">AVAILABLE TIME SLOTS</h5>
                        <div className="times-grid">
                            {times.map((t, i) => (
                                <button 
                                    key={i}
                                    className={`time-btn ${selectedTime === t ? 'active' : ''}`}
                                    onClick={() => setSelectedTime(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <h5 className="section-label">PERSONAL DETAILS</h5>
                        <div className="personal-details-grid">
                            <input type="text" className="form-input full-width" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                            <input type="email" className="form-input half-width" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                            <input type="tel" className="form-input half-width" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                            <textarea className="form-input full-width" rows="2" placeholder="Message (optional)" value={message} onChange={e => setMessage(e.target.value)}></textarea>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-confirm-schedule" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M10 14l2 2 4-4"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleVisitModal;
