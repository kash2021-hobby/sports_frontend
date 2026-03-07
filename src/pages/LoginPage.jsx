import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ phone: '', mpin: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.login(credentials.phone, credentials.mpin);
            const { user } = response.data;
            
            // Save user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Route based on ROLE
            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } 
            else if (user.role === 'manager') {
                navigate('/manager-dashboard');
            } 
            else if (user.role === 'player') {
                // Check if player has completed profile (name exists)
                if (!user.name) {
                    navigate('/profile-setup');
                } else {
                    navigate('/player-dashboard');
                }
            }
            
        } catch (error) {
            alert(error.response?.data?.error || "Invalid Phone or MPIN.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md transform transition-all duration-300 hover:-translate-y-1">
                
                {/* --- HEADER ICON --- */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-center text-slate-500 mb-8 font-medium">Log in to access your portal</p>
                
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    
                    {/* --- PHONE INPUT --- */}
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2 ml-1">Phone Number</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </div>
                            <input 
                                type="tel" 
                                name="phone"
                                required
                                placeholder="e.g., 9876543210"
                                value={credentials.phone} 
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* --- MPIN INPUT --- */}
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2 ml-1">Secure MPIN</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <input 
                                type="password" 
                                name="mpin"
                                required
                                maxLength="4"
                                placeholder="••••"
                                value={credentials.mpin} 
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-2xl tracking-[0.5em] font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                            />
                        </div>
                    </div>

                    {/* --- SUBMIT BUTTON --- */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </>
                        ) : (
                            'Secure Login'
                        )}
                    </button>
                </form>

                {/* --- FOOTER --- */}
                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <span className="text-slate-500 font-medium">New player? </span>
                    <Link to="/signup" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors">
                        Create an account
                    </Link>
                </div>
            </div>
            
        </div>
    );
};

export default LoginPage;