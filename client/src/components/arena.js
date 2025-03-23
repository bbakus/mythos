import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Arena.css';
// Try a different image we know exists
// import gameBoard from '../../public/assets/images/misc/game-board-6.webp';

// DraggableCard component
const DraggableCard = ({ card, index, isDisabled, onDragStart, onDragEnd, onRetain }) => {
    const [collected, dragRef] = useDrag({
        type: 'CARD',
        item: () => {
            onDragStart(card, index);
            return { card, index };
        },
        end: () => {
            onDragEnd();
        },
        canDrag: !isDisabled,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const isDragging = collected.isDragging;

    return (
        <div 
            ref={dragRef}
            className={`hand-card ${isDragging ? 'dragging' : ''} ${isDisabled ? 'disabled' : ''}`}
        >
            <img src={card.image || '/assets/images/card_backs/CARDBACK.png'} alt={card.name} />
            <div className="card-details">
                <div className="card-name">{card.name}</div>
                <div className="card-power">Power: {card.power}</div>
                <div className="card-cost">Cost: {card.cost}</div>
            </div>
            <button 
                className="retain-button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRetain(card, index);
                }}
                disabled={isDisabled}
            >
                Retain
            </button>
        </div>
    );
};

// DroppableLane component
const DroppableLane = ({ index, card, isPlayerLane, onDrop, style }) => {
    const [collected, dropRef] = useDrop({
        accept: 'CARD',
        drop: (item) => onDrop(item, index),
        canDrop: () => !card && isPlayerLane,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const isOver = collected.isOver;
    const canDrop = collected.canDrop;

    const laneClass = `lane ${isPlayerLane ? 'player-lane' : 'enemy-lane'} 
                      ${card ? 'occupied' : 'empty'}
                      ${isOver && canDrop ? 'droppable' : ''}
                      ${isOver && !canDrop ? 'invalid-drop' : ''}`;

    return (
        <div 
            ref={dropRef}
            className={laneClass}
            style={style}
        >
            {card && (
                <div className={`card ${isPlayerLane ? 'player-card' : 'enemy-card'}`}>
                    <img 
                        src={card.faceDown ? '/assets/images/card_backs/CARDBACK.png' : card.image} 
                        alt={card.name} 
                    />
                    {!card.faceDown && (
                        <div className="card-details">
                            <div className="card-name">{card.name}</div>
                            <div className="card-power">Power: {card.power}</div>
                            <div className="card-cost">Cost: {card.cost}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function Arena() {
    // =============================================
    // CARD POSITION CONFIGURATION
    // =============================================
    // Modify these values to position the card slots
    // Values are percentages from the top-left corner
    const positionConfig = {
        // Enemy lane positions (left to right)
        enemyLanes: [
            { left: '24.5%', top: '20%' },  // Left enemy lane
            { left: '46%', top: '15%' },  // Middle enemy lane
            { left: '67.5%', top: '20%' }   // Right enemy lane
        ],
        // Player lane positions (left to right)
        playerLanes: [
            { left: '24.5%', top: '80%' },  // Left player lane
            { left: '46%', top: '85%' },  // Middle player lane
            { left: '67.5%', top: '80%' }   // Right player lane
        ]
    };
    // =============================================

    const { userId } = useParams();
    const location = useLocation();
    const [userData, setUserData] = useState({...location.state?.user});
    
    // Game state
    const [playerDeck, setPlayerDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [playerLanes, setPlayerLanes] = useState([null, null, null]);
    const [enemyLanes, setEnemyLanes] = useState([null, null, null]);
    const [playerLife, setPlayerLife] = useState(40);
    const [enemyLife, setEnemyLife] = useState(40);
    const [playerMana, setPlayerMana] = useState(4);
    const [turnPhase, setTurnPhase] = useState('intro'); // intro, draw, place, battle, end
    const [turnNumber, setTurnNumber] = useState(1);
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedLane, setSelectedLane] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gameMessage, setGameMessage] = useState('Welcome to Mythos Arena!');
    const [retainedCard, setRetainedCard] = useState(null);
    
    // Modal states
    const [showHandModal, setShowHandModal] = useState(false);
    const [draggedCard, setDraggedCard] = useState(null);
    const [showIntroModal, setShowIntroModal] = useState(true);
    const [showDeckSelectionModal, setShowDeckSelectionModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [availableDecks, setAvailableDecks] = useState([]);
    const [selectedDeckId, setSelectedDeckId] = useState(null);
    
    // Fetch user's decks for selection
    useEffect(() => {
        if (userId && showDeckSelectionModal) {
            fetch(`/users/${userId}/decks`)
                .then(res => res.json())
                .then(data => {
                    if (data && Array.isArray(data)) {
                        console.log('Fetched decks:', data); // Debug log
                        
                        // If no decks are returned, create a mock deck for testing
                        if (data.length === 0) {
                            console.log('No decks found, creating mock decks for testing');
                            
                            // Create mock decks
                            const mockDecks = [
                                { 
                                    id: 1, 
                                    name: "Warrior Deck", 
                                    image: '/assets/images/card_backs/CARDBACK.png',
                                    cards: [
                                        { id: 1, name: "Warrior", power: 3, cost: 2, image: "/assets/images/cards/warrior.png" },
                                        { id: 2, name: "Knight", power: 4, cost: 3, image: "/assets/images/cards/knight.png" }
                                    ]
                                },
                                { 
                                    id: 2, 
                                    name: "Mage Deck", 
                                    image: '/assets/images/card_backs/CARDBACK.png',
                                    cards: [
                                        { id: 3, name: "Mage", power: 2, cost: 1, image: "/assets/images/cards/mage.png" },
                                        { id: 4, name: "Wizard", power: 5, cost: 4, image: "/assets/images/cards/wizard.png" }
                                    ]
                                },
                                { 
                                    id: 3, 
                                    name: "Dragon Deck", 
                                    image: '/assets/images/card_backs/CARDBACK.png',
                                    cards: [
                                        { id: 5, name: "Dragon", power: 6, cost: 5, image: "/assets/images/cards/dragon.png" },
                                        { id: 6, name: "Wyvern", power: 4, cost: 3, image: "/assets/images/cards/wyvern.png" }
                                    ]
                                }
                            ];
                            
                            setAvailableDecks(mockDecks);
                        } else {
                            setAvailableDecks(data);
                        }
                    } else {
                        console.error('Invalid deck data format:', data);
                        setGameMessage('Error loading your decks. Please try again.');
                    }
                })
                .catch(err => {
                    console.error('Error loading decks:', err);
                    setGameMessage('Error loading your decks. Please try again.');
                    
                    // If error occurs, create mock decks for testing
                    console.log('Error occurred, creating mock decks for testing');
                    const mockDecks = [
                        { 
                            id: 1, 
                            name: "Warrior Deck", 
                            image: '/assets/images/card_backs/CARDBACK.png',
                            cards: [
                                { id: 1, name: "Warrior", power: 3, cost: 2, image: "/assets/images/cards/warrior.png" },
                                { id: 2, name: "Knight", power: 4, cost: 3, image: "/assets/images/cards/knight.png" }
                            ]
                        },
                        { 
                            id: 2, 
                            name: "Mage Deck", 
                            image: '/assets/images/card_backs/CARDBACK.png',
                            cards: [
                                { id: 3, name: "Mage", power: 2, cost: 1, image: "/assets/images/cards/mage.png" },
                                { id: 4, name: "Wizard", power: 5, cost: 4, image: "/assets/images/cards/wizard.png" }
                            ]
                        }
                    ];
                    
                    setAvailableDecks(mockDecks);
                });
        }
    }, [userId, showDeckSelectionModal]);
    
    // Show hand modal when entering place phase
    useEffect(() => {
        if (turnPhase === 'place' && playerHand.length > 0) {
            setShowHandModal(true);
        } else {
            setShowHandModal(false);
        }
    }, [turnPhase, playerHand]);
    
    // Shuffle array (Fisher-Yates algorithm)
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
    
    // Handle deck selection
    const handleDeckSelect = (deckId) => {
        console.log(`Selected deck ID: ${deckId}`); // Debug log
        setSelectedDeckId(deckId);
        setShowDeckSelectionModal(false);
        setGameMessage('Loading your deck...');
        
        // Find the deck in availableDecks first (this will work with mock decks too)
        const selectedDeck = availableDecks.find(deck => deck.id === deckId);
        console.log('Selected deck from available decks:', selectedDeck); // Debug log
        
        if (selectedDeck && selectedDeck.cards && Array.isArray(selectedDeck.cards) && selectedDeck.cards.length > 0) {
            // If we already have the cards in the selected deck, use them directly
            console.log(`Using ${selectedDeck.cards.length} cards from selected deck:`, selectedDeck.cards);
            const shuffledDeck = shuffleArray([...selectedDeck.cards]);
            setPlayerDeck(shuffledDeck);
            setIsLoading(false);
            setGameMessage(`Game ready! Using your ${selectedDeck.name} deck with ${shuffledDeck.length} cards.`);
            
            // Use setTimeout to ensure state is updated before drawing cards
            setTimeout(() => {
                handleDrawPhase();
            }, 100);
            
            return;
        }
        
        // If we don't have cards in the selected deck, try to fetch them
        fetch(`/users/${userId}/decks/${deckId}`)
            .then(res => res.json())
            .then(data => {
                console.log('Selected deck data from API:', data); // Debug log
                
                if (data) {
                    // Check if cards are already included in response
                    if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
                        console.log(`Loaded ${data.cards.length} cards from API deck data`);
                        const shuffledDeck = shuffleArray([...data.cards]);
                        setPlayerDeck(shuffledDeck);
                        setIsLoading(false);
                        setGameMessage(`Game ready! Using your ${data.name} deck with ${shuffledDeck.length} cards.`);
                        
                        // Use setTimeout to ensure state is updated before drawing cards
                        setTimeout(() => {
                            handleDrawPhase();
                        }, 100);
                    } else {
                        // If cards aren't included, fetch them separately
                        console.log('No cards in API response, trying to fetch cards separately');
                        fetch(`/users/${userId}/decks/${deckId}/cards`)
                            .then(res => res.json())
                            .then(cardsData => {
                                console.log('Fetched cards from separate API call:', cardsData); // Debug log
                                if (cardsData && Array.isArray(cardsData) && cardsData.length > 0) {
                                    const shuffledDeck = shuffleArray([...cardsData]);
                                    setPlayerDeck(shuffledDeck);
                                    setIsLoading(false);
                                    setGameMessage(`Game ready! Your deck has ${shuffledDeck.length} cards.`);
                                    
                                    // Use setTimeout to ensure state is updated before drawing cards
                                    setTimeout(() => {
                                        handleDrawPhase();
                                    }, 100);
                                } else {
                                    console.error('No cards returned from separate API call');
                                    // Fall back to creating mock cards for this deck
                                    createMockCardsForDeck(deckId);
                                }
                            })
                            .catch(err => {
                                console.error('Error loading deck cards:', err);
                                // Fall back to creating mock cards for this deck
                                createMockCardsForDeck(deckId);
                            });
                    }
                } else {
                    console.error('Invalid deck data received from API');
                    // Fall back to creating mock cards for this deck
                    createMockCardsForDeck(deckId);
                }
            })
            .catch(err => {
                console.error('Error loading deck:', err);
                // Fall back to creating mock cards for this deck
                createMockCardsForDeck(deckId);
            });
    };
    
    // Helper function to create mock cards for a selected deck
    const createMockCardsForDeck = (deckId) => {
        console.log('Creating mock cards for deck ID:', deckId);
        
        // Find the selected deck name from availableDecks
        const selectedDeck = availableDecks.find(deck => deck.id === deckId);
        const deckName = selectedDeck ? selectedDeck.name : 'Selected Deck';
        
        // Create 20 mock cards for the game
        const mockCards = [];
        const cardTypes = [
            { name: "Warrior", power: 3, cost: 2, image: "/assets/images/cards/warrior.png" },
            { name: "Mage", power: 2, cost: 1, image: "/assets/images/cards/mage.png" },
            { name: "Knight", power: 4, cost: 3, image: "/assets/images/cards/knight.png" },
            { name: "Dragon", power: 6, cost: 5, image: "/assets/images/cards/dragon.png" },
            { name: "Goblin", power: 1, cost: 1, image: "/assets/images/cards/goblin.png" }
        ];
        
        // Generate 20 cards by randomly selecting from cardTypes
        for (let i = 0; i < 20; i++) {
            const cardTemplate = cardTypes[Math.floor(Math.random() * cardTypes.length)];
            mockCards.push({
                id: `mock-${i}`,
                name: cardTemplate.name,
                power: cardTemplate.power,
                cost: cardTemplate.cost,
                image: cardTemplate.image
            });
        }
        
        const shuffledDeck = shuffleArray(mockCards);
        setPlayerDeck(shuffledDeck);
        setIsLoading(false);
        setGameMessage(`Game ready! Using mock ${deckName} deck with ${shuffledDeck.length} cards.`);
        
        // Use setTimeout to ensure state is updated before drawing cards
        setTimeout(() => {
            handleDrawPhase();
        }, 100);
    };
    
    // Handle draw phase
    const handleDrawPhase = () => {
        setTurnPhase('draw');
        // Give player 4 new mana (plus any leftover from last turn)
        setPlayerMana(prevMana => prevMana + 4);
        
        if (playerDeck.length === 0) {
            setGameMessage("You're out of cards! Game over.");
            return;
        }
        
        // Draw cards
        const drawCount = retainedCard ? 2 : 3;
        if (playerDeck.length < drawCount) {
            setGameMessage("Warning: Your deck is running low on cards!");
        }
        
        const newCards = playerDeck.slice(0, drawCount);
        const newDeck = playerDeck.slice(drawCount);
        
        // If there was a retained card, add it to the new hand
        let newHand = [...newCards];
        if (retainedCard) {
            newHand.push(retainedCard);
            setRetainedCard(null);
        }
        
        setPlayerHand(newHand);
        setPlayerDeck(newDeck);
        setTurnPhase('place');
        setGameMessage(`Turn ${turnNumber}: Place your cards. You have ${playerMana + 4} mana.`);
    };
    
    // Handle drag start
    const handleDragStart = (card, index) => {
        setDraggedCard({ card, handIndex: index });
    };
    
    // Handle drag end
    const handleDragEnd = () => {
        // Reset drag state if needed
    };
    
    // Handle card drop
    const handleCardDrop = (item, laneIndex) => {
        const { card, handIndex } = item;
        
        // Check if lane is already occupied
        if (playerLanes[laneIndex]) {
            setGameMessage("This lane is already occupied.");
            return;
        }
        
        // Check if player has enough mana
        if (card.cost > playerMana) {
            setGameMessage(`Not enough mana. You need ${card.cost} but only have ${playerMana}.`);
            return;
        }
        
        // Place card in lane
        const newLanes = [...playerLanes];
        newLanes[laneIndex] = {...card, faceDown: true};
        setPlayerLanes(newLanes);
        
        // Remove card from hand
        const newHand = [...playerHand];
        newHand.splice(handIndex, 1);
        setPlayerHand(newHand);
        
        // Deduct mana
        setPlayerMana(prevMana => prevMana - card.cost);
        
        setGameMessage(`Card placed in lane ${laneIndex + 1}. You have ${playerMana - card.cost} mana left.`);
        
        // Close modal if hand is empty
        if (newHand.length === 0) {
            setShowHandModal(false);
        }
    };
    
    // Handle retaining a card
    const handleRetainCard = (card, index) => {
        if (retainedCard) {
            setGameMessage("You can only retain one card per turn.");
            return;
        }
        
        setRetainedCard(card);
        const newHand = [...playerHand];
        newHand.splice(index, 1);
        setPlayerHand(newHand);
        setGameMessage(`You retained ${card.name} for the next turn.`);
        
        // Close modal if hand is empty
        if (newHand.length === 0) {
            setShowHandModal(false);
        }
    };
    
    // Start battle phase
    const handleBattlePhase = () => {
        setTurnPhase('battle');
        setShowHandModal(false);
        
        // Flip all cards face up
        const revealedPlayerLanes = playerLanes.map(card => 
            card ? {...card, faceDown: false} : null
        );
        setPlayerLanes(revealedPlayerLanes);
        
        // TODO: Enemy placement logic will go here
        // For now, just place random cards
        const enemyPlacement = simulateEnemyPlacement();
        setEnemyLanes(enemyPlacement);
        
        // Determine who attacks first (coin toss)
        const playerFirst = Math.random() > 0.5;
        
        if (playerFirst) {
            playerAttack();
            setTimeout(() => enemyAttack(), 1500); // Delay enemy attack for visual effect
        } else {
            enemyAttack();
            setTimeout(() => playerAttack(), 1500); // Delay player attack for visual effect
        }
        
        // Move to end phase after battle
        setTimeout(() => handleEndPhase(), 3000);
    };
    
    // Simulate enemy card placement (temporary)
    const simulateEnemyPlacement = () => {
        // Simple enemy placement for now - random cards in random lanes
        const lanes = [null, null, null];
        const cardPool = [
            { id: 'e1', name: 'Enemy Goblin', power: 2, cost: 2, image: '/assets/images/cards/goblin.png' },
            { id: 'e2', name: 'Enemy Ogre', power: 4, cost: 4, image: '/assets/images/cards/ogre.png' },
            { id: 'e3', name: 'Enemy Dragon', power: 6, cost: 6, image: '/assets/images/cards/dragon.png' },
        ];
        
        // Place 1-3 random cards
        const numCards = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numCards; i++) {
            const randomLane = Math.floor(Math.random() * 3);
            if (lanes[randomLane] === null) {
                lanes[randomLane] = {...cardPool[Math.floor(Math.random() * cardPool.length)], faceDown: true};
            }
        }
        
        // Reveal enemy cards
        return lanes.map(card => card ? {...card, faceDown: false} : null);
    };
    
    // Player attack phase
    const playerAttack = () => {
        let damage = 0;
        
        playerLanes.forEach((card, laneIndex) => {
            if (!card) return;
            
            const opposingCard = enemyLanes[laneIndex];
            
            if (!opposingCard) {
                // Direct attack
                damage += card.power;
                setGameMessage(`${card.name} attacks directly for ${card.power} damage!`);
            } else if (card.power > opposingCard.power) {
                // Destroy opposing card
                const newEnemyLanes = [...enemyLanes];
                newEnemyLanes[laneIndex] = null;
                setEnemyLanes(newEnemyLanes);
                setGameMessage(`${card.name} destroys ${opposingCard.name}!`);
            } else if (card.power === opposingCard.power) {
                // Both cards destroy each other
                const newPlayerLanes = [...playerLanes];
                const newEnemyLanes = [...enemyLanes];
                newPlayerLanes[laneIndex] = null;
                newEnemyLanes[laneIndex] = null;
                setPlayerLanes(newPlayerLanes);
                setEnemyLanes(newEnemyLanes);
                setGameMessage(`${card.name} and ${opposingCard.name} destroy each other!`);
            } else {
                // Player card is destroyed
                const newPlayerLanes = [...playerLanes];
                newPlayerLanes[laneIndex] = null;
                setPlayerLanes(newPlayerLanes);
                setGameMessage(`${opposingCard.name} destroys ${card.name}!`);
            }
        });
        
        if (damage > 0) {
            setEnemyLife(prevLife => prevLife - damage);
        }
    };
    
    // Enemy attack phase
    const enemyAttack = () => {
        let damage = 0;
        
        enemyLanes.forEach((card, laneIndex) => {
            if (!card) return;
            
            const opposingCard = playerLanes[laneIndex];
            
            if (!opposingCard) {
                // Direct attack
                damage += card.power;
                setGameMessage(`${card.name} attacks you directly for ${card.power} damage!`);
            } else if (card.power > opposingCard.power) {
                // Destroy opposing card
                const newPlayerLanes = [...playerLanes];
                newPlayerLanes[laneIndex] = null;
                setPlayerLanes(newPlayerLanes);
                setGameMessage(`${card.name} destroys ${opposingCard.name}!`);
            } else if (card.power === opposingCard.power) {
                // Both cards destroy each other (already handled in playerAttack)
            } else {
                // Enemy card is destroyed (already handled in playerAttack)
            }
        });
        
        if (damage > 0) {
            setPlayerLife(prevLife => prevLife - damage);
        }
    };
    
    // End turn phase
    const handleEndPhase = () => {
        setTurnPhase('end');
        
        // Check win/loss conditions
        if (playerLife <= 0) {
            setGameMessage("You have been defeated!");
            return;
        }
        
        if (enemyLife <= 0) {
            setGameMessage("Victory! You have defeated your opponent!");
            return;
        }
        
        // Prepare for next turn
        setTurnNumber(prevTurn => prevTurn + 1);
        
        // Start next turn
        setTimeout(() => handleDrawPhase(), 1500);
    };
    
    const CardComponent = ({ card }) => {
        return (
            <div className="card">
                <img src={card.image || '/assets/images/card_backs/CARDBACK.png'} alt={card.name} />
                <div className="card-details">
                    <div className="card-name">{card.name}</div>
                    <div className="card-power">Power: {card.power}</div>
                    <div className="card-cost">Cost: {card.cost}</div>
                </div>
            </div>
        );
    };
    
    const SimplePlayerLane = ({ card, index, style }) => {
        return (
            <div 
                className={`lane player-lane ${card ? 'occupied' : 'empty'}`}
                style={style}
                onClick={() => {
                    if (turnPhase === 'place' && selectedCard && !card) {
                        handleCardDrop({ card: selectedCard.card, handIndex: selectedCard.handIndex }, index);
                        setSelectedCard(null);
                    }
                }}
            >
                {card && <CardComponent card={card} />}
            </div>
        );
    };
    
    const SimpleEnemyLane = ({ card, index, style }) => {
        return (
            <div 
                className={`lane enemy-lane ${card ? 'occupied' : 'empty'}`}
                style={style}
            >
                {card && <CardComponent card={card} />}
            </div>
        );
    };
    
    const SimpleHandCard = ({ card, index, onClick }) => {
        return (
            <div 
                className={`hand-card ${selectedCard?.handIndex === index ? 'selected' : ''} ${playerMana < card.cost ? 'disabled' : ''}`}
                onClick={onClick}
            >
                <img src={card.image || '/assets/images/card_backs/CARDBACK.png'} alt={card.name} />
                <div className="card-details">
                    <div className="card-name">{card.name}</div>
                    <div className="card-power">Power: {card.power}</div>
                    <div className="card-cost">Cost: {card.cost}</div>
                </div>
                <button 
                    className="retain-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRetainCard(card, index);
                    }}
                >
                    Retain
                </button>
            </div>
        );
    };
    
    const DeckCard = ({ deck, onClick }) => {
        return (
            <div className="deck-selection-card" onClick={() => onClick(deck.id)}>
                <div className="deck-image">
                    <img src={deck.image || '/assets/images/card_backs/CARDBACK.png'} alt={deck.name} />
                </div>
                <div className="deck-info">
                    <h3>{deck.name}</h3>
                    <p>{deck.cards && deck.cards.length ? deck.cards.length : 'Unknown'} Cards</p>
                </div>
            </div>
        );
    };
    
    return (
        <div className="arena-container">
            <img 
                src="/assets/images/misc/game-board-6.png" 
                alt="Game Arena" 
                className="arena-background" 
                style={{
                    height: '100vh',
                    width: 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}
            />
            
            {/* Intro Modal */}
            {showIntroModal && (
                <div className="intro-modal">
                    <h1>Welcome to the Mythos Arena!</h1>
                    <p>Where legends come to life and battle for supremacy.</p>
                    <div className="intro-buttons">
                        <button onClick={handlePlayClick} className="play-button">Play</button>
                        <button onClick={handleTutorialClick} className="tutorial-button">Tutorial</button>
                    </div>
                </div>
            )}
            
            {/* Tutorial Modal */}
            {showTutorialModal && (
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
                    <button 
                        className="close-tutorial-button"
                        onClick={() => {
                            setShowTutorialModal(false);
                            setShowIntroModal(true);
                        }}
                    >
                        Close Tutorial
                    </button>
                </div>
            )}
            
            {/* Deck Selection Modal */}
            {showDeckSelectionModal && (
                <div className="deck-selection-modal">
                    <h2>Select Your Deck</h2>
                    {availableDecks.length === 0 ? (
                        <div className="no-decks-container">
                            <p>Loading your decks...</p>
                            {/* Add this for debugging if no decks appear: */}
                            <p className="debug-message">If no decks appear, you may need to create some in the Inventory first.</p>
                            <button 
                                className="back-button"
                                onClick={() => {
                                    setShowDeckSelectionModal(false);
                                    setShowIntroModal(true);
                                }}
                            >
                                Back to Menu
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="deck-selection-grid">
                                {availableDecks.map(deck => (
                                    <DeckCard key={deck.id} deck={deck} onClick={handleDeckSelect} />
                                ))}
                            </div>
                            <button 
                                className="back-button"
                                onClick={() => {
                                    setShowDeckSelectionModal(false);
                                    setShowIntroModal(true);
                                }}
                            >
                                Back to Menu
                            </button>
                        </>
                    )}
                </div>
            )}
            
            {/* Game UI - Only show when not in intro screens */}
            {!showIntroModal && !showDeckSelectionModal && (
                <>
                    <div className="arena-header">
                        <h1>Battle Arena</h1>
                        <div className="arena-stats">
                            <div className="player-stats">
                                <div className="life-counter">Life: {playerLife}</div>
                                <div className="mana-counter">Mana: {playerMana}</div>
                                <div className="deck-counter">Deck: {playerDeck.length}</div>
                            </div>
                            <div className="enemy-stats">
                                <div className="life-counter">Enemy Life: {enemyLife}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="game-message">{gameMessage}</div>
                    
                    <div className="battlefield">
                        {/* Enemy lanes with absolute positioning */}
                        {enemyLanes.map((card, index) => (
                            <SimpleEnemyLane
                                key={`enemy-lane-${index}`}
                                index={index}
                                card={card}
                                style={{
                                    position: 'absolute',
                                    ...positionConfig.enemyLanes[index]
                                }}
                            />
                        ))}
                        
                        {/* Player lanes with absolute positioning */}
                        {playerLanes.map((card, index) => (
                            <SimplePlayerLane
                                key={`player-lane-${index}`}
                                index={index}
                                card={card}
                                style={{
                                    position: 'absolute',
                                    ...positionConfig.playerLanes[index]
                                }}
                            />
                        ))}
                    </div>
                    
                    {/* Hand as modal */}
                    {showHandModal && (
                        <div className="player-hand-modal">
                            <h2 className="modal-title">Your Hand</h2>
                            <div className="cards-container">
                                {playerHand.map((card, index) => (
                                    <SimpleHandCard
                                        key={`card-${index}`}
                                        card={card}
                                        index={index}
                                        onClick={() => {
                                            if (playerMana >= card.cost) {
                                                setSelectedCard({ card, handIndex: index });
                                                setGameMessage(`Select a lane to place ${card.name}.`);
                                            } else {
                                                setGameMessage(`Not enough mana. You need ${card.cost} but only have ${playerMana}.`);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button 
                                    className="modal-button"
                                    onClick={() => setShowHandModal(false)}
                                >
                                    Close Hand
                                </button>
                                <button 
                                    className="modal-button end-turn-button"
                                    onClick={handleBattlePhase}
                                >
                                    Start Battle
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="game-controls">
                        {turnPhase === 'place' && !showHandModal && (
                            <button 
                                className="battle-button"
                                onClick={() => setShowHandModal(true)}
                            >
                                Show Hand
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Arena;