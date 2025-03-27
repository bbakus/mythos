import React, {useState, useEffect} from "react";
import { useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import '../styles/inventory.css';
import DeckModal from './DeckModal';
import CardModal from './CardModal';

function Inventory(){
    const { userId } = useParams();
    const location = useLocation();
    const userData = location.state?.user || {};
    
    const [inventory, setInventory] = useState([]);
    const [showDeckModal, setShowDeckModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Fetch inventory
        fetch(`/users/${userId}/inventory`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch inventory');
                }
                return res.json();
            })
            .then(data => {
                setInventory(data);
            })
            .catch(err => {
                console.error('Error fetching inventory:', err);
            });
            
        // Fetch user decks
        fetch(`/users/${userId}/decks`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch decks');
                }
                return res.json();
            })
            .then(data => {
                setDecks(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching decks:', err);
                setLoading(false);
            });
    }, [userId]);

    function toggleDeckModal() {
        setShowDeckModal(!showDeckModal);
    }

    function handleCardClick(card) {
        setSelectedCard(card);
        setShowCardModal(true);
    }

    function closeCardModal() {
        setShowCardModal(false);
        setSelectedCard(null);
    }

    return(
        <>
            <div className='inventory-root'></div>
            <div className='inventory-container'>
                <div className="header">
                    <img src='/assets/images/misc/header-image.png' alt="Header"/>
                </div>
                <div className='nav-bar'>
                    <Link to={`/users/${userId}/dashboard`} state={{ user: userData }}>Dashboard</Link>
                    <Link to={`/users/${userId}/inventory`} className="active" state={{ user: userData }}>Inventory</Link>
                    <Link to={`/users/${userId}/marketplace`} state={{ user: userData }}>Marketplace</Link>
                    <Link to={`/users/${userId}/arena`} state={{ user: userData }}>Arena</Link>
                </div>
                
                <div className='inventory-header'>
                    <h2>Inventory</h2>
                    <p>Wallet: {userData.wallet} gems</p>
                </div>
                
                <div className="user-info">
                    <p>Welcome back, {userData.username}!</p>
                </div>
                
                <div className="inventory-grid">
                    {inventory.map(item => (
                        <div 
                            className="card-container" 
                            key={item.id}
                            onClick={() => handleCardClick(item.card)}
                        >
                            <img src={item.card.image} alt={item.card.name}/>
                            <div className="card-details">
                                <div className="card-name">{item.card.name}</div>
                                <div className="card-quantity">Quantity: {item.quantity}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {showDeckModal && (
                    <DeckModal 
                        onClose={toggleDeckModal}
                        userId={userId}
                        decks={decks}
                        setDecks={setDecks}
                        inventory={inventory}
                    />
                )}

                {showCardModal && selectedCard && (
                    <CardModal 
                        card={selectedCard}
                        onClose={closeCardModal}
                    />
                )}
                
            </div>
        </>
    );
}

export default Inventory;