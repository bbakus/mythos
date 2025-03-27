import React from 'react';
import '../styles/GameOverModal.css';

function GameOverModal({ show, result, onPlayAgain, onReturnToDashboard }) {
    if (!show) return null;

    const { outcome, stats } = result;
    const isVictory = outcome === 'victory';

    return (
        <div className="game-over-modal-overlay">
            <div className={`game-over-modal ${isVictory ? 'victory' : 'defeat'}`}>
                <div className="modal-header">
                    <h1 className="result-title">
                        {isVictory ? 'VICTORY!' : 'DEFEAT'}
                    </h1>
                    <div className="result-subtitle">
                        {isVictory 
                            ? '🏆 You have emerged victorious!' 
                            : '💀 Your opponent has prevailed!'}
                    </div>
                </div>

                <div className="stats-container">
                    <div className="stats-section">
                        <h3>Life Stats</h3>
                        <p>Your final LP: {stats.finalLife}</p>
                        <p>Enemy final LP: {stats.enemyFinalLife}</p>
                    </div>

                    <div className="stats-section">
                        <h3>Combat Statistics</h3>
                        <p>Highest damage turn: {stats.highestDamageDealt}</p>
                        <p>Total damage taken: {stats.totalDamageTaken}</p>
                    </div>

                    <div className="stats-section">
                        <h3>Card Stats</h3>
                        <p>Cards played: {stats.cardsPlayed}</p>
                        <p>Enemy cards destroyed: {stats.enemyCardsDestroyed}</p>
                    </div>

                    <div className="stats-section">
                        <h3>Special Abilities</h3>
                        <p>Thief damage: {stats.thiefDamage}</p>
                        <p>Total damage blocked: {stats.guardBlocks}</p>
                        <p>Curse damage: {stats.curseDamage}</p>
                    </div>

                    <div className="stats-section">
                        <h3>MVP Card</h3>
                        {stats.mvpCard && (
                            <>
                                <p className="mvp-name">{stats.mvpCard.name}</p>
                                <p className="mvp-stats">
                                    {stats.mvpCard.type === 'damage' 
                                        ? `Dealt ${stats.mvpCard.value} damage`
                                        : `Blocked ${stats.mvpCard.value} damage`}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="stats-section">
                        <h3>Overview</h3>
                        <p>Total rounds: {stats.totalRounds}</p>
                        {isVictory && (
                            <p className="gems-earned">Gems earned: +{stats.gemsEarned}</p>
                        )}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="play-again-btn" onClick={onPlayAgain}>
                        Play Again
                    </button>
                    <button className="dashboard-btn" onClick={onReturnToDashboard}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverModal; 