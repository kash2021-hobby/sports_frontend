import React, { useState, useEffect } from 'react';
import { UserCircle, Shield, Key, MapPin, Phone, Trophy } from 'lucide-react';

export default function CoachProfile() {
    const [activeTab, setActiveTab] = useState('About');
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    // MPIN Update States
    const [currentMpin, setCurrentMpin] = useState('');
    const [newMpin, setNewMpin] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!currentUser.id) return;

            try {
                // Fetch all coaches (managers) to grab the one with connected Club data
                const res = await fetch("https://backend.dhsa.co.in/admin/coaches");
                if (res.ok) {
                    const data = await res.json();
                    const myProfile = data.find(coach => coach.id === currentUser.id);
                    setProfileData(myProfile);
                }
            } catch (error) {
                console.error("Failed to fetch manager profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleUpdateMpin = async () => {
        if (!currentMpin || !newMpin) {
            return alert("Please fill in both MPIN fields.");
        }
        
        // Verify current MPIN matches the database
        if (currentMpin !== profileData.mpin) {
            return alert("The current MPIN you entered is incorrect.");
        }

        setIsUpdating(true);
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/coaches/${profileData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mpin: newMpin })
            });

            if (res.ok) {
                alert("Security PIN updated successfully!");
                setCurrentMpin('');
                setNewMpin('');
                // Update local state so they don't have to refresh
                setProfileData({ ...profileData, mpin: newMpin });
            } else {
                alert("Failed to update MPIN.");
            }
        } catch (error) {
            console.error(error);
            alert("Server error while updating MPIN.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-emerald-500"></div>
            </div>
        );
    }

    if (!profileData) {
        return <div className="p-8 text-slate-500">Error loading profile data.</div>;
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6 max-w-4xl">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                
                {/* PROFILE HEADER */}
                <div className="bg-slate-900 p-8 text-white flex items-center gap-6 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -right-10 -top-10 opacity-10 transform rotate-12">
                        <Shield className="w-64 h-64 text-emerald-500" />
                    </div>

                    <div className="w-24 h-24 bg-emerald-500 rounded-full border-4 border-slate-800 flex items-center justify-center text-4xl font-black shadow-lg relative z-10 uppercase">
                        {profileData.name ? profileData.name.charAt(0) : 'M'}
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold tracking-tight">{profileData.name}</h1>
                        <p className="text-emerald-400 font-bold mt-1 tracking-widest uppercase text-sm">Club Manager</p>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-2">
                    {['About', 'Security & Credentials'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === tab ? 'border-emerald-500 text-emerald-700 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="p-8">
                    
                    {activeTab === 'About' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            
                            {/* Personal Details */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-emerald-600"/> Manager Details
                                </h3>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Phone</p>
                                    <p className="font-bold text-slate-900 mt-0.5">{profileData.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Role</p>
                                    <p className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md inline-block mt-1 shadow-sm">Club Manager</p>
                                </div>
                            </div>

                            {/* Club Details */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-blue-600"/> Club Affiliation
                                </h3>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Club</p>
                                    <p className="font-black text-lg text-slate-900 mt-0.5 text-blue-900">
                                        {profileData.Club ? profileData.Club.name : "Independent / No Club Assigned"}
                                    </p>
                                </div>
                                {profileData.Club && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-2"><MapPin className="w-3.5 h-3.5"/> Location</p>
                                        <p className="font-bold text-slate-700 mt-0.5">{profileData.Club.city}</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {activeTab === 'Security & Credentials' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                            <div>
                                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-2 text-xl">
                                    <Key className="w-5 h-5 text-emerald-600" /> Update MPIN
                                </h3>
                                <p className="text-sm text-slate-500 font-medium mb-6">Change your 5-digit security pin used for login.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Current MPIN</label>
                                    <input 
                                        type="password" 
                                        maxLength="5"
                                        placeholder="•••••" 
                                        value={currentMpin}
                                        onChange={(e) => setCurrentMpin(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none tracking-[0.5em] font-black text-lg text-center shadow-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">New MPIN</label>
                                    <input 
                                        type="password" 
                                        maxLength="5"
                                        placeholder="•••••" 
                                        value={newMpin}
                                        onChange={(e) => setNewMpin(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none tracking-[0.5em] font-black text-lg text-center shadow-sm" 
                                    />
                                </div>
                                <button 
                                    onClick={handleUpdateMpin}
                                    disabled={isUpdating}
                                    className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-70 mt-2"
                                >
                                    {isUpdating ? "Updating..." : "Update Security PIN"}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
