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
                    <div className="life-counter">HP: {playerLife}</div>
                    <div className="mana-counter">Mana: {playerMana}</div>
                    <div className="deck-counter">Deck: {remainingDeck.length}</div>
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
                    <div className="life-counter">Enemy HP: {opponentLife}</div>
                    <div className="mana-counter">Enemy Mana: {opponentMana}</div>
                    <div className="deck-counter">Enemy Deck: {opponentDeck.length}</div>
                </div>
            </div>
        </>
    );
}

export default GameStats; 