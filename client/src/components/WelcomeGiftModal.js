import React, { useState } from 'react';
import '../styles/WelcomeGiftModal.css';

function WelcomeGiftModal({ onClose }) {
    const [isOpened, setIsOpened] = useState(false);
    const [showGems, setShowGems] = useState(false);

    const handleOpenChest = () => {
        if (!isOpened) {
            setIsOpened(true);
            setTimeout(() => {
                setShowGems(true);
            }, 1000);
        }
    };

    return (
        <div className="welcome-gift-modal-overlay">
            <div className="welcome-gift-modal">
                <h2>Welcome to Mythos!</h2>
                <p>A gift awaits you...</p>
                
                <div className={`treasure-chest ${isOpened ? 'opened' : ''}`} onClick={handleOpenChest}>
                    <div className="chest-lid"></div>
                    <div className="chest-base"></div>
                    {showGems && (
                        <div className="gems-container">
                            <div className="gems-animation">
                                <span className="gem-value">+100</span>
                                <span className="gem-text">GEMS</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {showGems && (
                    <div className="welcome-message">
                        <p>You've received 100 gems!</p>
                        <p>Use them wisely in the Marketplace to build your collection.</p>
                        <button className="continue-btn" onClick={onClose}>Continue to Dashboard</button>
                    </div>
                )}
                
                {!showGems && (
                    <p className="click-prompt">Click the chest to open your gift!</p>
                )}
            </div>
        </div>
    );
}

export default WelcomeGiftModal; 