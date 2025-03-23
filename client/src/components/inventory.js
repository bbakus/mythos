import React, {useState, useEffect} from "react";
import { useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import './inventory.css';
import DeckModal from './DeckModal';

function Inventory(){
    const { userId } = useParams();
    const location = useLocation();
    const userData = location.state?.user || {};
    
    const [inventory, setInventory] = useState([]);
    const [showDeckModal, setShowDeckModal] = useState(false);
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

    return(
        <div className='inventory-container'>
            <div className='nav-bar'>
                <Link to={`/users/${userId}/dashboard`} state={{ user: userData }}>Dashboard</Link>
                <Link to={`/users/${userId}/inventory`} className="active" state={{ user: userData }}>Inventory</Link>
                <Link to={`/users/${userId}/marketplace`} state={{ user: userData }}>Marketplace</Link>
                <Link to={`/users/${userId}/arena`} state={{ user: userData }}>Arena</Link>
            </div>
            
            <div className="inventory-header">
                <h1>Your Collection</h1>
                <button className='deck-builder-btn' onClick={toggleDeckModal}>Decks</button>
            </div>
            
            <div className="user-info">
                <p>Welcome back, {userData.username}!</p>
                <p>Wallet: {userData.wallet} gems</p>
            </div>
            
            {inventory.map(item => (
                <div className="card-container" key={item.id}>
                    <img src={item.card.image} alt={item.card.name}/>
                    <div className="card-details">
                        <div className="card-name">{item.card.name}</div>
                        <div className="card-quantity">Quantity: {item.quantity}</div>
                    </div>
                </div>
            ))}

            {showDeckModal && (
                <DeckModal 
                    onClose={toggleDeckModal}
                    userId={userId}
                    decks={decks}
                    setDecks={setDecks}
                    inventory={inventory}
                />
            )}
        </div>
    );
}

export default Inventory;