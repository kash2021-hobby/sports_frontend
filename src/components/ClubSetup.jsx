import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const ClubSetup = () => {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [logoFile, setLogoFile] = useState(null); // 🌟 State for the file
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logoFile) return alert("Please select a club logo");

    setLoading(true);
    try {
        const data = new FormData();
        data.append("manager_id", storedUser.id);
        data.append("name", name);
        data.append("city", city);
        data.append("club_logo", logoFile);

        const res = await API.post('/manager/setup-club-with-drive', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // 🌟 STEP 1: Create the new user object
        const updatedUser = { 
            ...storedUser, 
            club_id: res.data.club_id 
        };
        
        // 🌟 STEP 2: Save it to localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        alert("Club setup complete!");

        // 🌟 STEP 3: Redirect and replace history so they can't go back
        navigate('/manager-dashboard', { replace: true });
        
        // 🌟 STEP 4: Force a window reload if App.js isn't catching the change
        // window.location.reload(); 

    } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Failed to setup club.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 mb-6">Setup Your Team</h1>
                
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Team Name</label>
                    <input 
                        placeholder="e.g. Elite FC" 
                        className="w-full p-4 bg-slate-50 border rounded-2xl"
                        onChange={(e) => setName(e.target.value)}
                        required 
                    />

                    <label className="block text-sm font-bold text-slate-700">City</label>
                    <input 
                        placeholder="e.g. Guwahati" 
                        className="w-full p-4 bg-slate-50 border rounded-2xl"
                        onChange={(e) => setCity(e.target.value)}
                        required 
                    />

                    <label className="block text-sm font-bold text-slate-700">Team Logo Image</label>
                    <input 
                        type="file"
                        accept="image/*"
                        className="w-full p-3 bg-slate-50 border border-dashed rounded-2xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        onChange={(e) => setLogoFile(e.target.files[0])}
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all disabled:bg-slate-300"
                >
                    {loading ? "Uploading to Drive..." : "Register"}
                </button>
            </form>
        </div>
    );
};

export default ClubSetup;
