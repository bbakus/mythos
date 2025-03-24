import React from 'react';

function EnemyLane({
    style,
    card,
    gamePhase,
    isAttacking,
    isDestroyed
}) {
    return (
        <div 
            className={`lane enemy-lane ${card ? 'occupied' : 'empty'} ${isAttacking ? 'attacking' : ''}`}
            style={style}
        >
            {card && (
                <div className={`placed-card enemy-card 
                    ${gamePhase === 'battle' ? 'revealed' : ''} 
                    ${isAttacking ? 'attacking-card' : ''} 
                    ${isDestroyed ? 'destroyed-card' : ''}`}
                >
                    <img 
                        className="card-full-image" 
                        src={card.image} 
                        alt={card.name} 
                    />
                </div>
            )}
        </div>
    );
}

export default EnemyLane; 