import React, {useState, useEffect} from "react";
import { useLocation, useParams, Link } from 'react-router-dom';
import PurchaseModal from './PurchaseModal';
import './marketplace.css'; // We'll create this CSS file next

function Marketplace(){
    // Get the userId from URL params
    const { userId } = useParams();
    
    const location = useLocation();
    // Get user data from state or initialize to empty object with default wallet
    const initialUserData = location.state?.user || {};
    
    const [cards, setCards] = useState([])
    const [guardCards, setGuardCards] = useState([])
    const [mysteryCard, setMysteryCard] = useState(false)
    const [mysteryCardImage, setMysteryCardImage] = useState([])
    const [boosterPack, setBoosterPack] = useState([]);
    const [showBoosterPack, setShowBoosterPack] = useState(true);
    const [wallet, setWallet] = useState(initialUserData.wallet || 100);
    const [error, setError] = useState("");
    const [user, setUser] = useState({...initialUserData, wallet: initialUserData.wallet || 100});
    const [cardPrices, setCardPrices] = useState({});
    
    // Add modal state
    const [modal, setModal] = useState({
        isOpen: false,
        cardName: '',
        cardImage: '',
        multipleCards: null
    });

    // Function to open modal
    const openPurchaseModal = (name, image, cards = null) => {
        setModal({
            isOpen: true,
            cardName: name,
            cardImage: image,
            multipleCards: cards
        });
    };

    // Function to close modal
    const closeModal = () => {
        setModal({
            ...modal,
            isOpen: false
        });
    };

    // Force wallet to never be null
    useEffect(() => {
        if (wallet === null || wallet === undefined) {
            setWallet(100);
        }
    }, [wallet]);
    
    // Try to get user data from localStorage first, then fall back to API if needed
    useEffect(() => {
        // First check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("Retrieved user from localStorage:", parsedUser);
                
                // Ensure wallet is never null
                const updatedUser = {...parsedUser, wallet: parsedUser.wallet || 100};
                setUser(updatedUser);
                setWallet(updatedUser.wallet);
                
                // Update localStorage if wallet was null
                if (parsedUser.wallet === null || parsedUser.wallet === undefined) {
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            } catch (error) {
                console.error("Error parsing user from localStorage:", error);
            }
        }
        // If no localStorage data and no user data in state but we have userId, fetch it
        else if (!user.id && userId) {
            fetch(`/users/${userId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch user data");
                    return res.json();
                })
                .then(data => {
                    
                    const updatedUser = {...data, wallet: data.wallet || 100};
                    setUser(updatedUser);
                    setWallet(updatedUser.wallet);
                    
                    // Store in localStorage for future use
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                })
                .catch(err => {
                    console.error("Error fetching user:", err);
                    setError("Error loading user data. Please try logging in again.");
                });
        }
    }, [userId, user.id]);

    useEffect(() => {
        fetch('/cards')
        .then(res => res.json())
        .then(data => {
            // Create a deep copy of the data array
            const dataCopy = JSON.parse(JSON.stringify(data));
            // Shuffle the cards
            const shuffledCards = shuffleArray(dataCopy);
            
            // Generate and store random prices for each card
            const prices = {};
            shuffledCards.forEach(card => {
                prices[card.id] = Math.floor(Math.random() * 20) + 5;
            });
            
            setCardPrices(prices);
            setCards(shuffledCards);
            if (data.length > 0) {
                guardBundle(data);
            }
        })
        .catch(error => console.error('Error fetching cards:', error));
    }, []);

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        let shuffled = [...array]; // Create a new array to avoid mutating the original
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // Swap elements
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }

    function guardBundle(cardsData) {
        const cardArray = cardsData || cards;
        
        const guardFilteredCards = cardArray.filter(card => card.guard === true);
        
        if (guardFilteredCards.length > 0) {
            // Create a copy to avoid modifying the original array
            const availableGuards = [...guardFilteredCards];
            const selectedGuards = [];
            
            // Select up to 3 unique guard cards
            for (let i = 0; i < 3 && availableGuards.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableGuards.length);
                selectedGuards.push(availableGuards[randomIndex]);
                
                // Remove the selected card from available options to prevent duplicates
                availableGuards.splice(randomIndex, 1);
            }
            
            setGuardCards(selectedGuards);
        }
    }
    
    // Add function to refresh user data from server
    const refreshUserData = () => {
        if (userId) {
            fetch(`/users/${userId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch user data");
                    return res.json();
                })
                .then(data => {
                   
                    const updatedUser = {...data, wallet: data.wallet || 100};
                    setUser(updatedUser);
                    setWallet(updatedUser.wallet);
                    
                    // Update localStorage
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                })
                .catch(err => {
                    console.error("Error refreshing user data:", err);
                });
        }
    };

    // Add function to add 100 gems to wallet
    const addTestGems = () => {
        if (userId) {
            const newWalletAmount = wallet + 100;
            
            fetch(`/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ wallet: newWalletAmount })
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to update wallet");
                return res.json();
            })
            .then(data => {
                console.log(`Updated wallet: ${data.wallet} gems`);
                setWallet(data.wallet);
                
                // Update user object and localStorage
                const updatedUser = {...user, wallet: data.wallet};
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                setError("Added 100 gems for testing!");
                setTimeout(() => setError(""), 3000);
            })
            .catch(err => {
                console.error("Error adding test gems:", err);
                setError(err.message);
            });
        }
    };

    function mysteryCardBuy(){
        if (wallet < 10) {
            setError("Not enough gems to buy this card");
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * cards.length);
        const selectedCard = cards[randomIndex];
        
        // Show the card immediately
        setMysteryCardImage(selectedCard);
        setMysteryCard(true);
        
        // Add card to inventory
        fetch(`/users/${userId}/inventory`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                card_id: selectedCard.id,
                quantity: 1
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to add card to inventory");
            return res.json();
        })
        .then(data => {
            // Show purchase modal
            openPurchaseModal(selectedCard.name, selectedCard.image);
            
            return fetch(`/users/${userId}`, {
                method: 'PATCH', // Use PATCH for partial updates
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    wallet: wallet - 10 // Send new balance, not just the difference
                })
            });
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update wallet");
            return res.json();
        })
        .then(data => {
            console.log(`Updated wallet: ${data.wallet} gems left`);
            setWallet(data.wallet);
            
            // Update user object and localStorage
            const updatedUser = {...user, wallet: data.wallet};
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Reset mystery card after 3 seconds so user can buy another one
            setTimeout(() => {
                setMysteryCard(false);
            }, 3000);
        })
        .catch(err => {
            console.error("Error in mystery card purchase:", err);
            
            // Still reset the mystery card even if there was an error
            setTimeout(() => {
                setMysteryCard(false);
            }, 3000);
        });
    }

    function boosterPackBuy(){
        console.log("Booster pack bought");
        if (wallet < 25) {
            setError("Not enough gems to buy this card");
            return;
        }   
        
        const randomIndex = Math.floor(Math.random() * (cards.length - 5));
        const selectedCards = cards.slice(randomIndex, randomIndex + 5);
        setBoosterPack(selectedCards);
        setShowBoosterPack(false);
        setWallet(wallet - 25);

        // Show modal with all 5 cards from the booster pack
        openPurchaseModal("Booster Pack", null, selectedCards);

        // Create promises for each card to add to inventory
        const addCardPromises = selectedCards.map(card => 
            fetch(`/users/${userId}/inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    card_id: card.id,
                    quantity: 1
                })
            })
            .then(res => {
                if (!res.ok) throw new Error(`Failed to add card ${card.name} to inventory`);
                return res.json();
            })
        );
        
        // Execute all promises
        Promise.all(addCardPromises)
            .then(() => {
                console.log("All booster pack cards added to inventory");
                
                // Update wallet on server
                return fetch(`/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({wallet: wallet - 25})
                });
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to update wallet");
                return res.json();
            })
            .then(data => {
                console.log(`Updated wallet: ${data.wallet} gems left`);
                // Update user object and localStorage
                const updatedUser = {...user, wallet: data.wallet};
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Reset booster pack after 3 seconds so user can buy another one
                setTimeout(() => {
                    setShowBoosterPack(true);
                }, 3000);
            })
            .catch(err => {
                console.error("Error during booster pack purchase:", err);
                setError(err.message);
                
                // Still reset the booster pack view even if there was an error
                setTimeout(() => {
                    setShowBoosterPack(true);
                }, 3000);
            });
    }

    function guardBundleBuy(){
        console.log("Guard bundle bought");
        if (wallet < 20) {
            setError("Not enough gems to buy this card");
            return;
        }

        // Show modal with all guard cards
        openPurchaseModal("Guard Bundle", null, guardCards);
        
        // Update wallet immediately in UI
        setWallet(wallet - 20);
        
        // Create promises for each card to add to inventory
        const addCardPromises = guardCards.map(card => 
            fetch(`/users/${userId}/inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    card_id: card.id,
                    quantity: 1
                })
            })
            .then(res => {
                if (!res.ok) throw new Error(`Failed to add card ${card.name} to inventory`);
                return res.json();
            })
        );
        
        // Execute all promises
        Promise.all(addCardPromises)
            .then(() => {
                console.log("All guard cards added to inventory");
                
                // Update wallet on server
                return fetch(`/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({wallet: wallet - 20})
                });
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to update wallet");
                return res.json();
            })
            .then(data => {
                console.log(`Updated wallet: ${data.wallet} gems left`);
                // Update user object and localStorage
                const updatedUser = {...user, wallet: data.wallet};
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            })
            .catch(err => {
                console.error("Error during guard bundle purchase:", err);
                setError(err.message);
            });
    }

    function cardBuy(card) {
        const price = cardPrices[card.id];
        console.log(`Attempting to buy ${card.name} for ${price} gems`);
        
        if (wallet < price) {
            setError(`Not enough gems to buy ${card.name}. You need ${price} gems.`);
            return;
        }
        
        // Add card to inventory
        fetch(`/users/${userId}/inventory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                card_id: card.id,
                quantity: 1
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to add card to inventory");
            return res.json();
        })
        .then(data => {
            console.log(`Added ${card.name} to inventory`);
            
            // Show the purchase modal
            openPurchaseModal(card.name, card.image);
            
            // Update wallet
            return fetch(`/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    wallet: wallet - price
                })
            });
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update wallet");
            return res.json();
        })
        .then(data => {
            console.log(`Updated wallet: ${data.wallet} gems left`);
            setWallet(data.wallet);
            
            // Update user object and localStorage
            const updatedUser = {...user, wallet: data.wallet};
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setError(`Successfully purchased ${card.name}!`);
            setTimeout(() => setError(""), 3000); // Clear success message after 3 seconds
        })
        .catch(err => {
            console.error("Error during purchase:", err);
            setError(err.message);
        });
    }

    return(
        <div className='marketplace-container'>
            {/* Render the purchase modal component */}
            <PurchaseModal 
                isOpen={modal.isOpen} 
                onClose={closeModal} 
                cardName={modal.cardName} 
                cardImage={modal.cardImage}
                multipleCards={modal.multipleCards}
            />
            {/* Add a navigation bar at the top */}
            <div className='nav-bar'>
                <Link to={`/users/${userId}/dashboard`} state={{ user: {...user, wallet: wallet || 100} }}>Dashboard</Link>
                <Link to={`/users/${userId}/inventory`} state={{ user: {...user, wallet: wallet || 100} }}>Inventory</Link>
                <Link to={`/users/${userId}/marketplace`} state={{ user: {...user, wallet: wallet || 100} }} className="active">Marketplace</Link>
                <Link to={`/users/${userId}/arena`} state={{ user: {...user, wallet: wallet || 100} }}>Arena</Link>
            </div>
            
            <div className="user-info">
                <p>Wallet: {wallet || 100} gems</p>
                <div className="wallet-buttons">
                    <button onClick={refreshUserData} className="refresh-button">Refresh Wallet</button>
                    <button onClick={addTestGems} className="add-gems-button">Add 100 Gems (Testing)</button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
            
            <div className='deals'>
                {showBoosterPack ?
                (
                    <div className="booster-pack">
                        <h1>BOOSTER PACK</h1>
                        <img src='/assets/images/misc/booster_packs.webp' alt='Booster pack'/>
                        <h2>Price: 25 GEMS</h2>
                   <button onClick={boosterPackBuy} className="buy-button">BUY</button>
                </div>
                ):(
                    <div className='show-booster-pack'>
                        {boosterPack.map((card, index) => (
                            <img key={index} src={card.image} alt={card.name}/>
                        ))}
                    </div>
                )}
                {mysteryCard ?
                (
                    <div className='mystery-card'>
                        <h1>You got {mysteryCardImage.name}!</h1>
                        <img src={mysteryCardImage.image} alt={mysteryCardImage.name}/> 
                    </div>
                ) :
                (<div className="mystery-card">
                    <h1>MYSTERY CARD</h1>
                    <img src='/assets/images/card_backs/CARDBACK.png' alt="Mystery card back"/>
                    <h2>Price: 10 gems</h2>
                    <button onClick={mysteryCardBuy} className="buy-button">BUY</button>
                </div>)}
                <div className='guard-pack'>
                    <h1>GUARD BUNDLE</h1>
                    <div className="guard-pack-images">
                        {
                            guardCards.map((card, index) => (
                                <img key={index} src={card.image} alt={`Guard card ${index}`} />
                            ))
                        }
                    </div>
                    <h2>Price: 20 GEMS</h2>
                    <button onClick={guardBundleBuy} className="buy-button">BUY</button>
                </div>
            </div>
            <div className="cards-grid">
                {cards.map((card, index) => (
                    <div key={`card-${card.id}-${index}`} className='card-container'>
                        <img src={card.image} alt={card.name} />
                        <h2 className='price'>{cardPrices[card.id] || 10} GEMS</h2>
                        <button onClick={() => cardBuy(card)} className="buy-button">BUY</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Marketplace
