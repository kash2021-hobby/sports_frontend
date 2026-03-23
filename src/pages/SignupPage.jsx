import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const SignupPage = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        // 🌟 STEP 1: Check if phone exists in Player database
        await authAPI.checkPhone(phone);

        // 🌟 STEP 2: Only if checkPhone succeeds, send the OTP
        await authAPI.sendOTP(phone);
        
        navigate('/verify-otp', { state: { phone } });
    } catch (error) {
        // Handle the specific error message from the backend
        const errorMessage = error.response?.data?.error || "Failed to process request.";
        alert(errorMessage);
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">Player Registration</h1>
                <p className="text-center text-slate-500 mb-8 font-medium">Enter your phone number to get started</p>
                
                <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
                    
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
                                required
                                placeholder="e.g., 9876543210"
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* --- SUBMIT BUTTON --- */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending OTP...
                            </>
                        ) : (
                            'Send OTP'
                        )}
                    </button>
                </form>

                {/* --- FOOTER --- */}
                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <span className="text-slate-500 font-medium">Already have an account? </span>
                    <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors">
                        Log in here
                    </Link>
                </div>
            </div>
            
        </div>
    );
};

export default SignupPage;