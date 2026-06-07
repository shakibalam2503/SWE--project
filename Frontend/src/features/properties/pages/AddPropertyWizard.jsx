import React, { useState } from 'react';
import AddPropertyLayout from './AddPropertyLayout';
import Step1BasicInfo from '../components/Step1BasicInfo';
import Step2Specifications from '../components/Step2Specifications';
import Step3AmenitiesLocation from '../components/Step3AmenitiesLocation';
import Step4Images from '../components/Step4Images';
import { useProperties } from '../hooks/useProperties';
import toast from 'react-hot-toast';
import './AddPropertyWizard.css';

const AddPropertyWizard = ({ onNavigate }) => {
    const { createProperty, loading } = useProperties();
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        listing_type: 'full_property',
        property_type: 'apartment',
        description: '',
        available_from: '',
        total_bedrooms: 2,
        total_bathrooms: 1,
        total_units: 1,
        monthly_rent: '',
        expected_security_deposit: '',
        amenities: [],
        address: '',
        local_area: '',
        area: '', // Represents Sq Ft property size in specifications
        district: '',
        division: '',
        latitude: null,
        longitude: null,
        files: []
    });

    const updateFormData = (fields) => {
        setFormData(prev => ({ ...prev, ...fields }));
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async () => {
        try {
            await createProperty(formData);
            toast.success('Property created successfully!');
            onNavigate('ownerdashboard');
        } catch (error) {
            toast.error(error.message || 'Failed to create property');
        }
    };

    const stepMeta = [
        { title: 'Add New Property', counterLabel: 'Step 1 of 4' },
        { title: 'Property Specifications', counterLabel: '50%', prefixLabel: 'STEP 2 OF 4' },
        { title: 'Amenities & Location', counterLabel: '75% Complete', prefixLabel: 'Step 3 of 4: Amenities & Location' },
        { title: 'Add Images', counterLabel: 'Last saved', prefixLabel: 'STEP 4 OF 4' }
    ];

    const meta = stepMeta[currentStep - 1];
    const isFullPage = currentStep > 1;
    const progressPercent = (currentStep / 4) * 100;

    const sharedProps = {
        data: formData,
        updateData: updateFormData,
        onNext: nextStep,
        onPrev: prevStep,
        onSubmit: handleSubmit,
        loading,
        onCancel: () => onNavigate('ownerdashboard')
    };

    return (
        <AddPropertyLayout>
            {isFullPage ? (
                /* Full-page layout for Steps 2, 3, 4 */
                <div className="wide-wizard-wrapper">
                    {/* Top header bar */}
                    <div className="wide-step-header">
                        <div className="wide-step-title-row">
                            <div>
                                {meta.prefixLabel && <span className="wide-step-prefix">{meta.prefixLabel}</span>}
                                <h2 className="wide-step-title">{meta.title}</h2>
                            </div>
                            <span className="wide-step-counter">{meta.counterLabel}</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    {/* Step content */}
                    {currentStep === 2 && <Step2Specifications {...sharedProps} />}
                    {currentStep === 3 && <Step3AmenitiesLocation {...sharedProps} />}
                    {currentStep === 4 && <Step4Images {...sharedProps} />}

                    {/* Footer */}
                    <footer className="wizard-page-footer">
                        <span className="footer-brand">© 2024 EasyRent Management Systems</span>
                        <div className="footer-links">
                            <span>Support</span>
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                        </div>
                    </footer>
                </div>
            ) : (
                /* Narrow card layout for Step 1 */
                <div className="wizard-card-wrapper">
                    <div className="wizard-card">
                        <div className="wizard-step-header">
                            <div className="step-title-row">
                                <h2 className="step-title">{meta.title}</h2>
                                <span className="step-counter">{meta.counterLabel}</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                        <div className="wizard-step-content">
                            <Step1BasicInfo {...sharedProps} />
                        </div>
                    </div>
                </div>
            )}
        </AddPropertyLayout>
    );
};

export default AddPropertyWizard;
