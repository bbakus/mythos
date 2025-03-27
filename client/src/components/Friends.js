import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Friends.css';

const Friends = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(location.state?.user || {});
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [newFriendUsername, setNewFriendUsername] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [wins, setWins] = useState(0);

    // Medal thresholds
    const MEDAL_THRESHOLDS = [1, 5, 10, 20, 50];

    useEffect(() => {
        const loadUserData = async () => {
            console.log('Loading user data...');
            // First try to get data from localStorage
            const storedUser = localStorage.getItem('user');
            console.log('Stored user:', storedUser);
            
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    console.log('Parsed user:', parsedUser);
                    setUserData(parsedUser);
                    setWins(parsedUser.wins || 0);
                    await fetchFriendData(parsedUser.id);
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                    navigate('/login');
                }
            } 
            // If no data in localStorage, fetch it from the API
            else if (location.state?.user?.id) {
                console.log('Location state user:', location.state.user);
                try {
                    const response = await fetch(`http://localhost:5555/users/${location.state.user.id}`);
                    const data = await response.json();
                    console.log('Fetched user data:', data);
                    setUserData(data);
                    setWins(data.wins || 0);
                    localStorage.setItem('user', JSON.stringify(data));
                    await fetchFriendData(data.id);
                } catch (err) {
                    console.error("Error fetching user:", err);
                    navigate('/login');
                }
            } else {
                console.log('No user data found in localStorage or location state');
                navigate('/login');
            }
        };

        loadUserData();
    }, [location.state?.user?.id, navigate]);

    const fetchFriendData = async (userId) => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:5555/users/${userId}/friends`);
            if (!response.ok) throw new Error('Failed to fetch friend data');
            const data = await response.json();
            setFriendRequests(data.received_requests);
            setFriends(data.friends);
        } catch (err) {
            console.error('Error fetching friend data:', err);
            setError('Failed to load friend data');
        }
    };

    const sendFriendRequest = async (e) => {
        e.preventDefault();
        if (!userData.id) return;
        try {
            const response = await fetch(`http://localhost:5555/users/${userData.id}/friend-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newFriendUsername }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send friend request');
            }
            
            setSuccess('Friend request sent successfully!');
            setNewFriendUsername('');
            fetchFriendData(userData.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFriendRequest = async (requestId, action) => {
        if (!userData.id) return;
        try {
            const response = await fetch(`http://localhost:5555/users/${userData.id}/friend-requests/${requestId}/response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to process friend request');
            }
            
            setSuccess(`Friend request ${action}ed successfully!`);
            fetchFriendData(userData.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const getMedalDescription = (threshold) => {
        switch(threshold) {
            case 1:
                return "First Victory - Win your first game";
            case 5:
                return "Novice Warrior - Win 5 games";
            case 10:
                return "Seasoned Fighter - Win 10 games";
            case 20:
                return "Battle-Hardened - Win 20 games";
            case 50:
                return "Legendary Champion - Win 50 games";
            default:
                return "";
        }
    };

    const getMedalTitle = (threshold) => {
        switch(threshold) {
            case 1:
                return "First Victory";
            case 5:
                return "Novice Warrior";
            case 10:
                return "Seasoned Fighter";
            case 20:
                return "Battle-Hardened";
            case 50:
                return "Legendary Champion";
            default:
                return "";
        }
    };

    return (
        <div className="friends-page">
            <div className="friends-container">
                <div className="medal-display">
                    {MEDAL_THRESHOLDS.map((threshold, index) => (
                        <div key={index} className="medal-group">
                            <div className="medal-title">{getMedalTitle(threshold)}</div>
                            <div 
                                className={`medal-slot ${wins >= threshold ? 'earned' : ''}`}
                            >
                                <div className="medal-tooltip">
                                    {getMedalDescription(threshold)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="friends-content">
                    <div className='nav-bar'>
                        <Link to={`/users/${userData.id}/dashboard`}>Dashboard</Link>
                        <Link to={`/users/${userData.id}/inventory`}>Inventory</Link>
                        <Link to={`/users/${userData.id}/marketplace`}>Marketplace</Link>
                        <Link to={`/users/${userData.id}/arena`}>Arena</Link>
                        <Link to={`/users/${userData.id}/friends`} className="active">Friends</Link>
                    </div>

                    <div className="friends-header">
                        <h2>MYTHOS LINK</h2>
                    </div>
                    
                    {/* Send Friend Request Form */}
                    <div className="friend-request-form">
                        <h3>Send Friend Request</h3>
                        <form onSubmit={sendFriendRequest}>
                            <input
                                type="text"
                                value={newFriendUsername}
                                onChange={(e) => setNewFriendUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                            <button type="submit">Send Request</button>
                        </form>
                    </div>

                    {/* Error and Success Messages */}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="friends-main-content">
                        {/* Friend Requests */}
                        <div className="friend-requests">
                            <h3>Pending Requests</h3>
                            {friendRequests.length === 0 ? (
                                <p className="no-friends">No pending requests</p>
                            ) : (
                                friendRequests.map(request => (
                                    <div key={request.id} className="friend-request">
                                        <span>{request.sender.username} seeks your alliance</span>
                                        <div className="request-actions">
                                            <button onClick={() => handleFriendRequest(request.id, 'accept')}>
                                                Accept
                                            </button>
                                            <button onClick={() => handleFriendRequest(request.id, 'reject')}>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Friends List */}
                        <div className="friends-list">
                            <h3>Your Allies</h3>
                            {friends.length === 0 ? (
                                <p className="no-friends">No allies yet. Forge new alliances!</p>
                            ) : (
                                <ul>
                                    {friends.map(friend => (
                                        <li key={friend.id} className="friend-item">
                                            <span>{friend.username}</span>
                                            <button className="challenge-btn">CHALLENGE</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Friends; 