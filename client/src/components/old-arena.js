import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Arena.css';

function Arena() {
    // =============================================
    // CARD POSITION CONFIGURATION
    // =============================================
    // Modify these values to position the card slots
    // Values are percentages from the top-left corner
    const positionConfig = {
        // Enemy lane positions (left to right)
        enemyLanes: [
            { left: '23.5%', top: '25%' },  // Left enemy lane
            { left: '45%', top: '21%' },  // Middle enemy lane
            { left: '66.5%', top: '25%' }   // Right enemy lane
        ],
        // Player lane positions (left to right)
        playerLanes: [
            { left: '24%', top: '60%' },  // Left player lane
            { left: '45%', top: '62%' },  // Middle player lane
            { left: '67%', top: '60%' }   // Right player lane
        ]
    };
    // =============================================

    const { userId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({...location.state?.user});
    
    // Basic state
    const [showIntroModal, setShowIntroModal] = useState(true);
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [showDeckSelectionModal, setShowDeckSelectionModal] = useState(false);
    const [showDrawHandModal, setShowDrawHandModal] = useState(false);
    const [showCoinTossModal, setShowCoinTossModal] = useState(false);
    const [showForfeitConfirmModal, setShowForfeitConfirmModal] = useState(false);
    const [gameMessage, setGameMessage] = useState('Welcome to Mythos Arena!');
    const [userDecks, setUserDecks] = useState([]);
    const [deckCards, setDeckCards] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [playerHand, setPlayerHand] = useState([]);
    const [remainingDeck, setRemainingDeck] = useState([]);
    const [playerMana, setPlayerMana] = useState(4);
    const [playerLife, setPlayerLife] = useState(40);
    
    // Track cards placed in lanes
    const [playerLaneCards, setPlayerLaneCards] = useState([null, null, null]);
    const [enemyLaneCards, setEnemyLaneCards] = useState([null, null, null]);
    const [draggedCard, setDraggedCard] = useState(null);
    
    // Turn and phase tracking
    const [gamePhase, setGamePhase] = useState('init'); // 'init', 'placement', 'battle'
    const [isPlayerTurn, setIsPlayerTurn] = useState(false); // Who's turn is it
    const [coinTossResult, setCoinTossResult] = useState(null); // 'heads' or 'tails'
    const [playerTurnCount, setPlayerTurnCount] = useState(0); // Track player turns (max 3)
    const [opponentTurnCount, setOpponentTurnCount] = useState(0); // Track opponent turns (max 3)
    const [battleInitiated, setBattleInitiated] = useState(false);
    const [playerAttackPhase, setPlayerAttackPhase] = useState(false); // Is player attacking
    const [opponentAttackPhase, setOpponentAttackPhase] = useState(false); // Is opponent attacking
    const [battleComplete, setBattleComplete] = useState(false);
    const [battleLog, setBattleLog] = useState([]);
    const [battleResults, setBattleResults] = useState([]);
    const [showBattleResults, setShowBattleResults] = useState(false);
    
    // Opponent setup (simplified)
    const [opponentDeck, setOpponentDeck] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [opponentMana, setOpponentMana] = useState(4);
    const [opponentLife, setOpponentLife] = useState(40);
    
    // Add a round counter state
    const [roundCount, setRoundCount] = useState(1);
    const [showNewRoundModal, setShowNewRoundModal] = useState(false);
    
    // Add a new state to track phase completion
    const [justCompletedOpponentAttack, setJustCompletedOpponentAttack] = useState(false);
    
    // Add these new state variables near the other state declarations
    const [showMessagePopup, setShowMessagePopup] = useState(false);
    const [messagePopupText, setMessagePopupText] = useState('');
    const [messagePopupTimer, setMessagePopupTimer] = useState(null);
    
    // Add a new state to track cards that should be animated for attack or destruction
    const [attackingCards, setAttackingCards] = useState({ player: [false, false, false], enemy: [false, false, false] });
    const [destroyedCards, setDestroyedCards] = useState({ player: [false, false, false], enemy: [false, false, false] });
    
    // Add a new state to track if the player has had their attack phase in this battle round
    const [playerHasAttacked, setPlayerHasAttacked] = useState(false);
    const [opponentHasAttacked, setOpponentHasAttacked] = useState(false);
    
    // Add new state variables for game over
    const [gameOver, setGameOver] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const [gameResult, setGameResult] = useState(null); // 'victory' or 'defeat'
    
    // Add new state variables for guard blocking
    const [showGuardBlockModal, setShowGuardBlockModal] = useState(false);
    const [activeGuardIndex, setActiveGuardIndex] = useState(null);
    const [guardAdjacentBlocks, setGuardAdjacentBlocks] = useState([false, false, false]);
    
    // Add new state variables for card retention
    const [retainedCard, setRetainedCard] = useState(null);
    const [showRetainCardModal, setShowRetainCardModal] = useState(false);
    
    // Navigation handlers
    const handleReturnToDashboard = () => {
        navigate(`/users/${userId}/dashboard`, { state: { user: userData } });
    };

    const handleForfeitClick = () => {
        setShowForfeitConfirmModal(true);
    };

    const handleConfirmForfeit = () => {
        
        setTimeout(() => {
            navigate(`/users/${userId}/dashboard`, { state: { user: userData } });
        }, 1500);
    };

    const handleCancelForfeit = () => {
        setShowForfeitConfirmModal(false);
    };

    // Handle intro modal options
    const handlePlayClick = () => {
        setShowIntroModal(false);
        setShowDeckSelectionModal(true);
        
    };
    
    const handleTutorialClick = () => {
        setShowIntroModal(false);
        setShowTutorialModal(true);
    };
    
    // Handle closing the tutorial
    const handleCloseTutorial = () => {
        setShowTutorialModal(false);
        setShowIntroModal(true);
    };

    // Handle victory and defeat
    const handleVictory = () => {
        setGameMessage("Victory! You have defeated your opponent!");
        setGameOver(true);
        setGameResult('victory');
        setShowGameOverModal(true);
        
        // Award 30 gems to the player's wallet
        const newWallet = userData.wallet + 30;
        fetch(`/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wallet: newWallet
            }),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            // Update local user data with new wallet amount
            if (data.wallet !== undefined) {
                const updatedUser = {...userData, wallet: data.wallet};
                setUserData(updatedUser);
                // Update localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        })
        .catch(error => {
            console.error("Error updating wallet:", error);
        });
        
        // After a longer delay, return to dashboard
        setTimeout(() => {
            navigate(`/users/${userId}/dashboard`, { state: { user: userData } });
        }, 6000);
    };

    const handleDefeat = () => {
        setGameMessage("Defeat! Your opponent has defeated you!");
        setGameOver(true);
        setGameResult('defeat');
        setShowGameOverModal(true);
        
        // After a longer delay, return to dashboard
        setTimeout(() => {
            navigate(`/users/${userId}/dashboard`, { state: { user: userData } });
        }, 6000);
    };

    // Display game messages
    const displayGameMessage = (message) => {
        setGameMessage(message);
        setMessagePopupText(message);
        setShowMessagePopup(true);
        
        // Clear any existing timer
        if (messagePopupTimer) {
            clearTimeout(messagePopupTimer);
        }
        
        // Set a new timer to hide the popup after 3 seconds
        const timer = setTimeout(() => {
            setShowMessagePopup(false);
        }, 3000);
        
        setMessagePopupTimer(timer);
    };

    useEffect(() => {
        fetch(`/users/${userId}/decks`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            setUserDecks(data);
            if (data.length > 0 && !selectedDeck) {
                setSelectedDeck(data[0].id);
            }
        })
        .catch(error => {
            setGameMessage('Error loading decks. Please try again.');
        });
    }, [userId]);

    useEffect(() => {
        if (selectedDeck) {
            fetch(`/users/${userId}/decks/${selectedDeck}/cards`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!data || data.length === 0) {
                    setGameMessage("No cards found in this deck. Please select another deck.");
                    return;
                }
                
                const gameCards = [];
                let totalCards = 0;
                const MAX_DECK_SIZE = 20;
                
                for (const cardData of data) {
                    if (!cardData.card) {
                        continue;
                    }
                    
                    const quantityToAdd = Math.min(cardData.quantity, MAX_DECK_SIZE - totalCards);
                    
                    for (let i = 0; i < quantityToAdd; i++) {
                        if (totalCards >= MAX_DECK_SIZE) break;
                        
                        const processedCard = {
                            ...cardData.card,
                            id: `${cardData.card.id}-${i}`,
                            inDeck: true
                        };
                        
                        if (cardData.card.image && !cardData.card.image.startsWith('http')) {
                            processedCard.image = `/${cardData.card.image.replace(/^\/+/, '')}`;
                        } else if (!cardData.card.image) {
                            processedCard.image = "/assets/images/card_backs/CARDBACK.png";
                        }
                        
                        gameCards.push(processedCard);
                        totalCards++;
                    }
                    
                    if (totalCards >= MAX_DECK_SIZE) break;
                }
                
                setDeckCards(gameCards);
                setRemainingDeck(gameCards);
            })
            .catch(error => {
                setGameMessage('Error loading cards. Please try again.');
            });
        }
    }, [userId, selectedDeck]);

    // Handle deck selection
    const handleDeckSelect = (deckId) => {
        setSelectedDeck(deckId);
        setShowDeckSelectionModal(false);
        setShowDrawHandModal(true);
        setGameMessage('Ready to begin the battle!');
    };
    
    // Draw random cards from the deck
    const drawCards = (count) => {
        if (remainingDeck.length < count) {
            return [];
        }
        
        const currentDeck = [...remainingDeck];
        const drawnCards = [];
        
        for (let i = 0; i < count; i++) {
            if (currentDeck.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * currentDeck.length);
            const drawnCard = currentDeck.splice(randomIndex, 1)[0];
            drawnCards.push(drawnCard);
        }
        
        setRemainingDeck(currentDeck);
        
        return drawnCards;
    };
    
    // Handle drawing first hand
    const handleDrawFirstHand = () => {
        if (!remainingDeck || remainingDeck.length === 0) {
            setGameMessage("No cards available to draw. Please select a different deck.");
            return;
        }
        
        if (remainingDeck.length >= 3) {
            const initialHand = drawCards(3);
            setPlayerHand(initialHand);
            setShowDrawHandModal(false);
            
            setupOpponentInitialHand();
            
            setShowCoinTossModal(true);
            setGameMessage('Determining who goes first with a coin toss!');
        } else {
            const initialHand = drawCards(remainingDeck.length);
            setPlayerHand(initialHand);
            setShowDrawHandModal(false);
            
            setupOpponentInitialHand(remainingDeck.length);
            
            setShowCoinTossModal(true);
            setGameMessage(`Your hand has been drawn with ${initialHand.length} cards. Determining first player!`);
        }
    };

    // Set up the opponent's initial hand (simplified opponent for now)
    const setupOpponentInitialHand = (cardCount = 3) => {
        const opponentCards = [];
        for (let i = 0; i < cardCount; i++) {
            opponentCards.push({
                id: `opponent-card-${i}`,
                name: `Opponent Card ${i+1}`,
                power: Math.floor(Math.random() * 5) + 1,
                cost: Math.floor(Math.random() * 3) + 1,
                image: "/assets/images/card_backs/CARDBACK.png"
            });
        }
        
        setOpponentHand(opponentCards);
        setOpponentDeck([...opponentCards]);
    };

    // Handle coin toss to determine first player
    const handleCoinToss = () => {
        setGameMessage("Tossing the coin...");
        
        setTimeout(() => {
            const tossResult = Math.random() < 0.5 ? 'heads' : 'tails';
            setCoinTossResult(tossResult);
            
            const playerFirst = tossResult === 'heads';
            setIsPlayerTurn(playerFirst);
            
            setGameMessage(playerFirst 
                ? "Coin shows Heads! You go first." 
                : "Coin shows Tails! Opponent goes first.");
            
            setTimeout(() => {
                setShowCoinTossModal(false);
                setGamePhase('placement');
                
                setPlayerTurnCount(0);
                setOpponentTurnCount(0);
                
                setGameMessage(playerFirst 
                    ? "Your turn: Place a card in one of the lanes. (Turn 1 of 3)" 
                    : "Opponent's turn: They are placing a card... (Turn 1 of 3)");
                
                if (!playerFirst) {
                    setTimeout(handleOpponentPlacement, 1500);
                }
            }, 2000);
        }, 1500);
    };

    // Check if placement phase should end
    const shouldEndPlacementPhase = () => {
        // End placement when both players have taken exactly 3 turns
        return playerTurnCount >= 3 && opponentTurnCount >= 3;
    };

    // Handle opponent's card placement (AI)
    const handleOpponentPlacement = () => {
        // Skip if battle has already started
        if (battleInitiated || gamePhase === 'battle') {
            return;
        }
        
        // If opponent already took 3 turns, we should be in battle phase
        if (opponentTurnCount >= 3) {
            setTimeout(() => {
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            }, 500);
            return;
        }
        
        if (opponentHand.length > 0 && opponentMana > 0) {
            const availableLanes = enemyLaneCards.map((card, index) => 
                card === null ? index : null).filter(lane => lane !== null);
            
            if (availableLanes.length > 0) {
                const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
                
                const affordableCards = opponentHand.filter(card => card.cost <= opponentMana);
                
                if (affordableCards.length > 0) {
                    const cardIndex = Math.floor(Math.random() * affordableCards.length);
                    const cardToPlace = affordableCards[cardIndex];
                    
                    const newLaneCards = [...enemyLaneCards];
                    newLaneCards[laneIndex] = cardToPlace;
                    setEnemyLaneCards(newLaneCards);
                    
                    const newHand = opponentHand.filter(card => card.id !== cardToPlace.id);
                    setOpponentHand(newHand);
                    
                    setOpponentMana(prevMana => prevMana - cardToPlace.cost);
                }
            }
        }

        const newOpponentTurnCount = opponentTurnCount + 1;
        setOpponentTurnCount(newOpponentTurnCount);
        
        // Check if both players have completed their turns
        if (playerTurnCount >= 3 && newOpponentTurnCount >= 3) {
            setTimeout(() => {
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            }, 500);
            return;
        }
        
        // Otherwise continue to player's turn
        setIsPlayerTurn(true);
        setTimeout(() => {
            setGameMessage(`Your turn: Place a card in an available lane or end turn. (Turn ${playerTurnCount + 1} of 3)`);
        }, 1000);
    };

    // Handle player pass turn (renamed to End Turn)
    const handlePassTurn = () => {
        if (!isPlayerTurn || gamePhase !== 'placement') {
            return;
        }
        
        // Skip if battle has already started
        if (battleInitiated || gamePhase === 'battle') {
            return;
        }
        
        // If player already took 3 turns, we should transition to battle phase
        if (playerTurnCount >= 3) {
            if (opponentTurnCount >= 3) {
                // Both players have completed their turns, transition to battle phase
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            } else {
                setIsPlayerTurn(false);
                setTimeout(() => {
                    setGameMessage(`Opponent's turn: They are placing a card... (Turn ${opponentTurnCount + 1} of 3)`);
                    setTimeout(handleOpponentPlacement, 1000);
                }, 500);
            }
            return;
        }
        
        setGameMessage("You end your turn.");
        
        const newPlayerTurnCount = playerTurnCount + 1;
        setPlayerTurnCount(newPlayerTurnCount);
        
        // Check if both players have completed their turns
        if (newPlayerTurnCount >= 3 && opponentTurnCount >= 3) {
            // Both players have completed their turns, transition to battle phase
            setTimeout(() => {
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            }, 500);
            return;
        }
        
        // Continue with opponent's turn if they haven't had 3 turns yet
        setIsPlayerTurn(false);
        setTimeout(() => {
            setGameMessage(`Opponent's turn: They are placing a card... (Turn ${opponentTurnCount + 1} of 3)`);
            setTimeout(handleOpponentPlacement, 1000);
        }, 500);
    };
    
    // Handle card drag start
    const handleDragStart = (e, card) => {
        setDraggedCard(card);
        e.dataTransfer.setData('text/plain', card.id);
        
        const cardElement = e.target.closest('.hand-card');
        if (cardElement) {
            const rect = cardElement.getBoundingClientRect();
            const dragImage = cardElement.cloneNode(true);
            
            dragImage.style.width = `${rect.width}px`;
            dragImage.style.height = `${rect.height}px`;
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.opacity = '0.8';
            
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
            
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);
        }
    };
    
    // Handle drag over lane
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    
    // Handle drop on lane - Updated to work with turns
    const handleDrop = (e, laneIndex) => {
        e.preventDefault();
        
        if (!isPlayerTurn || gamePhase !== 'placement') {
            setGameMessage("It's not your turn to place a card yet!");
            return;
        }
        
        // Skip if battle has already started
        if (battleInitiated || gamePhase === 'battle') {
            return;
        }
        
        // If player already took 3 turns, we should transition to battle phase
        if (playerTurnCount >= 3) {
            setGameMessage("You've already used all 3 of your placement turns!");
            return;
        }
        
        if (playerLaneCards[laneIndex] !== null) {
            setGameMessage('There is already a card in this lane!');
            return;
        }
        
        if (!draggedCard) {
            return;
        }
        
        if (draggedCard.cost > playerMana) {
            setGameMessage(`Not enough mana to play this card! (Need ${draggedCard.cost}, have ${playerMana})`);
            return;
        }
        
        const newLaneCards = [...playerLaneCards];
        newLaneCards[laneIndex] = draggedCard;
        setPlayerLaneCards(newLaneCards);
        
        const newHand = playerHand.filter(card => card.id !== draggedCard.id);
        setPlayerHand(newHand);
        
        setPlayerMana(prevMana => prevMana - draggedCard.cost);
        
        setDraggedCard(null);
        
        setGameMessage(`Card placed in lane ${laneIndex + 1}!`);
        
        const newPlayerTurnCount = playerTurnCount + 1;
        setPlayerTurnCount(newPlayerTurnCount);
        
        // Check if both players have completed their turns
        if (newPlayerTurnCount >= 3 && opponentTurnCount >= 3) {
            setTimeout(() => {
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            }, 500);
            return;
        }
        
        // Continue with opponent's turn if they haven't had 3 turns yet
        setIsPlayerTurn(false);
        setTimeout(() => {
            setGameMessage(`Opponent's turn: They are placing a card... (Turn ${opponentTurnCount + 1} of 3)`);
            setTimeout(handleOpponentPlacement, 1000);
        }, 500);
    };

    // Handle retracting a card - Updated to work with turns
    const handleRetractCard = (laneIndex) => {
        if (!isPlayerTurn || gamePhase !== 'placement') {
            setGameMessage("You can only retract cards during your turn in the placement phase!");
            return;
        }
        
        const cardToRetract = playerLaneCards[laneIndex];
        
        if (!cardToRetract) return;
        
        setPlayerHand(prevHand => [...prevHand, cardToRetract]);
        
        setPlayerMana(prevMana => prevMana + cardToRetract.cost);
        
        const newLaneCards = [...playerLaneCards];
        newLaneCards[laneIndex] = null;
        setPlayerLaneCards(newLaneCards);
        
        setGameMessage(`Card returned to hand, ${cardToRetract.cost} mana refunded. You can place a different card.`);
    };

    const handleCloseBattleResults = () => {
        setShowBattleResults(false);
        
        // After player's attack phase
        if (playerAttackPhase) {
            setPlayerAttackPhase(false);
            
            // Check if player won
            if (opponentLife <= 0) {
                setBattleComplete(true);
                handleVictory();
                return;
            }
            
            // If opponent hasn't attacked yet in this battle round, give them their turn
            if (!opponentHasAttacked) {
                // Check if opponent has any creatures left to attack with
                const opponentHasCreatures = enemyLaneCards.some(card => card !== null);
                
                if (opponentHasCreatures) {
                    displayGameMessage("Opponent's Attack Phase begins!");
                    setOpponentAttackPhase(true);
                } else {
                    // Opponent has no creatures, show retain card modal
                    displayGameMessage("Opponent has no creatures left to attack with. Choose a card to retain.");
                    setTimeout(() => {
                        setShowRetainCardModal(true);
                    }, 1000);
                }
            } else {
                // Both have attacked, show retain card modal
                displayGameMessage("Battle Phase complete! Choose a card to retain for next round.");
                setTimeout(() => {
                    setShowRetainCardModal(true);
                }, 1000);
            }
        } 
        // After opponent's attack phase
        else if (opponentAttackPhase || justCompletedOpponentAttack) {
            setOpponentAttackPhase(false);
            setJustCompletedOpponentAttack(false);
            
            // Check if opponent won
            if (playerLife <= 0) {
                setBattleComplete(true);
                handleDefeat();
                return;
            }
            
            // If player hasn't attacked yet in this battle round, give them their turn
            if (!playerHasAttacked) {
                // Check if player has any creatures left to attack with
                const playerHasCreatures = playerLaneCards.some(card => card !== null);
                
                if (playerHasCreatures) {
                    displayGameMessage("Your Attack Phase begins!");
                    setPlayerAttackPhase(true);
                } else {
                    // Player has no creatures, show retain card modal
                    displayGameMessage("You have no creatures left to attack with. Choose a card to retain.");
                    setTimeout(() => {
                        setShowRetainCardModal(true);
                    }, 1000);
                }
            } else {
                // Both have attacked, show retain card modal
                displayGameMessage("Battle Phase complete! Choose a card to retain for next round.");
                setTimeout(() => {
                    setShowRetainCardModal(true);
                }, 1000);
            }
        }
    };

    // Handle player attack with animations
    const handlePlayerAttack = () => {
        // If no lane index is provided, this is the start of the attack phase
        // Mark that player has attacked in this battle round
        setPlayerHasAttacked(true);

        // First mark which cards will attack
        const activePlayerCards = playerLaneCards.map(card => card !== null);
        setAttackingCards({ player: activePlayerCards, enemy: [false, false, false] });
        
        // After a short delay to show the attack animation, process the combat
        setTimeout(() => {
            const attackResults = [];
            let totalDamage = 0;
            const updatedPlayerLanes = [...playerLaneCards];
            const updatedEnemyLanes = [...enemyLaneCards];
            
            // Track which cards will be destroyed
            const newDestroyedCards = { 
                player: [false, false, false], 
                enemy: [false, false, false] 
            };

            // Track guard blocks
            const newGuardBlocks = [...guardAdjacentBlocks];

            playerLaneCards.forEach((playerCard, index) => {
                if (playerCard === null) return;

                const enemyCard = enemyLaneCards[index];
                let damage = playerCard.power || 1;

                // Handle Thief cards
                if (playerCard.attributes?.includes('Thief')) {
                    totalDamage += damage;
                    attackResults.push(`Lane ${index + 1}: Your Thief ${playerCard.name} bypasses defense and deals ${damage} direct damage!`);
                    return; // Skip normal combat for Thief cards
                }

                if (enemyCard === null) {
                    // Use power for direct damage if no attack property
                    totalDamage += damage;
                    attackResults.push(`Lane ${index + 1}: Your ${playerCard.name} deals ${damage} direct damage!`);
                } else {
                    // Handle Guard cards
                    if (enemyCard.attributes?.includes('Guard')) {
                        // Check if guard can block (hasn't used both blocks)
                        if (newGuardBlocks[index] < 2) {
                            newGuardBlocks[index]++;
                            setGuardAdjacentBlocks(newGuardBlocks);
                            attackResults.push(`Lane ${index + 1}: Enemy Guard ${enemyCard.name} blocks the attack! (Block ${newGuardBlocks[index]}/2)`);
                            // Guard doesn't die when blocking, so we don't update the lanes
                            return;
                        }
                    }

                    // Compare power values for normal combat
                    const playerPower = playerCard.power || 1;
                    const enemyPower = enemyCard.power || 1;
                    const battleResult = `Lane ${index + 1}: Your ${playerCard.name} (Power: ${playerPower}) vs Enemy ${enemyCard.name} (Power: ${enemyPower})`;
                    
                    if (playerPower > enemyPower) {
                        attackResults.push(`${battleResult} - Enemy card destroyed!`);
                        newDestroyedCards.enemy[index] = true;
                        updatedEnemyLanes[index] = null;
                        
                        // Handle Curse cards
                        if (enemyCard.attributes?.includes('Curse')) {
                            const curseDamage = enemyCard.power || 1;
                            setPlayerLife(prev => Math.max(0, prev - curseDamage));
                            attackResults.push(`Curse effect: Enemy ${enemyCard.name} deals ${curseDamage} damage from beyond the grave!`);
                        }
                    } else if (playerPower < enemyPower) {
                        attackResults.push(`${battleResult} - Your card destroyed!`);
                        newDestroyedCards.player[index] = true;
                        updatedPlayerLanes[index] = null;
                    } else {
                        attackResults.push(`${battleResult} - Both cards destroyed in equal combat!`);
                        newDestroyedCards.player[index] = true;
                        newDestroyedCards.enemy[index] = true;
                        updatedPlayerLanes[index] = null;
                        updatedEnemyLanes[index] = null;
                        
                        // Handle Curse cards in mutual destruction
                        if (enemyCard.attributes?.includes('Curse')) {
                            const curseDamage = enemyCard.power || 1;
                            setPlayerLife(prev => Math.max(0, prev - curseDamage));
                            attackResults.push(`Curse effect: Enemy ${enemyCard.name} deals ${curseDamage} damage from beyond the grave!`);
                        }
                    }
                }
            });

            // Apply damage and check for victory
            if (totalDamage > 0) {
                setOpponentLife(prev => Math.max(0, prev - totalDamage));
                attackResults.push(`Total direct damage: ${totalDamage}`);
            }

            // Set destroyed cards first to trigger animations
            setDestroyedCards(newDestroyedCards);
            
            // Reset attack animations
            setAttackingCards({ player: [false, false, false], enemy: [false, false, false] });
            
            // Wait for destruction animations to complete before updating state
            setTimeout(() => {
                // Update state with new lane configurations
                setPlayerLaneCards(updatedPlayerLanes);
                setEnemyLaneCards(updatedEnemyLanes);
                setBattleResults(attackResults);
                
                // Reset destroyed cards state
                setDestroyedCards({ player: [false, false, false], enemy: [false, false, false] });
                
                // Ensure we actually have results to show
                if (attackResults.length > 0) {
                    setShowBattleResults(true);
                } else {
                    handleCloseBattleResults();
                }
            }, 1000); // Destruction animation duration
        }, 1000); // Attack animation duration
    };
    
    // Handle opponent attack with animations
    const handleOpponentAttack = () => {
        if (!opponentAttackPhase) return;

        // Mark that opponent has attacked in this battle round
        setOpponentHasAttacked(true);

        // First mark which cards will attack
        const activeOpponentCards = enemyLaneCards.map(card => card !== null);
        setAttackingCards({ player: [false, false, false], enemy: activeOpponentCards });
        
        // After a short delay to show the attack animation, process the combat
        setTimeout(() => {
            const attackResults = [];
            let totalDamage = 0;
            const updatedPlayerLanes = [...playerLaneCards];
            const updatedEnemyLanes = [...enemyLaneCards];
            
            // Track which cards will be destroyed
            const newDestroyedCards = { 
                player: [false, false, false], 
                enemy: [false, false, false] 
            };

            // Track guard blocks
            const newGuardBlocks = [...guardAdjacentBlocks];

            // First, check for guard cards and show blocking modal
            const guardCards = playerLaneCards.map((card, index) => {
                if (card && card.attributes?.includes('Guard') && newGuardBlocks[index] < 2) {
                    return { index, card };
                }
                return null;
            }).filter(Boolean);

            if (guardCards.length > 0) {
                // Show guard block modal for each guard card
                const showGuardBlockModalForCard = (guardIndex) => {
                    setActiveGuardIndex(guardIndex);
                    setShowGuardBlockModal(true);
                };

                // Process each guard card sequentially
                let currentGuardIndex = 0;
                const processNextGuard = () => {
                    if (currentGuardIndex < guardCards.length) {
                        showGuardBlockModalForCard(guardCards[currentGuardIndex].index);
                        currentGuardIndex++;
                    } else {
                        // After all guard blocks are processed, continue with the attack
                        processAttack();
                    }
                };

                // Start processing guard cards
                processNextGuard();
                return; // Exit early, the attack will continue after guard blocks are processed
            }

            // If no guard cards, proceed with normal attack
            processAttack();

            function processAttack() {
                enemyLaneCards.forEach((enemyCard, index) => {
                    if (enemyCard === null) return;

                    const playerCard = playerLaneCards[index];
                    let damage = enemyCard.power || 1;

                    // Handle Thief cards
                    if (enemyCard.attributes?.includes('Thief')) {
                        totalDamage += damage;
                        attackResults.push(`Lane ${index + 1}: Enemy Thief ${enemyCard.name} bypasses defense and deals ${damage} direct damage!`);
                        return; // Skip normal combat for Thief cards
                    }

                    if (playerCard === null) {
                        // Use power for direct damage if no attack property
                        totalDamage += damage;
                        attackResults.push(`Lane ${index + 1}: Enemy ${enemyCard.name} deals ${damage} direct damage!`);
                    } else {
                        // Compare power values for normal combat
                        const opponentPower = enemyCard.power || 1;
                        const playerPower = playerCard.power || 1;
                        const battleResult = `Lane ${index + 1}: Enemy ${enemyCard.name} (Power: ${opponentPower}) vs Your ${playerCard.name} (Power: ${playerPower})`;
                        
                        if (opponentPower > playerPower) {
                            attackResults.push(`${battleResult} - Your card destroyed!`);
                            newDestroyedCards.player[index] = true;
                            updatedPlayerLanes[index] = null;
                            
                            // Handle Curse cards
                            if (playerCard.attributes?.includes('Curse')) {
                                const curseDamage = playerCard.power || 1;
                                totalDamage += curseDamage;
                                attackResults.push(`Curse effect: Your ${playerCard.name} deals ${curseDamage} damage from beyond the grave!`);
                            }
                        } else if (opponentPower < playerPower) {
                            attackResults.push(`${battleResult} - Enemy card destroyed!`);
                            newDestroyedCards.enemy[index] = true;
                            updatedEnemyLanes[index] = null;
                        } else {
                            attackResults.push(`${battleResult} - Both cards destroyed in equal combat!`);
                            newDestroyedCards.player[index] = true;
                            newDestroyedCards.enemy[index] = true;
                            updatedPlayerLanes[index] = null;
                            updatedEnemyLanes[index] = null;
                            
                            // Handle Curse cards in mutual destruction
                            if (playerCard.attributes?.includes('Curse')) {
                                const curseDamage = playerCard.power || 1;
                                totalDamage += curseDamage;
                                attackResults.push(`Curse effect: Your ${playerCard.name} deals ${curseDamage} damage from beyond the grave!`);
                            }
                        }
                    }
                });

                // Apply damage and check for victory
                let playerDefeated = false;
                if (totalDamage > 0) {
                    const newPlayerLife = Math.max(0, playerLife - totalDamage);
                    setPlayerLife(newPlayerLife);
                    attackResults.push(`Total direct damage: ${totalDamage}`);
                    
                    // Check if player is defeated
                    if (newPlayerLife <= 0) {
                        playerDefeated = true;
                        attackResults.push(`You have been defeated!`);
                    }
                }

                // Set destroyed cards first to trigger animations
                setDestroyedCards(newDestroyedCards);
                
                // Reset attack animations
                setAttackingCards({ player: [false, false, false], enemy: [false, false, false] });
                
                // Wait for destruction animations to complete before updating state
                setTimeout(() => {
                    // Update state with new lane configurations
                    setPlayerLaneCards(updatedPlayerLanes);
                    setEnemyLaneCards(updatedEnemyLanes);
                    setBattleResults(attackResults);
                    
                    // Reset destroyed cards state
                    setDestroyedCards({ player: [false, false, false], enemy: [false, false, false] });
                    
                    // Check if player was defeated
                    if (playerDefeated) {
                        setBattleComplete(true);
                        setTimeout(() => {
                            handleDefeat();
                        }, 500);
                        return;
                    }
                    
                    // Ensure we actually have results to show
                    if (attackResults.length > 0) {
                        setShowBattleResults(true);
                    } else {
                        handleCloseBattleResults();
                    }
                }, 1000); // Destruction animation duration
            }
        }, 1000); // Attack animation duration
    };

    useEffect(() => {
        return () => {
            if (messagePopupTimer) {
                clearTimeout(messagePopupTimer);
            }
        };
    }, [messagePopupTimer]);

    const messagePopupStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffcc00',
        padding: '20px 30px',
        borderRadius: '10px',
        border: '2px solid #ffcc00',
        fontWeight: 'bold',
        fontSize: '24px',
        zIndex: 1000,
        boxShadow: '0 0 20px rgba(255, 204, 0, 0.5)',
        textAlign: 'center',
        maxWidth: '80%',
        animation: 'fadeIn 0.3s'
    };

    // Add a new function to prepare the next round
    const prepareNextRound = () => {
        if (battleComplete) return;
        
        const newRoundCount = roundCount + 1;
        
        setRoundCount(newRoundCount);
        setGamePhase('draw');
        setBattleInitiated(false);
        setPlayerAttackPhase(false);
        setOpponentAttackPhase(false);
        setJustCompletedOpponentAttack(false);
        setPlayerHasAttacked(false);
        setOpponentHasAttacked(false);
        setBattleLog([]);
        
        setPlayerTurnCount(0);
        setOpponentTurnCount(0);
        
        setTimeout(() => {
            setShowNewRoundModal(true);
            setGameMessage(`Round ${newRoundCount} begins! Draw your hand for the new round. Surviving cards remain on the field.`);
        }, 100);
    };
    
    // Add function to handle card retention
    const handleRetainCard = (card) => {
        setRetainedCard(card);
        setShowRetainCardModal(false);
        setGameMessage(`Retained ${card.name} for next round! You will draw 2 cards instead of 3.`);
        
        // Transition to draw phase after a short delay
        setTimeout(() => {
            prepareNextRound();
        }, 1500);
    };

    // Add handler for when retain modal is closed without selecting a card
    const handleCloseRetainModal = () => {
        setShowRetainCardModal(false);
        setRetainedCard(null);
        setGameMessage("No card retained. Drawing full hand for next round.");
        
        // Transition to draw phase after a short delay
        setTimeout(() => {
            prepareNextRound();
        }, 1500);
    };

    // Modify handleDrawNewRoundHand to account for retained cards
    const handleDrawNewRoundHand = () => {
        if (remainingDeck.length === 0) {
            setGameMessage("You have no cards left in your deck. Game over!");
            setBattleComplete(true);
            return;
        }
        
        // Draw 2 cards if there's a retained card, otherwise draw 3
        const cardsToDraw = retainedCard ? 2 : 3;
        const newHand = drawCards(cardsToDraw);
        
        // Add retained card to hand if it exists
        const finalHand = retainedCard ? [retainedCard, ...newHand] : newHand;
        setPlayerHand(finalHand);
        
        // Clear retained card
        setRetainedCard(null);
        
        setupOpponentNewRoundHand(3); // Opponent always draws 3
        
        setPlayerMana(Math.min(10, 4 + roundCount - 1));
        setOpponentMana(Math.min(10, 4 + roundCount - 1));
        
        setShowNewRoundModal(false);
        setGamePhase('placement');
        
        const playerCardCount = playerLaneCards.filter(card => card !== null).length;
        const enemyCardCount = enemyLaneCards.filter(card => card !== null).length;
        
        // Determine who goes first based on round count and coin toss
        const playerFirst = roundCount % 2 === 1 ? coinTossResult === 'heads' : coinTossResult !== 'heads';
        
        // Reset turn counts for the new round
        setPlayerTurnCount(0);
        setOpponentTurnCount(0);
        
        // Set player's turn state
        setIsPlayerTurn(playerFirst);
        
        if (playerCardCount > 0 || enemyCardCount > 0) {
            setGameMessage(`New round! ${playerCardCount} of your cards and ${enemyCardCount} enemy cards survived. ${playerFirst ? "You" : "Opponent"} goes first.`);
        } else {
            setGameMessage(`New round! ${playerFirst ? "You" : "Opponent"} goes first. Place cards in the lanes.`);
        }
        
        if (!playerFirst) {
            setTimeout(handleOpponentPlacement, 1500);
        }
    };

    // Add the setupOpponentNewRoundHand function
    const setupOpponentNewRoundHand = (cardCount = 3) => {
        const opponentCards = [];
        for (let i = 0; i < cardCount; i++) {
            opponentCards.push({
                id: `opponent-card-${i}`,
                name: `Opponent Card ${i+1}`,
                power: Math.floor(Math.random() * 5) + 1,
                cost: Math.floor(Math.random() * 3) + 1,
                image: "/assets/images/card_backs/CARDBACK.png"
            });
        }
        
        setOpponentHand(opponentCards);
        setOpponentDeck([...opponentCards]);
    };

    const initiateBattlePhase = () => {
        // Reset attack tracking for new battle phase
        setPlayerHasAttacked(false);
        setOpponentHasAttacked(false);
        
        // Set the game phase to battle
        setGamePhase('battle');
        setBattleInitiated(true);
        
        // Set appropriate message for who attacks first based on the coin toss
        const playerFirst = coinTossResult === 'heads';
        displayGameMessage(playerFirst ? 
            "Battle Phase begins! You attack first!" : 
            "Battle Phase begins! Opponent attacks first!");
        
        // Reveal opponent's cards for battle
        const revealedEnemyCards = enemyLaneCards.map(card => {
            if (!card) return null;
            
            if (card.revealed) return card;
            
            const revealedCard = {
                ...card,
                image: `/assets/images/cards/card-${Math.floor(Math.random() * 20) + 1}.png`,
                revealed: true
            };
            return revealedCard;
        });
        
        setEnemyLaneCards(revealedEnemyCards);
        
        // Start the battle sequence after a brief delay
        setTimeout(() => {
            if (playerFirst) {
                displayGameMessage("Your Attack Phase begins!");
                
                // Important: don't call handlePlayerAttack directly after setting state
                // Instead, use the useEffect hook to listen for playerAttackPhase changes
                setPlayerAttackPhase(true);
            } else {
                displayGameMessage("Opponent's Attack Phase begins!");
                
                // Important: don't call handleOpponentAttack directly after setting state
                // Instead, use the useEffect hook to listen for opponentAttackPhase changes
                setOpponentAttackPhase(true);
            }
        }, 1500);
    };

    // Add a new useEffect to monitor the player attack phase state
    useEffect(() => {
        // Only run when playerAttackPhase changes to true
        if (playerAttackPhase) {
            // Add slight delay to ensure all state is properly updated
            setTimeout(() => {
                handlePlayerAttack(); // Remove the activeGuardIndex parameter
            }, 500);
        }
    }, [playerAttackPhase]);

    // Add a new useEffect to monitor the opponent attack phase state
    useEffect(() => {
        // Only run when opponentAttackPhase changes to true
        if (opponentAttackPhase) {
            // Add slight delay to ensure all state is properly updated
            setTimeout(() => {
                handleOpponentAttack();
            }, 500);
        }
    }, [opponentAttackPhase]);

    // Add function to handle guard adjacent blocking
    const handleGuardAdjacentBlock = (guardIndex, targetIndex) => {
        if (guardAdjacentBlocks[guardIndex]) {
            setGameMessage("This Guard has already blocked an adjacent lane this phase!");
            return;
        }

        const newGuardAdjacentBlocks = [...guardAdjacentBlocks];
        newGuardAdjacentBlocks[guardIndex] = true;
        setGuardAdjacentBlocks(newGuardAdjacentBlocks);

        // Process the adjacent block
        const playerCard = playerLaneCards[targetIndex];
        if (playerCard) {
            const damage = playerCard.power || 1;
            setOpponentLife(prev => Math.max(0, prev - damage));
            setGameMessage(`Guard in lane ${guardIndex + 1} blocked attack from lane ${targetIndex + 1}!`);
        }

        setShowGuardBlockModal(false);
    };

    // Add a new useEffect to monitor turn counts and automatically transition to battle phase
    useEffect(() => {
        if (gamePhase === 'placement' && playerTurnCount >= 3 && opponentTurnCount >= 3) {
            setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
            setTimeout(() => {
                initiateBattlePhase();
            }, 1000);
        }
    }, [playerTurnCount, opponentTurnCount, gamePhase]);

    return (
        <div className="arena-container">
            <div className="game-board">
                <div className="message-display">{gameMessage}</div>
                
                {showMessagePopup && (
                    <div style={messagePopupStyle}>
                        {messagePopupText}
                    </div>
                )}
                
                {gamePhase === 'placement' && (
                    <div className="turn-indicator">
                        {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
                    </div>
                )}
                
                {gamePhase === 'battle' && (
                    <div className="turn-indicator battle-phase">
                        {playerAttackPhase ? "Your Attack Phase" : 
                         opponentAttackPhase ? "Opponent's Attack Phase" : 
                         "Battle Phase"}
                    </div>
                )}
                
                {isPlayerTurn && gamePhase === 'placement' && playerTurnCount < 3 && (
                    <div className="pass-turn-container">
                        <button 
                            className="pass-turn-button"
                            onClick={handlePassTurn}
                            title="End your turn"
                        >
                            End Turn
                        </button>
                    </div>
                )}
                
                {positionConfig.enemyLanes.map((style, index) => (
                    <div 
                        key={`enemy-lane-${index}`}
                        className={`lane enemy-lane ${enemyLaneCards[index] ? 'occupied' : 'empty'} ${opponentAttackPhase && enemyLaneCards[index] ? 'attacking' : ''}`}
                        style={style}
                    >
                        {enemyLaneCards[index] && (
                            <div className={`placed-card enemy-card 
                                ${gamePhase === 'battle' ? 'revealed' : ''} 
                                ${attackingCards.enemy[index] ? 'attacking-card' : ''} 
                                ${destroyedCards.enemy[index] ? 'destroyed-card' : ''}`}
                            >
                                <img 
                                    className="card-full-image" 
                                    src={enemyLaneCards[index].image} 
                                    alt={enemyLaneCards[index].name} 
                                />
                            </div>
                        )}
                    </div>
                ))}
                
                {positionConfig.playerLanes.map((style, index) => (
                    <div 
                        key={`player-lane-${index}`}
                        className={`lane player-lane ${playerLaneCards[index] ? 'occupied' : 'empty'} ${isPlayerTurn && gamePhase === 'placement' ? 'active-turn' : ''} ${playerAttackPhase && playerLaneCards[index] ? 'attacking' : ''}`}
                        style={style}
                        onDragOver={gamePhase === 'placement' ? handleDragOver : null}
                        onDrop={gamePhase === 'placement' ? (e) => handleDrop(e, index) : null}
                    >
                        {playerLaneCards[index] && (
                            <div 
                                className={`placed-card 
                                    ${attackingCards.player[index] ? 'attacking-card' : ''} 
                                    ${destroyedCards.player[index] ? 'destroyed-card' : ''}`}
                                onClick={gamePhase === 'placement' && isPlayerTurn ? () => handleRetractCard(index) : null}
                                title={gamePhase === 'placement' && isPlayerTurn ? "Click to return to hand" : ""}
                            >
                                <img 
                                    className="card-full-image" 
                                    src={playerLaneCards[index].image || "/assets/images/card_backs/CARDBACK.png"} 
                                    alt={playerLaneCards[index].name} 
                                />
                                {gamePhase === 'placement' && isPlayerTurn && (
                                    <div className="retract-hint">Return to hand</div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                
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
                                onClick={handleForfeitClick}
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
                
                {playerHand.length > 0 && gamePhase === 'placement' && (
                    <div className="player-hand">
                        {playerHand.map((card, index) => (
                            <div 
                                key={card.id} 
                                className={`card-container ${isPlayerTurn && gamePhase === 'placement' ? 'active-turn' : 'inactive-turn'}`}
                                draggable={isPlayerTurn && gamePhase === 'placement'}
                                onDragStart={(e) => isPlayerTurn && gamePhase === 'placement' ? handleDragStart(e, card) : null}
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
                                onClick={handleCloseBattleResults}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}
                
                {showForfeitConfirmModal && (
                    <div className="modal-overlay">
                        <div className="forfeit-modal">
                            <h2>Forfeit Match?</h2>
                            <p>Are you sure you want to forfeit? This will count as a loss.</p>
                            <div className="forfeit-actions">
                                <button onClick={handleConfirmForfeit} className="confirm-forfeit">Yes, Forfeit</button>
                                <button onClick={handleCancelForfeit} className="cancel-forfeit">No, Continue Playing</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {showIntroModal && (
                    <div className="modal-overlay">
                        <div className="intro-modal">
                            <h2>Welcome to Mythos Arena</h2>
                            <div className="intro-actions">
                                <button onClick={handlePlayClick}>Play</button>
                                <button onClick={handleTutorialClick}>Tutorial</button>
                                <button onClick={handleReturnToDashboard} className="return-button">Dashboard</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {showDeckSelectionModal && (
                    <div className="modal-overlay">
                        <div className="deck-selection-modal">
                            <h2>Select Your Deck</h2>
                            {userDecks.length > 0 ? (
                                <div className="deck-selection-grid">
                                    {userDecks.map(deck => (
                                        <div 
                                            key={deck.id} 
                                            className="deck-selection-card"
                                            onClick={() => handleDeckSelect(deck.id)}
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
                            <button onClick={handleReturnToDashboard} className="return-button">Dashboard</button>
                        </div>
                    </div>
                )}
                
                {showDrawHandModal && (
                    <div className="modal-overlay">
                        <div className="intro-modal draw-hand-modal">
                            <h2>Ready to Battle</h2>
                            <p>Your deck has been prepared. Draw your first hand to begin the game!</p>
                            <div className="intro-actions">
                                <button onClick={handleDrawFirstHand}>Draw First Hand</button>
                                <button onClick={handleReturnToDashboard} className="return-button">Dashboard</button>
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
                                    <button onClick={handleCoinToss}>Toss Coin</button>
                                    <button onClick={handleReturnToDashboard} className="return-button">Dashboard</button>
                                </div>
                            )}
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
                            <button className="close-tutorial-button" onClick={handleCloseTutorial}>Close Tutorial</button>
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
                                <button onClick={handleDrawNewRoundHand}>Draw New Hand</button>
                                <button onClick={handleForfeitClick} className="forfeit-button">Forfeit</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {showGameOverModal && (
                    <div className="modal-overlay game-over-overlay">
                        <div className={`game-over-modal ${gameResult}`}>
                            <h1>{gameResult === 'victory' ? 'VICTORY!' : 'DEFEAT!'}</h1>
                            <p>{gameResult === 'victory' 
                                ? 'You have defeated your opponent!' 
                                : 'Your opponent has defeated you!'}
                            </p>
                            {gameResult === 'victory' && (
                                <div className="reward-container">
                                    <p className="reward-text">Reward: <span className="gems">+30 Gems</span></p>
                                    <img src="/assets/images/misc/gem.png" alt="Gems" className="gem-icon" />
                                </div>
                            )}
                            <div className="game-over-stats">
                                <p>Your final HP: {playerLife}</p>
                                <p>Enemy final HP: {opponentLife}</p>
                                <p>Battle rounds: {roundCount}</p>
                            </div>
                            <p className="return-message">Returning to dashboard in a few seconds...</p>
                            <button 
                                className="return-now-button"
                                onClick={() => navigate(`/users/${userId}/dashboard`, { state: { user: userData } })}
                            >
                                Return Now
                            </button>
                        </div>
                    </div>
                )}
                
                {showGuardBlockModal && (
                    <div className="modal-overlay">
                        <div className="guard-block-modal">
                            <h2>Guard Block Choice</h2>
                            <p>Choose whether to block an adjacent lane with your Guard:</p>
                            <div className="guard-block-options">
                                <button 
                                    onClick={() => handleGuardAdjacentBlock(activeGuardIndex, activeGuardIndex - 1)}
                                    disabled={activeGuardIndex === 0 || guardAdjacentBlocks[activeGuardIndex]}
                                >
                                    Block Left Lane
                                </button>
                                <button 
                                    onClick={() => handleGuardAdjacentBlock(activeGuardIndex, activeGuardIndex + 1)}
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
                                {playerHand.map((card, index) => (
                                    <button 
                                        key={card.id}
                                        onClick={() => handleRetainCard(card)}
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
                                    onClick={handleCloseRetainModal}
                                    className="cancel-button"
                                >
                                    Don't Retain
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='arena-background'>
                <img src='/assets/images/misc/game-board-6.png' alt="Arena Background" />
            </div>
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes attackUp {
                    0% { transform: translateY(0); filter: brightness(1); }
                    50% { transform: translateY(-30px); filter: brightness(1.5) drop-shadow(0 0 10px gold); }
                    100% { transform: translateY(0); filter: brightness(1); }
                }
                @keyframes attackDown {
                    0% { transform: translateY(0); filter: brightness(1); }
                    50% { transform: translateY(30px); filter: brightness(1.5) drop-shadow(0 0 10px crimson); }
                    100% { transform: translateY(0); filter: brightness(1); }
                }
                @keyframes destroyed {
                    0% { opacity: 1; transform: scale(1) rotate(0deg); filter: brightness(1); }
                    20% { opacity: 0.9; transform: scale(1.1) rotate(5deg); filter: brightness(1.5) contrast(1.2); }
                    40% { opacity: 0.7; transform: scale(0.9) rotate(-5deg); filter: sepia(0.5) hue-rotate(30deg); }
                    60% { opacity: 0.5; transform: scale(0.8) rotate(10deg); filter: contrast(1.4) brightness(1.2); }
                    80% { opacity: 0.3; transform: scale(0.6) rotate(-15deg); filter: blur(2px) grayscale(0.7); }
                    100% { opacity: 0; transform: scale(0.1) rotate(30deg); filter: blur(5px) grayscale(1); }
                }
                @keyframes victoryPulse {
                    0% { box-shadow: 0 0 20px gold; background-color: rgba(50, 50, 10, 0.9); }
                    50% { box-shadow: 0 0 40px gold; background-color: rgba(80, 80, 20, 0.9); }
                    100% { box-shadow: 0 0 20px gold; background-color: rgba(50, 50, 10, 0.9); }
                }
                @keyframes defeatPulse {
                    0% { box-shadow: 0 0 20px crimson; background-color: rgba(50, 10, 10, 0.9); }
                    50% { box-shadow: 0 0 40px crimson; background-color: rgba(80, 20, 20, 0.9); }
                    100% { box-shadow: 0 0 20px crimson; background-color: rgba(50, 10, 10, 0.9); }
                }
                @keyframes gemShine {
                    0% { filter: brightness(1) drop-shadow(0 0 5px #4affff); }
                    50% { filter: brightness(1.5) drop-shadow(0 0 15px #4affff); }
                    100% { filter: brightness(1) drop-shadow(0 0 5px #4affff); }
                }
                .game-over-overlay {
                    z-index: 1100;
                    background-color: rgba(0, 0, 0, 0.8);
                }
                .game-over-modal {
                    width: 60%;
                    max-width: 600px;
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    color: white;
                    font-family: 'Cinzel', serif;
                    animation: fadeIn 1s ease-in;
                }
                .game-over-modal.victory {
                    background-color: rgba(50, 50, 10, 0.9);
                    border: 3px solid gold;
                    box-shadow: 0 0 30px gold;
                    animation: victoryPulse 2s infinite;
                }
                .game-over-modal.defeat {
                    background-color: rgba(50, 10, 10, 0.9);
                    border: 3px solid crimson;
                    box-shadow: 0 0 30px crimson;
                    animation: defeatPulse 2s infinite;
                }
                .game-over-modal h1 {
                    font-size: 48px;
                    margin-bottom: 20px;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
                }
                .victory h1 {
                    color: gold;
                }
                .defeat h1 {
                    color: crimson;
                }
                .reward-container {
                    margin: 25px 0;
                    padding: 10px;
                    background-color: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                }
                .reward-text {
                    font-size: 24px;
                    margin: 0;
                }
                .gems {
                    color: #4affff;
                    font-weight: bold;
                }
                .gem-icon {
                    width: 32px;
                    height: 32px;
                    animation: gemShine 2s infinite;
                }
                .game-over-stats {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    font-size: 18px;
                }
                .return-message {
                    margin-top: 20px;
                    font-style: italic;
                }
                .return-now-button {
                    margin-top: 15px;
                    padding: 10px 20px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border: 2px solid white;
                    color: white;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .return-now-button:hover {
                    background-color: rgba(255, 255, 255, 0.4);
                    transform: scale(1.05);
                }
                .enemy-card.attacking-card {
                    animation: attackDown 1s ease-in-out;
                    z-index: 100;
                }
                .placed-card.attacking-card {
                    animation: attackUp 1s ease-in-out;
                    z-index: 100;
                }
                .destroyed-card {
                    animation: destroyed 1s ease-in-out forwards;
                    pointer-events: none;
                    z-index: 50;
                }
                .placed-card {
                    transition: all 0.3s ease;
                }
                .placed-card:hover {
                    transform: scale(1.05);
                }
                .lane.player-lane.active-turn:empty {
                    box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
                    animation: pulseDrop 2s infinite;
                }
                @keyframes pulseDrop {
                    0% { box-shadow: 0 0 15px rgba(0, 255, 0, 0.3); }
                    50% { box-shadow: 0 0 25px rgba(0, 255, 0, 0.5); }
                    100% { box-shadow: 0 0 15px rgba(0, 255, 0, 0.3); }
                }
                .guard-block-modal {
                    background-color: rgba(0, 0, 0, 0.9);
                    border: 2px solid #ffcc00;
                    border-radius: 10px;
                    padding: 20px;
                    color: white;
                    text-align: center;
                }
                .guard-block-options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 20px;
                }
                .guard-block-options button {
                    padding: 10px;
                    background-color: rgba(255, 204, 0, 0.2);
                    border: 1px solid #ffcc00;
                    color: #ffcc00;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .guard-block-options button:hover:not(:disabled) {
                    background-color: rgba(255, 204, 0, 0.4);
                }
                .guard-block-options button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .cancel-button {
                    background-color: rgba(255, 0, 0, 0.2) !important;
                    border-color: #ff0000 !important;
                    color: #ff0000 !important;
                }
                .retain-card-modal {
                    background-color: rgba(0, 0, 0, 0.9);
                    border: 2px solid #ffcc00;
                    border-radius: 10px;
                    padding: 20px;
                    color: white;
                    text-align: center;
                    max-width: 800px;
                    width: 90%;
                }
                .retain-card-options {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-top: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                }
                .retain-card-button {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 10px;
                    background-color: rgba(255, 204, 0, 0.2);
                    border: 1px solid #ffcc00;
                    color: #ffcc00;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: 100%;
                    text-align: left;
                }
                .retain-card-button:hover {
                    background-color: rgba(255, 204, 0, 0.4);
                    transform: translateX(10px);
                }
                .retain-card-image {
                    width: 80px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 5px;
                }
                .retain-card-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .card-name {
                    font-weight: bold;
                    font-size: 1.2em;
                }
                .card-cost, .card-power {
                    font-size: 0.9em;
                    opacity: 0.8;
                }
                `}
            </style>
        </div>
    );
}

export default Arena;