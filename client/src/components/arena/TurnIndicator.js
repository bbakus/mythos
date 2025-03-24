import React from 'react';

function TurnIndicator({ isPlayerTurn, playerAttackPhase, opponentAttackPhase }) {
    return (
        <div className="turn-indicator">
            {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
            {playerAttackPhase && " - Your Attack Phase"}
            {opponentAttackPhase && " - Opponent's Attack Phase"}
        </div>
    );
}

export default TurnIndicator; 