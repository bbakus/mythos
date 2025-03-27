import React from 'react';

function GameStats({
    playerLife,
    playerMana,
    remainingDeck,
    opponentLife,
    opponentMana,
    opponentDeck,
    gamePhase,
    battleComplete,
    onForfeitClick
}) {
    return (
        <>
            <div className="player-stats-container">
                <div className="player-stats">
                    <div className="life-counter" style={{ backgroundImage: 'url(/assets/images/misc/LP-sphere.png)' }}>LP: {playerLife}</div>
                    <div className="mana-counter" style={{ backgroundImage: 'url(/assets/images/misc/mana-sphere.png)' }}>Mana: {playerMana}</div>
                    <div className="deck-counter" style={{ backgroundImage: 'url(/assets/images/misc/deck-sphere.png)' }}>Deck: {remainingDeck.length}</div>
                </div>
                
                {(gamePhase === 'placement' || gamePhase === 'battle') && !battleComplete && (
                    <div className="forfeit-container">
                        <button 
                            className="forfeit-button"
                            onClick={onForfeitClick}
                            title="Forfeit the match"
                        >
                            Forfeit
                        </button>
                    </div>
                )}
            </div>
            
            <div className="opponent-stats-container">
                <div className="player-stats">
                    <div className="life-counter" style={{ backgroundImage: 'url(/assets/images/misc/LP-sphere.png)' }}>LP: {opponentLife}</div>
                    <div className="mana-counter" style={{ backgroundImage: 'url(/assets/images/misc/mana-sphere.png)' }}>Mana: {opponentMana}</div>
                    <div className="deck-counter" style={{ backgroundImage: 'url(/assets/images/misc/deck-sphere.png)' }}>Deck: {opponentDeck.length}</div>
                </div>
            </div>
        </>
    );
}

export default GameStats; 