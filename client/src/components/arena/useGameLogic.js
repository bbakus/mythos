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
    const [playerLife, setPlayerLife] = useState(100);
    
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
    const [opponentLife, setOpponentLife] = useState(100);
    
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

    // Add new state for game statistics
    const [gameStats, setGameStats] = useState({
        totalDamageTaken: 0,
        cardsPlayed: 0,
        enemyCardsDestroyed: 0,
        highestDamageDealt: 0,
        thiefDamage: 0,
        guardBlocks: 0,
        curseDamage: 0,
        totalRounds: 0,
        mvpCard: null
    });

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
                            inDeck: true,
                            thief: cardData.card.thief || false,
                            guard: cardData.card.guard || false,
                            curse: cardData.card.curse || false
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

    // In the useEffect for game phase, add the initial message
    useEffect(() => {
        if (gamePhase === 'placement' && playerTurnCount === 0) {
            setGameMessage('Drag cards to open lanes');
        }
    }, [gamePhase, playerTurnCount]);

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
        setGameOver(true);
        setGameResult({
            outcome: 'victory',
            stats: {
                finalLife: playerLife,
                enemyFinalLife: opponentLife,
                highestDamageDealt: gameStats.highestDamageDealt || 0,
                totalDamageTaken: gameStats.totalDamageTaken || 0,
                cardsPlayed: gameStats.cardsPlayed || 0,
                enemyCardsDestroyed: gameStats.enemyCardsDestroyed || 0,
                thiefDamage: gameStats.thiefDamage || 0,
                guardBlocks: gameStats.guardBlocks || 0,
                curseDamage: gameStats.curseDamage || 0,
                totalRounds: roundCount,
                gemsEarned: 30,
                mvpCard: gameStats.mvpCard
            }
        });
        setShowGameOverModal(true);
        
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
    };

    const handleDefeat = () => {
        setGameOver(true);
        setGameResult({
            outcome: 'defeat',
            stats: {
                finalLife: playerLife,
                enemyFinalLife: opponentLife,
                highestDamageDealt: gameStats.highestDamageDealt || 0,
                totalDamageTaken: gameStats.totalDamageTaken || 0,
                cardsPlayed: gameStats.cardsPlayed || 0,
                enemyCardsDestroyed: gameStats.enemyCardsDestroyed || 0,
                thiefDamage: gameStats.thiefDamage || 0,
                guardBlocks: gameStats.guardBlocks || 0,
                curseDamage: gameStats.curseDamage || 0,
                totalRounds: roundCount,
                gemsEarned: 0,
                mvpCard: gameStats.mvpCard
            }
        });
        setShowGameOverModal(true);
    };

    const handlePlayAgain = () => {
        // Reset game state
        setGameOver(false);
        setShowGameOverModal(false);
        setShowDeckSelectionModal(true);
        setPlayerLife(20);
        setOpponentLife(20);
        setRoundCount(0);
        setGameStats({
            totalDamageTaken: 0,
            cardsPlayed: 0,
            enemyCardsDestroyed: 0,
            highestDamageDealt: 0,
            thiefDamage: 0,
            guardBlocks: 0,
            curseDamage: 0,
            totalRounds: 0,
            mvpCard: null
        });
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
        try {
            setSelectedDeck(deckId);
            setShowDeckSelectionModal(false);
            
            // Fetch the selected deck's cards
            const response = await fetch(`/users/${userId}/decks/${deckId}/cards`);
            if (!response.ok) {
                throw new Error('Failed to fetch deck');
            }
            
            const data = await response.json();
            if (!data || data.length === 0) {
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
                        inDeck: true,
                        thief: cardData.card.thief || false,
                        guard: cardData.card.guard || false,
                        curse: cardData.card.curse || false
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
            
            // Set game phase to init and show coin toss modal
            setGamePhase('init');
            setTimeout(() => {
                setShowCoinTossModal(true);
            }, 100);
        } catch (error) {
            console.error('Error loading deck:', error);
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
            return;
        }
        
        // Set up opponent's hand and deck
        const opponentHand = opponentDeck.slice(0, 3);
        const remainingOpponentDeck = opponentDeck.slice(3);
        console.log("Opponent's initial hand:", opponentHand);
        
        setOpponentDeck(remainingOpponentDeck);
        setOpponentHand(opponentHand);
        
        // Close draw modal and start placement phase
        setShowDrawHandModal(false);
        setGamePhase('placement');
        
        // Set initial turn state based on coin toss result
        const playerFirst = coinTossResult === 'heads';
        setIsPlayerTurn(playerFirst);
        
        if (!playerFirst) {
            setTimeout(() => {
                handleOpponentPlacement();
            }, 1500);
        }
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
                high: [] // 5+ mana
            };
            
            // Sort cards by mana cost
            allCards.forEach(card => {
                // Each card already has cost, power, image, etc.
                if (card.cost <= 2) cardTypes.low.push(card);
                else if (card.cost <= 4) cardTypes.medium.push(card);
                else cardTypes.high.push(card);
            });
            
            console.log("Card types:", cardTypes);
            
            // Add cards to deck with balanced distribution
            // 8 low cost cards
            for (let i = 0; i < 8; i++) {
                if (cardTypes.low.length === 0) break;
                const randomIndex = Math.floor(Math.random() * cardTypes.low.length);
                const baseCard = cardTypes.low[randomIndex];
                deck.push({
                    ...baseCard,
                    id: `opponent-low-${i}`,
                    // Keep the original image path
                    image: baseCard.image
                });
            }
            
            // 7 medium cost cards
            for (let i = 0; i < 7; i++) {
                if (cardTypes.medium.length === 0) break;
                const randomIndex = Math.floor(Math.random() * cardTypes.medium.length);
                const baseCard = cardTypes.medium[randomIndex];
                deck.push({
                    ...baseCard,
                    id: `opponent-medium-${i}`,
                    // Keep the original image path
                    image: baseCard.image
                });
            }
            
            // 5 high cost cards
            for (let i = 0; i < 5; i++) {
                if (cardTypes.high.length === 0) break;
                const randomIndex = Math.floor(Math.random() * cardTypes.high.length);
                const baseCard = cardTypes.high[randomIndex];
                deck.push({
                    ...baseCard,
                    id: `opponent-high-${i}`,
                    // Keep the original image path
                    image: baseCard.image
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
        setTimeout(() => {
            const tossResult = Math.random() < 0.5 ? 'heads' : 'tails';
            setCoinTossResult(tossResult);
            
            const playerFirst = tossResult === 'heads';
            setIsPlayerTurn(playerFirst);
            
            setTimeout(() => {
                setShowCoinTossModal(false);
                
                if (gamePhase === 'init') {
                    setShowDrawHandModal(true);
                } else {
                    setShowNewRoundModal(true);
                    setGamePhase('draw');
                }
            }, 2000);
        }, 1500);
    };

    // Handle opponent's card placement
    const handleOpponentPlacement = () => {
        if (battleInitiated || gamePhase === 'battle') {
            return;
        }
        
        if (opponentTurnCount >= 3) {
            setTimeout(() => {
                initiateBattlePhase();
            }, 1000);
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
                    
                    const faceDownCard = {
                        ...cardToPlace,
                        originalImage: cardToPlace.image,
                        image: "/assets/images/card_backs/CARDBACK.png",
                        revealed: false
                    };
                    
                    const newLaneCards = [...enemyLaneCards];
                    newLaneCards[laneIndex] = faceDownCard;
                    setEnemyLaneCards(newLaneCards);
                    
                    const newHand = opponentHand.filter(card => card.id !== cardToPlace.id);
                    setOpponentHand(newHand);
                    
                    setOpponentMana(prevMana => prevMana - cardToPlace.cost);
                }
            }
        }

        const newOpponentTurnCount = opponentTurnCount + 1;
        setOpponentTurnCount(newOpponentTurnCount);
        
        if (playerTurnCount >= 3 && newOpponentTurnCount >= 3) {
            setTimeout(() => {
                initiateBattlePhase();
            }, 1000);
            return;
        }
        
        setIsPlayerTurn(true);
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
                setTimeout(() => {
                    initiateBattlePhase();
                }, 1000);
            } else {
                setIsPlayerTurn(false);
                setTimeout(() => {
                    handleOpponentPlacement();
                }, 1000);
            }
            return;
        }
        
        const newPlayerTurnCount = playerTurnCount + 1;
        setPlayerTurnCount(newPlayerTurnCount);
        
        if (newPlayerTurnCount >= 3 && opponentTurnCount >= 3) {
            setTimeout(() => {
                initiateBattlePhase();
            }, 1000);
            return;
        }
        
        setIsPlayerTurn(false);
        setTimeout(() => {
            handleOpponentPlacement();
        }, 1000);
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
            return;
        }
        
        if (battleInitiated || gamePhase === 'battle') {
            return;
        }
        
        if (playerTurnCount >= 3) {
            return;
        }
        
        if (playerLaneCards[laneIndex] !== null) {
            return;
        }
        
        if (!draggedCard) {
            return;
        }
        
        if (draggedCard.cost > playerMana) {
            return;
        }
        
        const newLaneCards = [...playerLaneCards];
        newLaneCards[laneIndex] = draggedCard;
        setPlayerLaneCards(newLaneCards);
        
        const newHand = playerHand.filter(card => card.id !== draggedCard.id);
        setPlayerHand(newHand);
        
        setPlayerMana(prevMana => prevMana - draggedCard.cost);
        
        setDraggedCard(null);
        
        setGameStats(prev => ({
            ...prev,
            cardsPlayed: prev.cardsPlayed + 1,
            currentRoundTurns: prev.currentRoundTurns + 1
        }));
        
        const newPlayerTurnCount = playerTurnCount + 1;
        setPlayerTurnCount(newPlayerTurnCount);
        
        if (newPlayerTurnCount >= 3 && opponentTurnCount >= 3) {
            setTimeout(() => {
                initiateBattlePhase();
            }, 1000);
            return;
        }
        
        setIsPlayerTurn(false);
        setTimeout(() => {
            handleOpponentPlacement();
        }, 1000);
    };

    // Handle retracting a card
    const handleRetractCard = (laneIndex) => {
        if (!isPlayerTurn || gamePhase !== 'placement') {
            return;
        }
        
        const cardToRetract = playerLaneCards[laneIndex];
        
        if (!cardToRetract) return;
        
        setPlayerHand(prevHand => [...prevHand, cardToRetract]);
        
        setPlayerMana(prevMana => prevMana + cardToRetract.cost);
        
        const newLaneCards = [...playerLaneCards];
        newLaneCards[laneIndex] = null;
        setPlayerLaneCards(newLaneCards);
    };

    // Handle battle phase
    const initiateBattlePhase = () => {
        setPlayerHasAttacked(false);
        setOpponentHasAttacked(false);
        
        setGamePhase('battle');
        setBattleInitiated(true);
        
        const playerFirst = coinTossResult === 'heads';
        
        const revealedEnemyCards = enemyLaneCards.map(card => {
            if (!card) return null;
            
            if (card.revealed) return card;
            
            return {
                ...card,
                image: card.originalImage,
                revealed: true
            };
        });
        
        setEnemyLaneCards(revealedEnemyCards);
        
        setTimeout(() => {
            if (playerFirst) {
                setPlayerAttackPhase(true);
            } else {
                setOpponentAttackPhase(true);
            }
        }, 1500);
    };

    // Handle player attack
    const handlePlayerAttack = () => {
        setPlayerHasAttacked(true);
        const attackResults = [];  // Initialize attackResults array

        // Guard cards can only attack empty lanes
        const activePlayerCards = playerLaneCards.map((card, index) => {
            if (!card) return false;
            if (card.guard) {
                // Guard can only attack if opposing lane is empty
                return enemyLaneCards[index] === null;
            }
            return true;
        });
        setAttackingCards({ player: activePlayerCards, enemy: [false, false, false] });
        
        setTimeout(() => {
            let roundDamage = 0;
            let roundThiefDamage = 0;
            let roundGuardBlocks = 0;
            let roundCurseDamage = 0;
            let cardsDestroyedThisRound = 0;

            const updatedPlayerLanes = [...playerLaneCards];
            const updatedEnemyLanes = [...enemyLaneCards];
            
            const newDestroyedCards = { 
                player: [false, false, false], 
                enemy: [false, false, false] 
            };

            const newGuardBlocks = [...guardAdjacentBlocks];

            playerLaneCards.forEach((playerCard, index) => {
                if (playerCard === null) return;
                // Guard cards can only attack empty lanes
                if (playerCard.guard && enemyLaneCards[index] !== null) return;

                const enemyCard = enemyLaneCards[index];
                let damage = playerCard.power || 1;

                // Handle Thief attribute
                if (playerCard.thief) {
                    // Check for Guard in adjacent lanes AND in the current lane
                    const leftGuard = index > 0 && enemyLaneCards[index - 1]?.guard && newGuardBlocks[index - 1] < 3;
                    const rightGuard = index < 2 && enemyLaneCards[index + 1]?.guard && newGuardBlocks[index + 1] < 3;
                    const currentLaneGuard = enemyCard?.guard && newGuardBlocks[index] < 3;
                    
                    // A thief is blocked if there's a guard in their lane or adjacent lanes
                    if (!currentLaneGuard && !leftGuard && !rightGuard) {
                        roundThiefDamage += damage;
                        roundGuardBlocks++;
                        attackResults.push(`Lane ${index + 1}: Your Thief ${playerCard.name} bypasses defense and deals ${damage} direct damage!`);
                        return;
                    } else {
                        // Determine which guard blocks (prioritize current lane, then left, then right)
                        let blockingGuardIndex;
                        let blockingGuard;
                        let blockMessage;

                        if (currentLaneGuard) {
                            blockingGuardIndex = index;
                            blockingGuard = enemyCard;
                            blockMessage = `Lane ${index + 1}: Enemy Guard ${enemyCard.name} blocks your Thief!`;
                        } else if (leftGuard) {
                            blockingGuardIndex = index - 1;
                            blockingGuard = enemyLaneCards[index - 1];
                            blockMessage = `Lane ${index + 1}: Enemy Guard from lane ${index} blocks your Thief!`;
                        } else {
                            blockingGuardIndex = index + 1;
                            blockingGuard = enemyLaneCards[index + 1];
                            blockMessage = `Lane ${index + 1}: Enemy Guard from lane ${index + 2} blocks your Thief!`;
                        }

                        newGuardBlocks[blockingGuardIndex]++;
                        
                        // Check if thief should be destroyed
                        const thiefPower = playerCard.power || 1;
                        const guardPower = blockingGuard.power || 1;
                        
                        if (thiefPower <= guardPower) {
                            attackResults.push(`${blockMessage} Your Thief is destroyed by the guard's superior defense! (Block ${newGuardBlocks[blockingGuardIndex]}/3)`);
                            newDestroyedCards.player[index] = true;
                            updatedPlayerLanes[index] = null;
                            
                            // Handle Curse effect if thief is destroyed
                            if (playerCard.curse) {
                                const curseDamage = playerCard.power || 1;
                                roundCurseDamage += curseDamage;
                                setOpponentLife(prev => Math.max(0, prev - curseDamage));
                                attackResults.push(`⚡ CURSE EFFECT: Your ${playerCard.name} deals ${curseDamage} direct damage to the opponent!`);
                            }
                        } else {
                            attackResults.push(`${blockMessage} (Block ${newGuardBlocks[blockingGuardIndex]}/3)`);
                        }

                        if (newGuardBlocks[blockingGuardIndex] >= 3) {
                            attackResults.push(`Enemy Guard has retired after 3 blocks!`);
                            updatedEnemyLanes[blockingGuardIndex] = null;
                        }
                        return;
                    }
                }

                if (enemyCard === null) {
                    roundDamage += damage;
                    attackResults.push(`Lane ${index + 1}: Your ${playerCard.name} deals ${damage} direct damage!`);
                } else {
                    const playerPower = playerCard.power || 1;
                    const enemyPower = enemyCard.power || 1;
                    const battleResult = `Lane ${index + 1}: Your ${playerCard.name} (Power: ${playerPower}) vs Enemy ${enemyCard.name} (Power: ${enemyPower})`;
                    
                    if (playerPower > enemyPower) {
                        attackResults.push(`${battleResult} - Enemy card destroyed!`);
                        newDestroyedCards.enemy[index] = true;
                        updatedEnemyLanes[index] = null;
                        
                        if (enemyCard.curse) {
                            const curseDamage = enemyCard.power || 1;
                            roundCurseDamage += curseDamage;
                            setPlayerLife(prev => Math.max(0, prev - curseDamage));
                            attackResults.push(`⚡ CURSE EFFECT: Enemy ${enemyCard.name} deals ${curseDamage} direct damage to you!`);
                        }
                    } else if (playerPower < enemyPower) {
                        attackResults.push(`${battleResult} - Your card destroyed!`);
                        newDestroyedCards.player[index] = true;
                        updatedPlayerLanes[index] = null;
                        
                        if (playerCard.curse) {
                            const curseDamage = playerCard.power || 1;
                            roundCurseDamage += curseDamage;
                            setOpponentLife(prev => Math.max(0, prev - curseDamage));
                            attackResults.push(`⚡ CURSE EFFECT: Your ${playerCard.name} deals ${curseDamage} direct damage to the opponent!`);
                        }
                    } else {
                        attackResults.push(`${battleResult} - Both cards destroyed in equal combat!`);
                        newDestroyedCards.player[index] = true;
                        newDestroyedCards.enemy[index] = true;
                        updatedPlayerLanes[index] = null;
                        updatedEnemyLanes[index] = null;
                        
                        if (enemyCard.curse) {
                            const curseDamage = enemyCard.power || 1;
                            roundCurseDamage += curseDamage;
                            setPlayerLife(prev => Math.max(0, prev - curseDamage));
                            attackResults.push(`⚡ CURSE EFFECT: Enemy ${enemyCard.name} deals ${curseDamage} direct damage to you!`);
                        }
                        if (playerCard.curse) {
                            const curseDamage = playerCard.power || 1;
                            roundCurseDamage += curseDamage;
                            setOpponentLife(prev => Math.max(0, prev - curseDamage));
                            attackResults.push(`⚡ CURSE EFFECT: Your ${playerCard.name} deals ${curseDamage} direct damage to the opponent!`);
                        }
                    }
                }
            });

            if (roundDamage > 0) {
                setOpponentLife(prev => Math.max(0, prev - roundDamage));
                attackResults.push(`Total direct damage: ${roundDamage}`);
            }

            setDestroyedCards(newDestroyedCards);
            setGuardAdjacentBlocks(newGuardBlocks);
            
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

                // Update stats after the round
                setGameStats(prev => {
                    const newStats = {
                        ...prev,
                        highestDamageDealt: Math.max(prev.highestDamageDealt, roundDamage),
                        enemyCardsDestroyed: prev.enemyCardsDestroyed + cardsDestroyedThisRound,
                        thiefDamage: prev.thiefDamage + roundThiefDamage,
                        guardBlocks: prev.guardBlocks + roundGuardBlocks,
                        curseDamage: prev.curseDamage + roundCurseDamage
                    };

                    // Update MVP for damage dealt
                    if (roundDamage > 0 && (!prev.mvpCard || roundDamage > prev.mvpCard.value)) {
                        // Find the card that dealt the most damage
                        let mvpCard = null;
                        let maxDamage = 0;
                        playerLaneCards.forEach(card => {
                            if (card && card.power > maxDamage) {
                                maxDamage = card.power;
                                mvpCard = card;
                            }
                        });

                        if (mvpCard) {
                            newStats.mvpCard = {
                                name: mvpCard.name,
                                value: roundDamage,
                                type: 'damage'
                            };
                        }
                    }

                    return newStats;
                });
            }, 1000);
        }, 1000);
    };

    // Handle opponent attack
    const handleOpponentAttack = () => {
        if (!opponentAttackPhase) return;

        setOpponentHasAttacked(true);
        const attackResults = [];
        let roundGuardBlocks = 0;

        // Guard cards can only attack empty lanes
        const activeOpponentCards = enemyLaneCards.map((card, index) => {
            if (!card) return false;
            return true;  // Allow all cards to attack, including guards
        });
        setAttackingCards({ player: [false, false, false], enemy: activeOpponentCards });
        
        setTimeout(() => {
            let damageTaken = 0;
            let cardsLostThisRound = 0;

            const updatedPlayerLanes = [...playerLaneCards];
            const updatedEnemyLanes = [...enemyLaneCards];
            
            const newDestroyedCards = { 
                player: [false, false, false], 
                enemy: [false, false, false] 
            };

            const newGuardBlocks = [...guardAdjacentBlocks];

            enemyLaneCards.forEach((enemyCard, index) => {
                if (enemyCard === null) return;

                const playerCard = playerLaneCards[index];
                let damage = enemyCard.power || 1;

                if (playerCard === null) {
                    // Direct attack if no defending card
                    damageTaken += damage;
                    attackResults.push(`Lane ${index + 1}: ${enemyCard.name} deals ${damage} direct damage!`);
                } else {
                    // Check for guard blocks first
                    const leftGuard = index > 0 && playerLaneCards[index - 1]?.guard && newGuardBlocks[index - 1] < 3;
                    const rightGuard = index < 2 && playerLaneCards[index + 1]?.guard && newGuardBlocks[index + 1] < 3;
                    const currentGuard = playerCard.guard && newGuardBlocks[index] < 3;
                    const hasGuardBlock = currentGuard || leftGuard || rightGuard;

                    if (hasGuardBlock) {
                        // Determine which guard blocks
                        let blockingGuardIndex = currentGuard ? index : (leftGuard ? index - 1 : index + 1);
                        let blockingGuard = currentGuard ? playerCard : (leftGuard ? playerLaneCards[index - 1] : playerLaneCards[index + 1]);
                        
                        newGuardBlocks[blockingGuardIndex]++;
                        roundGuardBlocks++;
                        
                        const blockMessage = currentGuard 
                            ? `Lane ${index + 1}: Your Guard ${playerCard.name} blocks the attack!`
                            : `Lane ${index + 1}: Your Guard from lane ${blockingGuardIndex + 1} blocks the attack!`;
                        
                        // Check if attacking card should be destroyed
                        const attackerPower = enemyCard.power || 1;
                        const guardPower = blockingGuard.power || 1;
                        
                        if (attackerPower <= guardPower) {
                            attackResults.push(`${blockMessage} Enemy ${enemyCard.name} is destroyed by the guard's superior defense!`);
                            newDestroyedCards.enemy[index] = true;
                            updatedEnemyLanes[index] = null;
                            
                            // Handle Curse effect if attacker is destroyed
                            if (enemyCard.curse) {
                                const curseDamage = enemyCard.power || 1;
                                damageTaken += curseDamage;
                                setPlayerLife(prev => Math.max(0, prev - curseDamage));
                                attackResults.push(`⚡ CURSE EFFECT: Enemy ${enemyCard.name} deals ${curseDamage} direct damage to you!`);
                            }
                        } else {
                            attackResults.push(`${blockMessage} (Block ${newGuardBlocks[blockingGuardIndex]}/3)`);
                        }
                        
                        if (newGuardBlocks[blockingGuardIndex] >= 3) {
                            attackResults.push(`Your Guard has retired after 3 blocks!`);
                            updatedPlayerLanes[blockingGuardIndex] = null;
                        }
                    } else {
                        // Regular combat if no guard blocks
                        const opponentPower = enemyCard.power || 1;
                        const playerPower = playerCard.power || 1;
                        const battleResult = `Lane ${index + 1}: ${enemyCard.name} (${opponentPower}) vs ${playerCard.name} (${playerPower})`;

                        if (opponentPower > playerPower) {
                            attackResults.push(`${battleResult} - Your card destroyed!`);
                            newDestroyedCards.player[index] = true;
                            updatedPlayerLanes[index] = null;
                            
                            if (playerCard.curse) {
                                const curseDamage = playerCard.power || 1;
                                setOpponentLife(prev => Math.max(0, prev - curseDamage));
                                attackResults.push(`⚡ CURSE EFFECT: Your ${playerCard.name} deals ${curseDamage} direct damage to the opponent!`);
                            }
                        } else if (opponentPower < playerPower) {
                            attackResults.push(`${battleResult} - Enemy card destroyed!`);
                            newDestroyedCards.enemy[index] = true;
                            updatedEnemyLanes[index] = null;
                            
                            if (enemyCard.curse) {
                                const curseDamage = enemyCard.power || 1;
                                damageTaken += curseDamage;
                                setPlayerLife(prev => Math.max(0, prev - curseDamage));
                                attackResults.push(`⚡ CURSE EFFECT: Enemy ${enemyCard.name} deals ${curseDamage} direct damage to you!`);
                            }
                        } else {
                            attackResults.push(`${battleResult} - Both cards destroyed in equal combat!`);
                            newDestroyedCards.player[index] = true;
                            newDestroyedCards.enemy[index] = true;
                            updatedPlayerLanes[index] = null;
                            updatedEnemyLanes[index] = null;
                            
                            if (playerCard.curse) {
                                const curseDamage = playerCard.power || 1;
                                setOpponentLife(prev => Math.max(0, prev - curseDamage));
                                attackResults.push(`⚡ CURSE EFFECT: Your ${playerCard.name} deals ${curseDamage} direct damage to the opponent!`);
                            }
                            if (enemyCard.curse) {
                                const curseDamage = enemyCard.power || 1;
                                damageTaken += curseDamage;
                                setPlayerLife(prev => Math.max(0, prev - curseDamage));
                                attackResults.push(`⚡ CURSE EFFECT: Enemy ${enemyCard.name} deals ${curseDamage} direct damage to you!`);
                            }
                        }
                    }
                }
            });

            let playerDefeated = false;
            if (damageTaken > 0) {
                const newPlayerLife = Math.max(0, playerLife - damageTaken);
                setPlayerLife(newPlayerLife);
                attackResults.push(`Total direct damage: ${damageTaken}`);
                
                if (newPlayerLife <= 0) {
                    playerDefeated = true;
                    attackResults.push(`You have been defeated!`);
                }
            }

            setDestroyedCards(newDestroyedCards);
            setGuardAdjacentBlocks(newGuardBlocks);
            
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

                // Update stats after the round
                setGameStats(prev => {
                    const newStats = {
                        ...prev,
                        totalDamageTaken: prev.totalDamageTaken + damageTaken,
                        cardsDestroyed: prev.cardsDestroyed + cardsLostThisRound,
                        guardBlocks: prev.guardBlocks + roundGuardBlocks
                    };

                    // Update MVP for damage blocked
                    if (roundGuardBlocks > 0 && (!prev.mvpCard || roundGuardBlocks > prev.mvpCard.value)) {
                        // Find the guard card that blocked the most damage
                        let mvpGuard = null;
                        let maxBlocks = 0;
                        playerLaneCards.forEach(card => {
                            if (card && card.guard && newGuardBlocks[playerLaneCards.indexOf(card)] > maxBlocks) {
                                maxBlocks = newGuardBlocks[playerLaneCards.indexOf(card)];
                                mvpGuard = card;
                            }
                        });

                        if (mvpGuard) {
                            newStats.mvpCard = {
                                name: mvpGuard.name,
                                value: roundGuardBlocks,
                                type: 'block'
                            };
                        }
                    }

                    return newStats;
                });
            }, 1000);
        }, 1000);
    };

    // Handle guard adjacent blocking
    const handleGuardAdjacentBlock = (guardIndex, targetIndex) => {
        if (guardAdjacentBlocks[guardIndex]) {
            return;
        }

        const newGuardAdjacentBlocks = [...guardAdjacentBlocks];
        newGuardAdjacentBlocks[guardIndex] = true;
        setGuardAdjacentBlocks(newGuardAdjacentBlocks);

        const playerCard = playerLaneCards[targetIndex];
        if (playerCard) {
            const damage = playerCard.power || 1;
            setOpponentLife(prev => Math.max(0, prev - damage));
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
                    setOpponentAttackPhase(true);
                } else {
                    setTimeout(() => {
                        setShowRetainCardModal(true);
                    }, 1000);
                }
            } else {
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
                    setPlayerAttackPhase(true);
                } else {
                    setTimeout(() => {
                        setShowRetainCardModal(true);
                    }, 1000);
                }
            } else {
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
        
        setTimeout(() => {
            prepareNextRound();
        }, 1500);
    };

    const handleCloseRetainModal = () => {
        setShowRetainCardModal(false);
        setRetainedCard(null);
        
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
        
        setCoinTossResult(null);
        
        setShowCoinTossModal(true);
    };

    // Handle drawing new round hand
    const handleDrawNewRoundHand = () => {
        if (!remainingDeck || remainingDeck.length === 0) {
            setBattleComplete(true);
            return;
        }
        
        const cardsToDraw = retainedCard ? 2 : 3;
        
        const newHand = drawCards(cardsToDraw);
        
        if (newHand.length === 0) {
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
        
        const playerFirst = coinTossResult === 'heads';
        
        setPlayerTurnCount(0);
        setOpponentTurnCount(0);
        
        setIsPlayerTurn(playerFirst);
        
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