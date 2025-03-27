import React from 'react';
import GameOverModal from '../GameOverModal';

function GameModals({
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
    userDecks,
    selectedDeck,
    onPlayClick,
    onTutorialClick,
    onCloseTutorial,
    onDeckSelect,
    onDrawFirstHand,
    onCoinToss,
    onConfirmForfeit,
    onCancelForfeit,
    onDrawNewRoundHand,
    onForfeitClick,
    onCloseBattleResults,
    onGuardAdjacentBlock,
    onRetainCard,
    onCloseRetainModal,
    onReturnToDashboard,
    onPlayAgain,
    setShowGuardBlockModal
}) {
    return (
        <>
            {showIntroModal && (
                <div className="modal-overlay">
                    <div className="intro-modal">
                        <h2>Welcome to Mythos Arena</h2>
                        <div className="intro-actions">
                            <button onClick={onPlayClick}>Play</button>
                            <button onClick={onTutorialClick}>Tutorial</button>
                            <button onClick={onReturnToDashboard} className="return-button">Dashboard</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showTutorialModal && (
                <div className="modal-overlay">
                    <div className="tutorial-modal">
                        <h2>How to Play</h2>
                        <div className="tutorial-content">
                            <p>Welcome to Mythos! We're so glad to have you here. Here is a quick run down of the game and it's mechanics</p>
                            <p>Upon game start, you will draw 3 cards and receive 4 mana. Each card has a power -bottom left- and a cost -bottom right-</p>
                            <p>You can drag cards into one of three lanes, as long as they meet your mana limit, and they are placed face down.</p>
                            <p>Once your opponent has placed all of their cards the battle phase begins. The player that goes first is determined by a coin toss.</p>
                            <p>The first attacker uses all of their cards in each lane to attack the opposing cards, which have also been flipped by this point.</p>
                            <p>Damage and attributes are taken into consideration and the resulting victors stay on the field, while the vanquished go into the graveyard.</p>
                            <p>After this, the second attacker has their battle phase, and in turn attacks anything in the opposing lane. During combat, any damage done to an empty opposing lane deals damage directly to the opponents life points.</p>
                            <p>The goal is to bring your opponent to 0 lifepoints using these battle mechanics</p>
                            <p>Other things to keep in mind, there are three attributes</p>
                            <ul>
                                <li>Guard</li>
                                <li>Curse</li>
                                <li>Thief</li>
                            </ul>
                            <p>GUARD: Guard is the only attribute that can block both Thief and Curse. It is also capable of blocking an attack from an adjacent lane. Guard cards will 'retire' after 2 blocks.</p>
                            <p>CURSE: Curse cards enact a trait where upon destroying an opposing creature - even if the card itself is also destroyed - it does damage to the opponent equal to the full weight of it's power.</p>
                            <p>THIEF: Thief cards are able to bypass an opposing creature on their attack turn only. They do damage directly to the player.</p>
                            <p>Managing your mana and utilizing your lanes , along with card attributes, is the key to success. Get to know your deck and it's mechanics, and you'll do great out there!</p>
                        </div>
                        <button className="close-tutorial-button" onClick={onCloseTutorial}>Close Tutorial</button>
                    </div>
                </div>
            )}
            
            {showDeckSelectionModal && (
                <div className="modal-overlay">
                    <div className="deck-selection-modal">
                        <h2>Select Your Deck</h2>
                        {userDecks && userDecks.length > 0 ? (
                            <div className="deck-selection-grid">
                                {userDecks.map(deck => (
                                    <div 
                                        key={deck.id} 
                                        className="deck-selection-card"
                                        onClick={() => onDeckSelect(deck.id)}
                                    >
                                        <div className="deck-image">
                                            <img src="/assets/images/card_backs/CARDBACK.png" alt={deck.name} />
                                        </div>
                                        <div className="deck-info">
                                            <h3>{deck.name}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-decks-container">
                                <p>No decks found. Create a deck to play!</p>
                            </div>
                        )}
                        <button onClick={onReturnToDashboard} className="return-button">Dashboard</button>
                    </div>
                </div>
            )}
            
            {showDrawHandModal && (
                <div className="modal-overlay">
                    <div className="intro-modal draw-hand-modal">
                        <h2>Ready to Battle</h2>
                        <p>Your deck has been prepared. Draw your first hand to begin the game!</p>
                        <div className="intro-actions">
                            <button onClick={onDrawFirstHand}>Draw First Hand</button>
                            <button onClick={onReturnToDashboard} className="return-button">Dashboard</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showCoinTossModal && (
                <div className="modal-overlay">
                    <div className="intro-modal coin-toss-modal">
                        <h2>Coin Toss</h2>
                        <p>A coin toss will determine who goes first.</p>
                        <p>Heads: You go first. Tails: Opponent goes first.</p>
                        
                        {coinTossResult ? (
                            <div className="coin-result">
                                <p className="coin-text">The coin shows: <span className="result">{coinTossResult.toUpperCase()}</span></p>
                                <p className="turn-text">
                                    {coinTossResult === 'heads' ? 'You go first!' : 'Opponent goes first!'}
                                </p>
                            </div>
                        ) : (
                            <div className="intro-actions">
                                <button onClick={onCoinToss}>Toss Coin</button>
                                <button onClick={onReturnToDashboard} className="return-button">Dashboard</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {showForfeitConfirmModal && (
                <div className="modal-overlay">
                    <div className="forfeit-modal">
                        <h2>Forfeit Match?</h2>
                        <p>Are you sure you want to forfeit? This will count as a loss.</p>
                        <div className="forfeit-actions">
                            <button onClick={onConfirmForfeit} className="confirm-forfeit">Yes, Forfeit</button>
                            <button onClick={onCancelForfeit} className="cancel-forfeit">No, Continue Playing</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showNewRoundModal && (
                <div className="modal-overlay">
                    <div className="intro-modal new-round-modal">
                        <h2>Round {roundCount}</h2>
                        <p>The battle continues! Draw new cards to place on the field.</p>
                        <div className="round-stats">
                            <p>Your HP: {playerLife}</p>
                            <p>Opponent HP: {opponentLife}</p>
                            <p>Cards in deck: {remainingDeck.length}</p>
                        </div>
                        <div className="intro-actions">
                            <button onClick={onDrawNewRoundHand}>Draw New Hand</button>
                            <button onClick={onForfeitClick} className="forfeit-button">Forfeit</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showGameOverModal && (
                <GameOverModal 
                    show={showGameOverModal}
                    result={gameResult}
                    onPlayAgain={onPlayAgain}
                    onReturnToDashboard={onReturnToDashboard}
                />
            )}
            
            {showGuardBlockModal && (
                <div className="modal-overlay">
                    <div className="guard-block-modal">
                        <h2>Guard Block Choice</h2>
                        <p>Choose whether to block an adjacent lane with your Guard:</p>
                        <div className="guard-block-options">
                            <button 
                                onClick={() => onGuardAdjacentBlock(activeGuardIndex, activeGuardIndex - 1)}
                                disabled={activeGuardIndex === 0 || guardAdjacentBlocks[activeGuardIndex]}
                            >
                                Block Left Lane
                            </button>
                            <button 
                                onClick={() => onGuardAdjacentBlock(activeGuardIndex, activeGuardIndex + 1)}
                                disabled={activeGuardIndex === 2 || guardAdjacentBlocks[activeGuardIndex]}
                            >
                                Block Right Lane
                            </button>
                            <button 
                                onClick={() => setShowGuardBlockModal(false)}
                                className="cancel-button"
                            >
                                Don't Block Adjacent
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showRetainCardModal && (
                <div className="modal-overlay">
                    <div className="retain-card-modal">
                        <h2>Retain a Card</h2>
                        <p>Choose one card to keep for next round. You will draw 2 cards instead of 3.</p>
                        <div className="retain-card-options">
                            {playerHand.map((card) => (
                                <button 
                                    key={card.id}
                                    onClick={() => onRetainCard(card)}
                                    className="retain-card-button"
                                >
                                    <img 
                                        src={card.image || "/assets/images/card_backs/CARDBACK.png"} 
                                        alt={card.name}
                                        className="retain-card-image"
                                    />
                                    <div className="retain-card-info">
                                        <span className="card-name">{card.name}</span>
                                        <span className="card-cost">Cost: {card.cost}</span>
                                        <span className="card-power">Power: {card.power}</span>
                                    </div>
                                </button>
                            ))}
                            <button 
                                onClick={onCloseRetainModal}
                                className="cancel-button"
                            >
                                Don't Retain
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showBattleResults && (
                <div className="modal-overlay">
                    <div className="battle-results-modal">
                        <h2>Battle Results</h2>
                        <div className="battle-log">
                            {battleResults && battleResults.map((result, index) => (
                                <p key={index} className="battle-result">
                                    {result}
                                </p>
                            ))}
                        </div>
                        <button 
                            className="modal-button battle-continue-button" 
                            onClick={onCloseBattleResults}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default GameModals; 