import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validate passwords match
        if (formData.new_password !== formData.confirm_password) {
            setError("Passwords don't match");
            return;
        }

        // Validate password strength
        if (formData.new_password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/userauth/reset-password/', {
                uid: uid,
                token: token,
                new_password: formData.new_password
            });

            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Password reset failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                <p className="auth-subtitle">Enter your new password below</p>
                
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="new_password">New Password</label>
                        <input
                            type="password"
                            id="new_password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                            placeholder="Enter new password"
                            minLength="6"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                            placeholder="Confirm new password"
                            minLength="6"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
                
                <div className="auth-links">
                    <p>
                        Remember your password? <a href="/login">Back to Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;