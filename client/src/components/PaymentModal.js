import React, { useState } from 'react';
import '../styles/PaymentModal.css';

function PaymentModal({ onClose }) {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        amount: '10'  // Default amount
    });

    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleOverlayClick = (e) => {
        // Only close if the click was on the overlay itself, not the modal content
        if (e.target.className === 'payment-modal-overlay') {
            onClose(0);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format card number with spaces
        if (name === 'cardNumber') {
            const formatted = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || value;
            setFormData({ ...formData, [name]: formatted });
            return;
        }
        
        // Format expiry date
        if (name === 'expiryDate') {
            const formatted = value.replace(/\D/g, '').match(/.{1,2}/g)?.join('/') || value;
            setFormData({ ...formData, [name]: formatted });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setProcessing(true);

        // Simulate processing
        setTimeout(() => {
            setProcessing(false);
            // Fake successful payment
            onClose(parseInt(formData.amount));
        }, 2000);
    };

    const gemPackages = [
        { amount: '10', gems: '100', price: '$9.99' },
        { amount: '25', gems: '300', price: '$24.99' },
        { amount: '50', gems: '700', price: '$49.99' },
        { amount: '100', gems: '1500', price: '$99.99' }
    ];

    return (
        <div className="payment-modal-overlay" onClick={handleOverlayClick}>
            <div className="payment-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={() => onClose(0)}>×</button>
                <div className="payment-modal-header">
                    <h2>Purchase Gems</h2>
                </div>

                <div className="gem-packages">
                    {gemPackages.map((pkg) => (
                        <div 
                            key={pkg.amount}
                            className={`gem-package ${formData.amount === pkg.amount ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, amount: pkg.amount })}
                        >
                            <div className="gem-amount">{pkg.gems} Gems</div>
                            <div className="gem-price">{pkg.price}</div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Card Holder Name</label>
                        <input
                            type="text"
                            name="cardHolder"
                            value={formData.cardHolder}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                maxLength="5"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>CVV</label>
                            <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                placeholder="123"
                                maxLength="3"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button 
                        type="submit" 
                        className={`submit-button ${processing ? 'processing' : ''}`}
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : `Purchase ${gemPackages.find(pkg => pkg.amount === formData.amount)?.gems} Gems`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PaymentModal; 