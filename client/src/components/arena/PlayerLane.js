import React from 'react';

function PlayerLane({
    style,
    card,
    gamePhase,
    isPlayerTurn,
    isAttacking,
    isDestroyed,
    onDragOver,
    onDrop,
    onRetractCard
}) {
    return (
        <div 
            className={`lane player-lane ${card ? 'occupied' : 'empty'} ${isPlayerTurn && gamePhase === 'placement' ? 'active-turn' : ''} ${isAttacking ? 'attacking' : ''}`}
            style={style}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {card && (
                <div 
                    className={`placed-card ${isAttacking ? 'attacking-card' : ''} ${isDestroyed ? 'destroyed-card' : ''}`}
                    onClick={onRetractCard}
                    title={gamePhase === 'placement' && isPlayerTurn ? "Click to return to hand" : ""}
                >
                    <img 
                        className="card-full-image" 
                        src={card.image || "/assets/images/card_backs/CARDBACK.png"} 
                        alt={card.name} 
                    />
                    {gamePhase === 'placement' && isPlayerTurn && (
                        <div className="retract-hint">Return to hand</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PlayerLane; 