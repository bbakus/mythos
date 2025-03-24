import React from 'react';

function EndTurnButton({ onPassTurn }) {
    return (
        <div className="pass-turn-container">
            <button 
                className="pass-turn-button"
                onClick={onPassTurn}
                title="End your turn"
            >
                End Turn
            </button>
        </div>
    );
}

export default EndTurnButton; 