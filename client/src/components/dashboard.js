import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import './dashboard.css';

function Dashboard(){
    const { userId } = useParams(); // Get userId from URL parameters
    const location = useLocation();
    const [userData, setUserData] = useState({...location.state?.user, wallet: location.state?.user?.wallet || 100});
    
    useEffect(() => {
        // First try to get data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("Retrieved user from localStorage:", parsedUser);
                // Ensure wallet is always defined
                const updatedUser = {...parsedUser, wallet: parsedUser.wallet || 100};
                setUserData(updatedUser);
                // Update localStorage if wallet was null
                if (parsedUser.wallet === null || parsedUser.wallet === undefined) {
                    localStorage.setItem('user', JSON.stringify(updatedUser));
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
                    console.log("Fetched user data:", data);
                    // Ensure wallet is never null
                    const updatedUser = {...data, wallet: data.wallet || 100};
                    setUserData(updatedUser);
                    // Store in localStorage for future use
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                })
                .catch(err => console.error("Error fetching user:", err));
        }
    }, [userId, userData.id]);
    

    function handleBuy(){
        //modal popup requesting payment w form
    }

    return(
        <div className="dashboard">
            <div className="dashboard-container">
                <div className="header">
                    <img src='/assets/images/misc/banner.png'/>
                    
                </div>
                <div className='nav-bar'>
                    <Link to={`/users/${userId}/inventory`} state={{ user: {...userData, wallet: userData.wallet || 100} }}>Inventory</Link>
                    <Link to={`/users/${userId}/marketplace`} state={{ user: {...userData, wallet: userData.wallet || 100} }}>Marketplace</Link>
                    <Link to={`/users/${userId}/arena`} state={{ user: {...userData, wallet: userData.wallet || 100} }}>Arena</Link>
                </div>
                <div className='user-header'>
                    <h2>Welcome {userData.username || 'User'}!</h2>
                    
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
    )
}

export default Dashboard;
