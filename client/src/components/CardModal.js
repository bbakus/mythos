import React from 'react';
import '../styles/CardModal.css';

function CardModal({ card, onClose }) {
    if (!card) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{card.name}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <img src={card.image} alt={card.name} className="modal-card-image"/>
                    <div className="card-stats">
                        <div className="stat">
                            <span className="label">Power:</span>
                            <span className="value">{card.power}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Cost:</span>
                            <span className="value">{card.cost}</span>
                        </div>
                        {card.thief && <div className="special-ability">Thief</div>}
                        {card.guard && <div className="special-ability">Guard</div>}
                        {card.curse && <div className="special-ability">Curse</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardModal; 