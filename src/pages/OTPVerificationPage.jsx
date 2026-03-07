import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const OTPVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone;

    // Security check: Redirect back to signup if accessed without a phone number
    if (!phone) return <Navigate to="/signup" />;

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.verifyOTP(phone, otp);
            navigate('/create-mpin', { state: { phone } });
        } catch (error) {
            alert("Invalid OTP. Hint: Use 52050.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md transform transition-all duration-300 hover:-translate-y-1">
                
                {/* --- ICON --- */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                    </div>
                </div>

                {/* --- HEADER --- */}
                <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">Verify OTP</h2>
                <p className="text-center text-slate-500 mb-8 font-medium">
                    Code sent to <span className="text-slate-800 font-bold tracking-wide">{phone}</span>
                </p>
                
                <form onSubmit={handleVerify} className="flex flex-col gap-6">
                    
                    {/* --- OTP INPUT --- */}
                    <div className="relative">
                        <input 
                            type="text" 
                            required
                            maxLength="5"
                            placeholder="Enter 5-digit OTP"
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-3xl tracking-[0.5em] font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal placeholder:text-base"
                        />
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
                                Verifying...
                            </>
                        ) : (
                            'Verify & Continue'
                        )}
                    </button>
                </form>

                {/* --- FOOTER / RESEND HINT --- */}
                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-500 font-medium">
                        Didn't receive the code? <button type="button" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors" onClick={() => alert("Hint: Use 52050 for Phase-1 testing.")}>Resend</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPVerificationPage;