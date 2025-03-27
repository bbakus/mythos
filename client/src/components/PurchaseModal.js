import React from 'react';
import '../styles/PurchaseModal.css';

const PurchaseModal = ({ isOpen, onClose, cardName, cardImage, multipleCards }) => {
  if (!isOpen) return null;
  
  const handleOverlayClick = (e) => {
    // Only close if the click was on the overlay itself, not the modal content
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="purchase-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="modal-content">
          <h2>Purchase Complete!</h2>
          <p>You bought <span className="card-name">{cardName}</span>!</p>
          
          {multipleCards ? (
            <div className="modal-multiple-images">
              {multipleCards.map((card, index) => (
                <div key={index} className="modal-image-container">
                  <img src={card.image} alt={card.name} className="modal-card-image" />
                  <p className="modal-card-name">{card.name}</p>
                </div>
              ))}
            </div>
          ) : cardImage ? (
            <div className="modal-image-container">
              <img src={cardImage} alt={cardName} className="modal-card-image" />
            </div>
          ) : null}
          
          <button className="modal-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal; 