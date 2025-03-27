import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useGameLogic } from './useGameLogic';
import GameBoard from './GameBoard';
import GameModals from './GameModals';
import '../../styles/Arena.css';

export default function Arena() {
    const { userId } = useParams();
    const location = useLocation();
    const userData = location.state?.user;

    const {
        // State
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
        showBattleResults,
        coinTossResult,
        gameResult,
        roundCount,
        playerLife,
        opponentLife,
        remainingDeck,
        battleResults,
        playerHand,
        activeGuardIndex,
        guardAdjacentBlocks,
        gamePhase,
        isPlayerTurn,
        playerTurnCount,
        playerLaneCards,
        enemyLaneCards,
        playerMana,
        opponentMana,
        opponentDeck,
        gameMessage,
        attackingCards,
        destroyedCards,
        userDecks,
        selectedDeck,
        playerAttackPhase,
        opponentAttackPhase,
        battleComplete,
        
        // Handlers
        handleReturnToDashboard,
        handleForfeitClick,
        handleConfirmForfeit,
        handleCancelForfeit,
        handlePlayClick,
        handleTutorialClick,
        handleCloseTutorial,
        handleDeckSelect,
        handleDrawFirstHand,
        handleCoinToss,
        handlePassTurn,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleRetractCard,
        handleGuardAdjacentBlock,
        handleRetainCard,
        handleCloseRetainModal,
        handleDrawNewRoundHand,
        handleCloseBattleResults
    } = useGameLogic(userId, userData);

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="arena-container">
            <div className="arena-background">
                <img src="/assets/images/misc/game-board-6.png" alt="Arena Background" />
            </div>
            <div className="arena-background-background">
                <img src="/assets/images/misc/background-surface.png"/>
            </div>
            <GameBoard
                positionConfig={{
                    playerLane1: { top: '50%', left: '20%' },
                    playerLane2: { top: '50%', left: '40%' },
                    playerLane3: { top: '50%', left: '60%' },
                    enemyLane1: { top: '20%', left: '20%' },
                    enemyLane2: { top: '20%', left: '40%' },
                    enemyLane3: { top: '20%', left: '60%' }
                }}
                gamePhase={gamePhase}
                isPlayerTurn={isPlayerTurn}
                playerTurnCount={playerTurnCount}
                playerLaneCards={playerLaneCards}
                enemyLaneCards={enemyLaneCards}
                playerHand={playerHand}
                remainingDeck={remainingDeck}
                playerMana={playerMana}
                playerLife={playerLife}
                opponentMana={opponentMana}
                opponentLife={opponentLife}
                opponentDeck={opponentDeck}
                gameMessage={gameMessage}
                attackingCards={attackingCards}
                destroyedCards={destroyedCards}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onRetractCard={handleRetractCard}
                onPassTurn={handlePassTurn}
                onForfeitClick={handleForfeitClick}
                playerAttackPhase={playerAttackPhase}
                opponentAttackPhase={opponentAttackPhase}
                battleComplete={battleComplete}
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

            <GameModals
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
                coinTossResult={coinTossResult}
                gameResult={gameResult}
                roundCount={roundCount}
                playerLife={playerLife}
                opponentLife={opponentLife}
                remainingDeck={remainingDeck}
                battleResults={battleResults}
                playerHand={playerHand}
                activeGuardIndex={activeGuardIndex}
                guardAdjacentBlocks={guardAdjacentBlocks}
                userDecks={userDecks}
                selectedDeck={selectedDeck}
                onPlayClick={handlePlayClick}
                onTutorialClick={handleTutorialClick}
                onCloseTutorial={handleCloseTutorial}
                onDeckSelect={handleDeckSelect}
                onDrawFirstHand={handleDrawFirstHand}
                onCoinToss={handleCoinToss}
                onConfirmForfeit={handleConfirmForfeit}
                onCancelForfeit={handleCancelForfeit}
                onGuardAdjacentBlock={handleGuardAdjacentBlock}
                onRetainCard={handleRetainCard}
                onCloseRetainModal={handleCloseRetainModal}
                onDrawNewRoundHand={handleDrawNewRoundHand}
                onCloseBattleResults={handleCloseBattleResults}
                onReturnToDashboard={handleReturnToDashboard}
            />
        </div>
    );
} 