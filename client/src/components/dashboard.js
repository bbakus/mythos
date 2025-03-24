import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

function Dashboard(){
    const { userId } = useParams(); // Get userId from URL parameters
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(location.state?.user || {});
    
    useEffect(() => {
        // First try to get data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("Retrieved user from localStorage:", parsedUser);
                setUserData(parsedUser);
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
                    setUserData(data);
                    // Store in localStorage for future use
                    localStorage.setItem('user', JSON.stringify(data));
                })
                .catch(err => console.error("Error fetching user:", err));
        }
    }, [userId, userData.id]);
    

    function handleBuy(){
        //modal popup requesting payment w form
    }

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        // Navigate to login page
        navigate('/login');
    };

    return(
        <div className="dashboard">
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
