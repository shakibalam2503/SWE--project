import React, { useRef } from 'react';

const Step4Images = ({ data, updateData, onPrev, onSubmit, loading }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files?.length > 0) {
            updateData({ files: [...(data.files || []), ...Array.from(e.target.files)] });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length > 0) {
            updateData({ files: [...(data.files || []), ...Array.from(e.dataTransfer.files)] });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div>
            <div className="wide-two-col-layout">
                {/* Left: upload + photo grid */}
                <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div 
                        className="upload-dropzone-wide"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <div className="upload-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </div>
                        <h3 className="upload-title">Drag and drop photos</h3>
                        <p className="upload-desc">
                            Add at least 5 high-quality photos of your property.<br />
                            Drag to reorder. Supported formats: JPG, PNG, WEBP.
                        </p>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*" onChange={handleFileChange} />
                        <button className="btn-wide-solid" onClick={() => fileInputRef.current?.click()}>Browse Files</button>
                    </div>

                    <div className="photos-panel">
                        <div className="photos-panel-header">
                            <span>Uploaded Photos ({data.files?.length || 0})</span>
                            <span className="link-text">Select All</span>
                        </div>
                        <div className="photo-grid-wide">
                            {data.files?.length > 0 ? data.files.map((file, i) => (
                                <div key={i} className={`photo-thumb-wide ${i === 0 ? 'is-main' : ''}`}>
                                    <img src={URL.createObjectURL(file)} alt={`Upload ${i}`} />
                                    {i === 0 && <span className="main-badge">MAIN</span>}
                                </div>
                            )) : (
                                <>
                                    <div className="photo-thumb-wide is-main photo-empty"><span className="main-badge">MAIN</span></div>
                                    <div className="photo-thumb-wide photo-empty"></div>
                                    <div className="photo-thumb-wide photo-empty"></div>
                                    <div className="photo-thumb-wide photo-empty"></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: guidelines */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="wide-content-card">
                        <h3 className="wide-card-title">Photo Guidelines</h3>
                        {[
                            { title: 'Use Natural Light', desc: 'Shoot during the day for the best clarity and warmth.' },
                            { title: 'Landscape Orientation', desc: 'Horizontal photos look better in search results and sliders.' },
                            { title: 'Key Spaces First', desc: 'Make sure to include the kitchen, bedroom, and bathroom.' }
                        ].map(g => (
                            <div className="guideline-row" key={g.title}>
                                <div className="guideline-check">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <div>
                                    <div className="guideline-title">{g.title}</div>
                                    <div className="guideline-desc">{g.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="tip-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <div className="tip-text"><strong>Did you know?</strong> Listings with more than 10 photos get 45% more inquiries on average.</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="wide-step-footer">
                <button className="btn-wide-outline" onClick={onPrev}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back
                </button>
                <div className="footer-right-group">
                    <button className="btn-wide-ghost">Save as Draft</button>
                    <button className="btn-wide-solid" onClick={onSubmit} disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Listing'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step4Images;
