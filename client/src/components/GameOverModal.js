import React from 'react';
import '../styles/GameOverModal.css';

function GameOverModal({ show, result }) {
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
                    <div className="stats-section life-section">
                        <div className="life-stats">
                            <div className="life-stat">
                                <span className="stat-label">Your Life</span>
                                <span className="stat-value">{stats.finalLife}</span>
                            </div>
                            <div className="life-divider">vs</div>
                            <div className="life-stat">
                                <span className="stat-label">Enemy Life</span>
                                <span className="stat-value">{stats.enemyFinalLife}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-section combat-stats">
                        <h2>Combat Statistics</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Total Damage Dealt</span>
                                <span className="stat-value">{stats.totalDamageDealt}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Highest Damage Turn</span>
                                <span className="stat-value">{stats.highestDamageDealt}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Total Damage Taken</span>
                                <span className="stat-value">{stats.totalDamageTaken}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Cards Played</span>
                                <span className="stat-value">{stats.cardsPlayed}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-section special-stats">
                        <h2>Special Abilities</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Thief Damage</span>
                                <span className="stat-value">{stats.thiefDamage}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Guard Blocks</span>
                                <span className="stat-value">{stats.guardBlocks}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Curse Damage</span>
                                <span className="stat-value">{stats.curseDamage}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Enemy Cards Destroyed</span>
                                <span className="stat-value">{stats.enemyCardsDestroyed}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-section game-stats">
                        <h2>Game Overview</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Total Rounds</span>
                                <span className="stat-value">{stats.totalRounds}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Longest Round</span>
                                <span className="stat-value">{stats.longestRound} turns</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Cards Lost</span>
                                <span className="stat-value">{stats.cardsDestroyed}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Gems Earned</span>
                                <span className="stat-value">{stats.gemsEarned} 💎</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="return-message">
                        Returning to dashboard in a few seconds...
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameOverModal; 