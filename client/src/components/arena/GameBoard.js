import React from 'react';
import PlayerLane from './PlayerLane';
import EnemyLane from './EnemyLane';
import PlayerHand from './PlayerHand';
import GameStats from './GameStats';
import GameMessage from './GameMessage';
import TurnIndicator from './TurnIndicator';
import EndTurnButton from './EndTurnButton';

function GameBoard({
    positionConfig,
    gamePhase,
    isPlayerTurn,
    playerTurnCount,
    playerLaneCards,
    enemyLaneCards,
    playerHand,
    remainingDeck,
    playerMana,
    playerLife,
    opponentMana,
    opponentLife,
    opponentDeck,
    gameMessage,
    onDragStart,
    onDragOver,
    onDrop,
    onRetractCard,
    onPassTurn,
    attackingCards,
    destroyedCards,
    playerAttackPhase,
    opponentAttackPhase,
    battleComplete,
    onForfeitClick,
    showIntroModal,
    showTutorialModal,
    showDeckSelectionModal,
    showDrawHandModal,
    showCoinTossModal,
    showForfeitConfirmModal,
    showNewRoundModal,
    showGameOverModal,
    showGuardBlockModal,
    showRetainCardModal,
    showBattleResults
}) {
    return (
        <div className="game-board">
            <GameMessage 
                message={gameMessage}
                showIntroModal={showIntroModal}
                showTutorialModal={showTutorialModal}
                showDeckSelectionModal={showDeckSelectionModal}
                showDrawHandModal={showDrawHandModal}
                showCoinTossModal={showCoinTossModal}
                showForfeitConfirmModal={showForfeitConfirmModal}
                showNewRoundModal={showNewRoundModal}
                showGameOverModal={showGameOverModal}
                showGuardBlockModal={showGuardBlockModal}
                showRetainCardModal={showRetainCardModal}
                showBattleResults={showBattleResults}
            />
            
            {gamePhase === 'placement' && (
                <TurnIndicator isPlayerTurn={isPlayerTurn} />
            )}
            
            {gamePhase === 'battle' && (
                <TurnIndicator 
                    isPlayerTurn={isPlayerTurn}
                    playerAttackPhase={playerAttackPhase}
                    opponentAttackPhase={opponentAttackPhase}
                />
            )}
            
            {isPlayerTurn && gamePhase === 'placement' && playerTurnCount < 3 && (
                <EndTurnButton onPassTurn={onPassTurn} />
            )}
            
            <div className="battlefield-grid">
                {/* Enemy Lanes */}
                <div className="enemy-lanes">
                    {enemyLaneCards.map((card, index) => (
                        <EnemyLane
                            key={`enemy-lane-${index}`}
                            card={card}
                            gamePhase={gamePhase}
                            isAttacking={attackingCards.enemy[index]}
                            isDestroyed={destroyedCards.enemy[index]}
                        />
                    ))}
                </div>
                
                {/* Player Lanes */}
                <div className="player-lanes">
                    {playerLaneCards.map((card, index) => (
                        <PlayerLane
                            key={`player-lane-${index}`}
                            card={card}
                            gamePhase={gamePhase}
                            isPlayerTurn={isPlayerTurn}
                            isAttacking={attackingCards.player[index]}
                            isDestroyed={destroyedCards.player[index]}
                            onDragOver={gamePhase === 'placement' ? onDragOver : null}
                            onDrop={gamePhase === 'placement' ? (e) => onDrop(e, index) : null}
                            onRetractCard={gamePhase === 'placement' && isPlayerTurn ? () => onRetractCard(index) : null}
                        />
                    ))}
                </div>
            </div>
            
            {/* Player Stats */}
            <GameStats
                playerLife={playerLife}
                playerMana={playerMana}
                remainingDeck={remainingDeck}
                opponentLife={opponentLife}
                opponentMana={opponentMana}
                opponentDeck={opponentDeck}
                gamePhase={gamePhase}
                battleComplete={battleComplete}
                onForfeitClick={onForfeitClick}
            />
            
            {/* Player Hand */}
            {playerHand.length > 0 && gamePhase === 'placement' && (
                <PlayerHand
                    cards={playerHand}
                    isPlayerTurn={isPlayerTurn}
                    gamePhase={gamePhase}
                    onDragStart={onDragStart}
                />
            )}
        </div>
    );
}

export default GameBoard; 