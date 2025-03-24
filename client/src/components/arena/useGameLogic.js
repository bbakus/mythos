import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGameLogic(userId, userData) {
    const navigate = useNavigate();
    
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
    const [gamePhase, setGamePhase] = useState('init');
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [coinTossResult, setCoinTossResult] = useState(null);
    const [playerTurnCount, setPlayerTurnCount] = useState(0);
    const [opponentTurnCount, setOpponentTurnCount] = useState(0);
    const [battleInitiated, setBattleInitiated] = useState(false);
    const [playerAttackPhase, setPlayerAttackPhase] = useState(false);
    const [opponentAttackPhase, setOpponentAttackPhase] = useState(false);
    const [battleComplete, setBattleComplete] = useState(false);
    const [battleLog, setBattleLog] = useState([]);
    const [battleResults, setBattleResults] = useState([]);
    const [showBattleResults, setShowBattleResults] = useState(false);
    
    // Opponent setup
    const [opponentDeck, setOpponentDeck] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [opponentMana, setOpponentMana] = useState(4);
    const [opponentLife, setOpponentLife] = useState(40);
    
    // Round tracking
    const [roundCount, setRoundCount] = useState(1);
    const [showNewRoundModal, setShowNewRoundModal] = useState(false);
    
    // Phase completion tracking
    const [justCompletedOpponentAttack, setJustCompletedOpponentAttack] = useState(false);
    
    // Message popup tracking
    const [showMessagePopup, setShowMessagePopup] = useState(false);
    const [messagePopupText, setMessagePopupText] = useState('');
    const [messagePopupTimer, setMessagePopupTimer] = useState(null);
    
    // Card animation tracking
    const [attackingCards, setAttackingCards] = useState({ player: [false, false, false], enemy: [false, false, false] });
    const [destroyedCards, setDestroyedCards] = useState({ player: [false, false, false], enemy: [false, false, false] });
    
    // Attack phase tracking
    const [playerHasAttacked, setPlayerHasAttacked] = useState(false);
    const [opponentHasAttacked, setOpponentHasAttacked] = useState(false);
    
    // Game over tracking
    const [gameOver, setGameOver] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    
    // Guard blocking tracking
    const [showGuardBlockModal, setShowGuardBlockModal] = useState(false);
    const [activeGuardIndex, setActiveGuardIndex] = useState(null);
    const [guardAdjacentBlocks, setGuardAdjacentBlocks] = useState([false, false, false]);
    
    // Card retention tracking
    const [retainedCard, setRetainedCard] = useState(null);
    const [showRetainCardModal, setShowRetainCardModal] = useState(false);

    // Fetch user decks on component mount
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

    // Fetch deck cards when a deck is selected
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
                setRemainingDeck([...gameCards]);
            })
            .catch(error => {
                setGameMessage('Error loading cards. Please try again.');
            });
        }
    }, [userId, selectedDeck]);

    // Clean up message popup timer
    useEffect(() => {
        return () => {
            if (messagePopupTimer) {
                clearTimeout(messagePopupTimer);
            }
        };
    }, [messagePopupTimer]);

    // Monitor turn counts for battle phase transition
    useEffect(() => {
        if (gamePhase === 'placement' && playerTurnCount >= 3 && opponentTurnCount >= 3) {
            setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
            setTimeout(() => {
                initiateBattlePhase();
            }, 1000);
        }
    }, [playerTurnCount, opponentTurnCount, gamePhase]);

    // Monitor attack phases
    useEffect(() => {
        if (playerAttackPhase) {
            setTimeout(() => {
                handlePlayerAttack();
            }, 500);
        }
    }, [playerAttackPhase]);

    useEffect(() => {
        if (opponentAttackPhase) {
            setTimeout(() => {
                handleOpponentAttack();
            }, 500);
        }
    }, [opponentAttackPhase]);

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
            if (data.wallet !== undefined) {
                const updatedUser = {...userData, wallet: data.wallet};
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        })
        .catch(error => {
            console.error("Error updating wallet:", error);
        });
        
        setTimeout(() => {
            navigate(`/users/${userId}/dashboard`, { state: { user: userData } });
        }, 6000);
    };

    const handleDefeat = () => {
        setGameMessage("Defeat! Your opponent has defeated you!");
        setGameOver(true);
        setGameResult('defeat');
        setShowGameOverModal(true);
        
        setTimeout(() => {
            navigate(`/users/${userId}/dashboard`, { state: { user: userData } });
        }, 6000);
    };

    // Display game messages
    const displayGameMessage = (message) => {
        setGameMessage(message);
        setMessagePopupText(message);
        setShowMessagePopup(true);
        
        if (messagePopupTimer) {
            clearTimeout(messagePopupTimer);
        }
        
        const timer = setTimeout(() => {
            setShowMessagePopup(false);
        }, 3000);
        
        setMessagePopupTimer(timer);
    };

    // Handle deck selection
    const handleDeckSelect = async (deckId) => {
        setSelectedDeck(deckId);
        setShowDeckSelectionModal(false);
        
        // Fetch deck cards immediately
        try {
            const response = await fetch(`/users/${userId}/decks/${deckId}/cards`);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const data = await response.json();
            
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
            setRemainingDeck([...gameCards]);
            
            // Only show draw hand modal after deck is initialized
            setShowDrawHandModal(true);
            setGameMessage('Ready to begin the battle!');
        } catch (error) {
            setGameMessage('Error loading cards. Please try again.');
        }
    };

    // Draw random cards from the deck
    const drawCards = (count) => {
        console.log("Drawing cards. Count:", count);
        console.log("Current remaining deck:", remainingDeck);
        
        if (!remainingDeck || remainingDeck.length < count) {
            console.log("Not enough cards in deck");
            return [];
        }
        
        // Create a new array with the remaining cards
        const newDeck = [...remainingDeck];
        const drawnCards = [];
        
        // Draw the specified number of cards
        for (let i = 0; i < count; i++) {
            if (newDeck.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * newDeck.length);
            const drawnCard = newDeck.splice(randomIndex, 1)[0];
            drawnCards.push(drawnCard);
        }
        
        console.log("Drawn cards:", drawnCards);
        console.log("Updated remaining deck:", newDeck);
        
        // Update the remaining deck state
        setRemainingDeck(newDeck);
        
        return drawnCards;
    };

    // Handle drawing first hand
    const handleDrawFirstHand = async () => {
        console.log("Drawing first hand");
        console.log("Current deck:", remainingDeck);
        
        if (!remainingDeck || remainingDeck.length === 0) {
            console.log("No cards in deck!");
            setGameMessage("No cards available to draw. Please select a different deck.");
            return;
        }
        
        // Draw 3 cards directly from the remaining deck
        const currentDeck = [...remainingDeck];
        const initialHand = [];
        
        for (let i = 0; i < 3; i++) {
            if (currentDeck.length === 0) break;
            const randomIndex = Math.floor(Math.random() * currentDeck.length);
            const drawnCard = currentDeck.splice(randomIndex, 1)[0];
            initialHand.push(drawnCard);
        }
        
        console.log("Drawn initial hand:", initialHand);
        console.log("Updated deck:", currentDeck);
        
        // Update the deck and hand states
        setRemainingDeck(currentDeck);
        setPlayerHand(initialHand);
        
        // Generate and set up opponent's deck
        const opponentDeck = await generateOpponentDeck();
        console.log("Generated opponent deck:", opponentDeck);
        
        if (!opponentDeck || opponentDeck.length === 0) {
            console.log("Failed to generate opponent deck");
            setGameMessage("Failed to generate opponent's deck. Please try again.");
            return;
        }
        
        // Set up opponent's hand and deck
        const opponentHand = opponentDeck.slice(0, 3);
        const remainingOpponentDeck = opponentDeck.slice(3);
        console.log("Opponent's initial hand:", opponentHand);
        
        setOpponentDeck(remainingOpponentDeck);
        setOpponentHand(opponentHand);
        
        // Close draw modal and show coin toss
        setShowDrawHandModal(false);
        setShowCoinTossModal(true);
        setGameMessage('Determining who goes first with a coin toss!');
    };

    // Set up the opponent's initial hand
    const setupOpponentInitialHand = async (cardCount = 3) => {
        console.log("Setting up opponent's initial hand");
        // Generate the deck if it doesn't exist
        if (opponentDeck.length === 0) {
            console.log("Generating opponent deck");
            const deck = await generateOpponentDeck();
            if (deck.length === 0) {
                console.error("Failed to generate opponent deck");
                return;
            }
            console.log("Generated deck:", deck);
        }
        
        // Draw cards from the deck
        const drawnCards = opponentDeck.slice(0, cardCount);
        console.log("Drawn cards:", drawnCards);
        setOpponentHand(drawnCards);
        
        // Update the deck to remove drawn cards
        setOpponentDeck(prevDeck => {
            const newDeck = prevDeck.slice(cardCount);
            console.log("Updated deck:", newDeck);
            return newDeck;
        });
    };

    // Generate opponent's deck
    const generateOpponentDeck = async () => {
        try {
            const response = await fetch('/cards');
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const allCards = await response.json();
            console.log("All cards:", allCards);
            
            if (!allCards || allCards.length === 0) {
                throw new Error('No cards available');
            }
            
            // Create a balanced deck with 20 cards
            const deck = [];
            const cardTypes = {
                low: [], // 1-2 mana
                medium: [], // 3-4 mana
                high: [] // 5-6 mana
            };
            
            // Sort cards by mana cost
            allCards.forEach(card => {
                if (card.cost <= 2) cardTypes.low.push(card);
                else if (card.cost <= 4) cardTypes.medium.push(card);
                else cardTypes.high.push(card);
            });
            
            console.log("Card types:", cardTypes);
            
            // Add cards to deck with balanced distribution
            // 8 low cost cards
            for (let i = 0; i < 8; i++) {
                const randomIndex = Math.floor(Math.random() * cardTypes.low.length);
                const baseCard = cardTypes.low[randomIndex];
                deck.push({
                    ...baseCard,
                    id: `opponent-low-${i}`,
                    image: baseCard.image || "/assets/images/card_backs/CARDBACK.png"
                });
            }
            
            // 7 medium cost cards
            for (let i = 0; i < 7; i++) {
                const randomIndex = Math.floor(Math.random() * cardTypes.medium.length);
                const baseCard = cardTypes.medium[randomIndex];
                deck.push({
                    ...baseCard,
                    id: `opponent-medium-${i}`,
                    image: baseCard.image || "/assets/images/card_backs/CARDBACK.png"
                });
            }
            
            // 5 high cost cards
            for (let i = 0; i < 5; i++) {
                const randomIndex = Math.floor(Math.random() * cardTypes.high.length);
                const baseCard = cardTypes.high[randomIndex];
                deck.push({
                    ...baseCard,
                    id: `opponent-high-${i}`,
                    image: baseCard.image || "/assets/images/card_backs/CARDBACK.png"
                });
            }
            
            // Shuffle the deck
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            
            console.log("Generated opponent deck:", deck);
            return deck;
            
        } catch (error) {
            console.error('Error generating opponent deck:', error);
            return [];
        }
    };

    // Handle coin toss
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
                    setTimeout(() => {
                        handleOpponentPlacement();
                    }, 1500);
                }
            }, 2000);
        }, 1500);
    };

    // Handle opponent's card placement
    const handleOpponentPlacement = () => {
        console.log("handleOpponentPlacement called");
        console.log("Opponent's hand:", opponentHand);
        console.log("Opponent's mana:", opponentMana);
        console.log("Opponent's turn count:", opponentTurnCount);
        console.log("Enemy lane cards:", enemyLaneCards);
        
        if (battleInitiated || gamePhase === 'battle') {
            console.log("Battle already initiated or in battle phase");
            return;
        }
        
        if (opponentTurnCount >= 3) {
            console.log("Opponent has used all turns");
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
            
            console.log("Available lanes:", availableLanes);
            
            if (availableLanes.length > 0) {
                const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
                
                const affordableCards = opponentHand.filter(card => card.cost <= opponentMana);
                console.log("Affordable cards:", affordableCards);
                
                if (affordableCards.length > 0) {
                    const cardIndex = Math.floor(Math.random() * affordableCards.length);
                    const cardToPlace = affordableCards[cardIndex];
                    console.log("Card to place:", cardToPlace);
                    
                    const newLaneCards = [...enemyLaneCards];
                    newLaneCards[laneIndex] = cardToPlace;
                    setEnemyLaneCards(newLaneCards);
                    
                    const newHand = opponentHand.filter(card => card.id !== cardToPlace.id);
                    setOpponentHand(newHand);
                    
                    setOpponentMana(prevMana => prevMana - cardToPlace.cost);
                    
                    // Add a delay to show the card being placed
                    setTimeout(() => {
                        setGameMessage(`Opponent placed ${cardToPlace.name} in lane ${laneIndex + 1}`);
                    }, 500);
                }
            }
        }

        const newOpponentTurnCount = opponentTurnCount + 1;
        setOpponentTurnCount(newOpponentTurnCount);
        
        if (playerTurnCount >= 3 && newOpponentTurnCount >= 3) {
            setTimeout(() => {
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            }, 500);
            return;
        }
        
        setIsPlayerTurn(true);
        setTimeout(() => {
            setGameMessage(`Your turn: Place a card in an available lane or end turn. (Turn ${playerTurnCount + 1} of 3)`);
        }, 1000);
    };

    // Handle player pass turn
    const handlePassTurn = () => {
        if (!isPlayerTurn || gamePhase !== 'placement') {
            return;
        }
        
        if (battleInitiated || gamePhase === 'battle') {
            return;
        }
        
        if (playerTurnCount >= 3) {
            if (opponentTurnCount >= 3) {
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
        
        if (newPlayerTurnCount >= 3 && opponentTurnCount >= 3) {
            setTimeout(() => {
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            }, 500);
            return;
        }
        
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

    // Handle drop on lane
    const handleDrop = (e, laneIndex) => {
        e.preventDefault();
        
        if (!isPlayerTurn || gamePhase !== 'placement') {
            setGameMessage("It's not your turn to place a card yet!");
            return;
        }
        
        if (battleInitiated || gamePhase === 'battle') {
            return;
        }
        
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
        
        if (newPlayerTurnCount >= 3 && opponentTurnCount >= 3) {
            setTimeout(() => {
                setGameMessage(`Placement phase complete! (3 turns each) Preparing for battle...`);
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            }, 500);
            return;
        }
        
        setIsPlayerTurn(false);
        setTimeout(() => {
            setGameMessage(`Opponent's turn: They are placing a card... (Turn ${opponentTurnCount + 1} of 3)`);
            setTimeout(handleOpponentPlacement, 1000);
        }, 500);
    };

    // Handle retracting a card
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

    // Handle battle phase
    const initiateBattlePhase = () => {
        setPlayerHasAttacked(false);
        setOpponentHasAttacked(false);
        
        setGamePhase('battle');
        setBattleInitiated(true);
        
        const playerFirst = coinTossResult === 'heads';
        displayGameMessage(playerFirst ? 
            "Battle Phase begins! You attack first!" : 
            "Battle Phase begins! Opponent attacks first!");
        
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
        
        setTimeout(() => {
            if (playerFirst) {
                displayGameMessage("Your Attack Phase begins!");
                setPlayerAttackPhase(true);
            } else {
                displayGameMessage("Opponent's Attack Phase begins!");
                setOpponentAttackPhase(true);
            }
        }, 1500);
    };

    // Handle player attack
    const handlePlayerAttack = () => {
        setPlayerHasAttacked(true);

        const activePlayerCards = playerLaneCards.map(card => card !== null);
        setAttackingCards({ player: activePlayerCards, enemy: [false, false, false] });
        
        setTimeout(() => {
            const attackResults = [];
            let totalDamage = 0;
            const updatedPlayerLanes = [...playerLaneCards];
            const updatedEnemyLanes = [...enemyLaneCards];
            
            const newDestroyedCards = { 
                player: [false, false, false], 
                enemy: [false, false, false] 
            };

            const newGuardBlocks = [...guardAdjacentBlocks];

            playerLaneCards.forEach((playerCard, index) => {
                if (playerCard === null) return;

                const enemyCard = enemyLaneCards[index];
                let damage = playerCard.power || 1;

                if (playerCard.attributes?.includes('Thief')) {
                    totalDamage += damage;
                    attackResults.push(`Lane ${index + 1}: Your Thief ${playerCard.name} bypasses defense and deals ${damage} direct damage!`);
                    return;
                }

                if (enemyCard === null) {
                    totalDamage += damage;
                    attackResults.push(`Lane ${index + 1}: Your ${playerCard.name} deals ${damage} direct damage!`);
                } else {
                    if (enemyCard.attributes?.includes('Guard')) {
                        if (newGuardBlocks[index] < 2) {
                            newGuardBlocks[index]++;
                            setGuardAdjacentBlocks(newGuardBlocks);
                            attackResults.push(`Lane ${index + 1}: Enemy Guard ${enemyCard.name} blocks the attack! (Block ${newGuardBlocks[index]}/2)`);
                            return;
                        }
                    }

                    const playerPower = playerCard.power || 1;
                    const enemyPower = enemyCard.power || 1;
                    const battleResult = `Lane ${index + 1}: Your ${playerCard.name} (Power: ${playerPower}) vs Enemy ${enemyCard.name} (Power: ${enemyPower})`;
                    
                    if (playerPower > enemyPower) {
                        attackResults.push(`${battleResult} - Enemy card destroyed!`);
                        newDestroyedCards.enemy[index] = true;
                        updatedEnemyLanes[index] = null;
                        
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
                        
                        if (enemyCard.attributes?.includes('Curse')) {
                            const curseDamage = enemyCard.power || 1;
                            setPlayerLife(prev => Math.max(0, prev - curseDamage));
                            attackResults.push(`Curse effect: Enemy ${enemyCard.name} deals ${curseDamage} damage from beyond the grave!`);
                        }
                    }
                }
            });

            if (totalDamage > 0) {
                setOpponentLife(prev => Math.max(0, prev - totalDamage));
                attackResults.push(`Total direct damage: ${totalDamage}`);
            }

            setDestroyedCards(newDestroyedCards);
            
            setAttackingCards({ player: [false, false, false], enemy: [false, false, false] });
            
            setTimeout(() => {
                setPlayerLaneCards(updatedPlayerLanes);
                setEnemyLaneCards(updatedEnemyLanes);
                setBattleResults(attackResults);
                
                setDestroyedCards({ player: [false, false, false], enemy: [false, false, false] });
                
                if (attackResults.length > 0) {
                    setShowBattleResults(true);
                } else {
                    handleCloseBattleResults();
                }
            }, 1000);
        }, 1000);
    };

    // Handle opponent attack
    const handleOpponentAttack = () => {
        if (!opponentAttackPhase) return;

        setOpponentHasAttacked(true);

        const activeOpponentCards = enemyLaneCards.map(card => card !== null);
        setAttackingCards({ player: [false, false, false], enemy: activeOpponentCards });
        
        setTimeout(() => {
            const attackResults = [];
            let totalDamage = 0;
            const updatedPlayerLanes = [...playerLaneCards];
            const updatedEnemyLanes = [...enemyLaneCards];
            
            const newDestroyedCards = { 
                player: [false, false, false], 
                enemy: [false, false, false] 
            };

            const newGuardBlocks = [...guardAdjacentBlocks];

            const guardCards = playerLaneCards.map((card, index) => {
                if (card && card.attributes?.includes('Guard') && newGuardBlocks[index] < 2) {
                    return { index, card };
                }
                return null;
            }).filter(Boolean);

            if (guardCards.length > 0) {
                setShowGuardBlockModal(true);
                return;
            }

            enemyLaneCards.forEach((enemyCard, index) => {
                if (enemyCard === null) return;

                const playerCard = playerLaneCards[index];
                if (playerCard === null) {
                    // Direct damage to player
                    totalDamage += enemyCard.power;
                    attackResults.push(`${enemyCard.name} deals ${enemyCard.power} direct damage!`);
                } else {
                    const opponentPower = enemyCard.power;
                    const playerPower = playerCard.power;
                    const battleResult = `${enemyCard.name} (${opponentPower}) vs ${playerCard.name} (${playerPower})`;

                    if (opponentPower > playerPower) {
                        attackResults.push(`${battleResult} - Your card destroyed!`);
                        newDestroyedCards.player[index] = true;
                        updatedPlayerLanes[index] = null;
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
                        
                        if (playerCard.attributes?.includes('Curse')) {
                            const curseDamage = playerCard.power || 1;
                            totalDamage += curseDamage;
                            attackResults.push(`Curse effect: Your ${playerCard.name} deals ${curseDamage} damage from beyond the grave!`);
                        }
                    }
                }
            });

            let playerDefeated = false;
            if (totalDamage > 0) {
                const newPlayerLife = Math.max(0, playerLife - totalDamage);
                setPlayerLife(newPlayerLife);
                attackResults.push(`Total direct damage: ${totalDamage}`);
                
                if (newPlayerLife <= 0) {
                    playerDefeated = true;
                    attackResults.push(`You have been defeated!`);
                }
            }

            setDestroyedCards(newDestroyedCards);
            setAttackingCards({ player: [false, false, false], enemy: [false, false, false] });
            
            setTimeout(() => {
                setPlayerLaneCards(updatedPlayerLanes);
                setEnemyLaneCards(updatedEnemyLanes);
                setBattleResults(attackResults);
                
                setDestroyedCards({ player: [false, false, false], enemy: [false, false, false] });
                
                if (playerDefeated) {
                    setBattleComplete(true);
                    setTimeout(() => {
                        handleDefeat();
                    }, 500);
                    return;
                }
                
                if (attackResults.length > 0) {
                    setShowBattleResults(true);
                } else {
                    handleCloseBattleResults();
                }
            }, 1000);
        }, 1000);
    };

    // Handle guard adjacent blocking
    const handleGuardAdjacentBlock = (guardIndex, targetIndex) => {
        if (guardAdjacentBlocks[guardIndex]) {
            setGameMessage("This Guard has already blocked an adjacent lane this phase!");
            return;
        }

        const newGuardAdjacentBlocks = [...guardAdjacentBlocks];
        newGuardAdjacentBlocks[guardIndex] = true;
        setGuardAdjacentBlocks(newGuardAdjacentBlocks);

        const playerCard = playerLaneCards[targetIndex];
        if (playerCard) {
            const damage = playerCard.power || 1;
            setOpponentLife(prev => Math.max(0, prev - damage));
            setGameMessage(`Guard in lane ${guardIndex + 1} blocked attack from lane ${targetIndex + 1}!`);
        }

        setShowGuardBlockModal(false);
    };

    // Handle battle results
    const handleCloseBattleResults = () => {
        setShowBattleResults(false);
        
        if (playerAttackPhase) {
            setPlayerAttackPhase(false);
            
            if (opponentLife <= 0) {
                setBattleComplete(true);
                handleVictory();
                return;
            }
            
            if (!opponentHasAttacked) {
                const opponentHasCreatures = enemyLaneCards.some(card => card !== null);
                
                if (opponentHasCreatures) {
                    displayGameMessage("Opponent's Attack Phase begins!");
                    setOpponentAttackPhase(true);
                } else {
                    displayGameMessage("Opponent has no creatures left to attack with. Choose a card to retain.");
                    setTimeout(() => {
                        setShowRetainCardModal(true);
                    }, 1000);
                }
            } else {
                displayGameMessage("Battle Phase complete! Choose a card to retain for next round.");
                setTimeout(() => {
                    setShowRetainCardModal(true);
                }, 1000);
            }
        } 
        else if (opponentAttackPhase || justCompletedOpponentAttack) {
            setOpponentAttackPhase(false);
            setJustCompletedOpponentAttack(false);
            
            if (playerLife <= 0) {
                setBattleComplete(true);
                handleDefeat();
                return;
            }
            
            if (!playerHasAttacked) {
                const playerHasCreatures = playerLaneCards.some(card => card !== null);
                
                if (playerHasCreatures) {
                    displayGameMessage("Your Attack Phase begins!");
                    setPlayerAttackPhase(true);
                } else {
                    displayGameMessage("You have no creatures left to attack with. Choose a card to retain.");
                    setTimeout(() => {
                        setShowRetainCardModal(true);
                    }, 1000);
                }
            } else {
                displayGameMessage("Battle Phase complete! Choose a card to retain for next round.");
                setTimeout(() => {
                    setShowRetainCardModal(true);
                }, 1000);
            }
        }
    };

    // Handle card retention
    const handleRetainCard = (card) => {
        setRetainedCard(card);
        setShowRetainCardModal(false);
        setGameMessage(`Retained ${card.name} for next round! You will draw 2 cards instead of 3.`);
        
        setTimeout(() => {
            prepareNextRound();
        }, 1500);
    };

    const handleCloseRetainModal = () => {
        setShowRetainCardModal(false);
        setRetainedCard(null);
        setGameMessage("No card retained. Drawing full hand for next round.");
        
        setTimeout(() => {
            prepareNextRound();
        }, 1500);
    };

    // Prepare next round
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

    // Handle drawing new round hand
    const handleDrawNewRoundHand = () => {
        console.log("Drawing new round hand");
        console.log("Current remaining deck:", remainingDeck);
        
        if (!remainingDeck || remainingDeck.length === 0) {
            console.log("No cards left in deck");
            setGameMessage("You have no cards left in your deck. Game over!");
            setBattleComplete(true);
            return;
        }
        
        const cardsToDraw = retainedCard ? 2 : 3;
        console.log("Cards to draw:", cardsToDraw);
        
        // Use the drawCards function instead of manual drawing
        const newHand = drawCards(cardsToDraw);
        console.log("New hand drawn:", newHand);
        
        if (newHand.length === 0) {
            setGameMessage("You have no cards left in your deck. Game over!");
            setBattleComplete(true);
            return;
        }
        
        const finalHand = retainedCard ? [retainedCard, ...newHand] : newHand;
        setPlayerHand(finalHand);
        
        setRetainedCard(null);
        
        setupOpponentNewRoundHand(3);
        
        setPlayerMana(Math.min(10, 4 + roundCount - 1));
        setOpponentMana(Math.min(10, 4 + roundCount - 1));
        
        setShowNewRoundModal(false);
        setGamePhase('placement');
        
        const playerCardCount = playerLaneCards.filter(card => card !== null).length;
        const enemyCardCount = enemyLaneCards.filter(card => card !== null).length;
        
        const playerFirst = roundCount % 2 === 1 ? coinTossResult === 'heads' : coinTossResult !== 'heads';
        
        setPlayerTurnCount(0);
        setOpponentTurnCount(0);
        
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

    // Set up opponent's new round hand
    const setupOpponentNewRoundHand = async (cardCount = 3) => {
        if (opponentDeck.length === 0) {
            const deck = await generateOpponentDeck();
            if (deck.length === 0) {
                console.error("Failed to generate opponent deck");
                return;
            }
        }
        
        const drawnCards = opponentDeck.slice(0, cardCount);
        setOpponentHand(drawnCards);
        
        setOpponentDeck(prevDeck => prevDeck.slice(cardCount));
    };

    return {
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
    };
} 