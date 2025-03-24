import React from 'react';

function PlayerHand({ cards, isPlayerTurn, gamePhase, onDragStart }) {
    return (
        <div className="player-hand">
            {cards.map((card) => (
                <div 
                    key={card.id} 
                    className={`card-container ${isPlayerTurn && gamePhase === 'placement' ? 'active-turn' : 'inactive-turn'}`}
                    draggable={isPlayerTurn && gamePhase === 'placement'}
                    onDragStart={(e) => isPlayerTurn && gamePhase === 'placement' ? onDragStart(e, card) : null}
                >
                    <div className="hand-card">
                        <img 
                            className="card-full-image" 
                            src={card.image || "/assets/images/card_backs/CARDBACK.png"} 
                            alt={card.name} 
                        />
                        <div className="card-stats">
                            <div className="card-cost">{card.cost}</div>
                            <div className="card-power">{card.power}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PlayerHand; 