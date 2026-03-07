import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const CreateMPINPage = () => {
    const [mpin, setMpin] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone;

    if (!phone) return <Navigate to="/signup" />;

    const handleCreateMPIN = async (e) => {
        e.preventDefault();
        if (mpin.length !== 4) {
            return alert("MPIN must be exactly 4 digits.");
        }

        setLoading(true);
        try {
            await authAPI.setMPIN(phone, mpin);
            alert("MPIN created successfully! Please log in.");
            navigate('/login');
        } catch (error) {
            alert("Failed to set MPIN.");
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                </div>

                {/* --- HEADER --- */}
                <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">Secure Your Account</h2>
                <p className="text-center text-slate-500 mb-8 font-medium">Create a 4-digit PIN for quick & secure logins.</p>
                
                <form onSubmit={handleCreateMPIN} className="flex flex-col gap-6">
                    
                    {/* --- MPIN INPUT --- */}
                    <div className="relative">
                        <input 
                            type="password" 
                            required
                            maxLength="4"
                            placeholder="••••"
                            value={mpin} 
                            onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))} // Only allow digits
                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-4xl tracking-[0.75em] font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-300"
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
                                Saving PIN...
                            </>
                        ) : (
                            'Set Secure PIN'
                        )}
                    </button>

                </form>
            </div>
            
        </div>
    );
};

export default CreateMPINPage;