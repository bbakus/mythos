import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import WelcomeGiftModal from './WelcomeGiftModal';
import PaymentModal from './PaymentModal';
import '../styles/dashboard.css';

function Dashboard(){
    const { userId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(location.state?.user || {});
    const [showWelcomeGift, setShowWelcomeGift] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    useEffect(() => {
        // Check if this is the user's first visit
        const hasSeenWelcome = localStorage.getItem(`welcomed_${userId}`);
        
        // First try to get data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserData(parsedUser);
                
                // Show welcome gift if user hasn't seen it
                if (!hasSeenWelcome) {
                    setShowWelcomeGift(true);
                }
            } catch (error) {
                console.error("Error parsing user from localStorage:", error);
            }
        } 
        // If no data in localStorage and no userData but we have userId, fetch it
        else if (!userData.id && userId) {
            fetch(`/users/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setUserData(data);
                    localStorage.setItem('user', JSON.stringify(data));
                    
                    // Show welcome gift if user hasn't seen it
                    if (!hasSeenWelcome) {
                        setShowWelcomeGift(true);
                    }
                })
                .catch(err => console.error("Error fetching user:", err));
        }
    }, [userId, userData.id]);

    const handleCloseWelcomeGift = () => {
        // Mark that the user has seen the welcome gift
        localStorage.setItem(`welcomed_${userId}`, 'true');
        setShowWelcomeGift(false);
    };

    const handleBuy = () => {
        setShowPaymentModal(true);
    };

    const handleClosePayment = (amount) => {
        setShowPaymentModal(false);
        
        if (amount > 0) {
            // Calculate gems based on amount
            let gems = 0;
            switch(amount) {
                case 10:
                    gems = 100;
                    break;
                case 25:
                    gems = 300;
                    break;
                case 50:
                    gems = 700;
                    break;
                case 100:
                    gems = 1500;
                    break;
                default:
                    return;
            }
            
            // Update user's wallet
            const newWallet = userData.wallet + gems;
            fetch(`/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    wallet: newWallet
                })
            })
            .then(res => res.json())
            .then(data => {
                setUserData(data);
                localStorage.setItem('user', JSON.stringify(data));
            })
            .catch(err => console.error("Error updating wallet:", err));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return(
        <div className="dashboard">
            {showWelcomeGift && (
                <WelcomeGiftModal onClose={handleCloseWelcomeGift} />
            )}
            
            {showPaymentModal && (
                <PaymentModal onClose={handleClosePayment} />
            )}
            
            <div className="dashboard-container">
                <div className="header">
                    <img src='/assets/images/misc/banner.png'/>
                </div>
                
                <div className='nav-bar'>
                    <Link to={`/users/${userId}/inventory`} state={{ user: userData }}>Inventory</Link>
                    <Link to={`/users/${userId}/marketplace`} state={{ user: userData }}>Marketplace</Link>
                    <Link to={`/users/${userId}/arena`} state={{ user: userData }}>Arena</Link>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
                
                <div className='user-header'>
                    <h2>Welcome {userData.username || 'User'}!</h2>
                    <p>Wallet: {userData.wallet} gems</p>
                </div>
                
                <div className="content-wrapper">
                    <div className="features">
                        <h1>THE BATTLE OF SPIROS - JOIN THE ARENA</h1>
                        <img src="/assets/images/misc/fight.webp" alt="Arena Battle" />
                    </div>

                    <div className='gems'>
                        <div className="content-header">
                            <button onClick={handleBuy}>BUY GEMS</button>
                        </div>
                        <img src='/assets/images/misc/gems.webp' alt="Gems" />
                    </div>
                </div>
                
                <div className='dashboard-background'>
                    <img src="https://www.brownandhudson.com/assets/uploads/case-studies/here_be_dragons.jpg" alt="Background"/>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
