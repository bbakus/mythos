import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import Dashboard from './dashboard';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [user, setUser] = useState(null)
  const [errors, setErrors] = useState({});

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value
    });
  };

  const validateSignup = () => {
    const newErrors = {};
    
    if (!signupData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!signupData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    
    if (signupData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Attempting login with:', loginData);
    
    try {
      const response = await fetch('http://localhost:5555/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Login response text:', responseText);
        
        let user;
        try {
          user = JSON.parse(responseText);
          console.log('Parsed user:', user);
        } catch (error) {
          console.error('Error parsing response:', error);
          setErrors({ login: "Failed to parse server response" });
          return;
        }
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate(`/users/${user.id}/dashboard`, {state: { user: user }});
      } else {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Unknown error occurred' };
        }
        
        console.error("Parsed error data:", errorData);
        setErrors({ login: errorData.error || 'Login failed' });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ login: 'Login failed. Please try again.' });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateSignup()) {
      return;
    }

    const signupPayload = {
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      wallet: 100 // Starting wallet amount
    };
    
    console.log("Sending signup data:", signupPayload);
    
    try {
      const response = await fetch('http://localhost:5555/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupPayload),
      });
      
      console.log("Signup response status:", response.status);
      
      if (response.ok) {
        const user = await response.json();
        console.log("Signup successful, user data:", user);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate(`/users/${user.id}/dashboard`, {state: { user: user }});
      } else {
        const errorText = await response.text();
        console.error("Signup error response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Unknown error occurred' };
        }
        
        console.error("Parsed error data:", errorData);
        setErrors({ signup: errorData.error || 'Signup failed' });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ signup: 'Signup failed. Please try again.' });
    }
  };


  return (
    <div className="login-container">
        
      <div className="form-toggle">
        <button 
          className={isLogin ? 'active' : ''} 
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button 
          className={!isLogin ? 'active' : ''} 
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>
      </div>
      
      {isLogin ? (
        <form onSubmit={handleLogin} className="login-form">
          <h2>Login to Your Account</h2>
          
          {errors.login && <div className="error">{errors.login}</div>}
          
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">Login</button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="signup-form">
          <h2>Create a New Account</h2>
          
          {errors.signup && <div className="error">{errors.signup}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={signupData.username}
              onChange={handleSignupChange}
              required
            />
            {errors.username && <div className="error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              type="email"
              id="signup-email"
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
              required
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              name="password"
              value={signupData.password}
              onChange={handleSignupChange}
              required
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              required
            />
            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
          </div>
          
          <button type="submit" className="submit-btn">Sign Up</button>
        </form>
      )}
    </div>
  );
}

export default Login;
