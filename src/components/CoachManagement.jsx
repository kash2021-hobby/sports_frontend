import React, { useState, useEffect } from 'react';
import { Plus, UserCog, Phone, X, Award, Trash2, MapPin, Building2 } from 'lucide-react';
import API from '../services/api'; 

// 🌟 Google Drive Image Helper
const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

export default function CoachManagement() {
    const [coaches, setCoaches] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState(null); 
    const [formData, setFormData] = useState({ name: '', phone: '', mpin: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        try {
            const res = await API.get('/admin/coaches');
            setCoaches(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch coaches", err);
            setLoading(false);
        }
    };

    const handleSaveCoach = async () => {
        try {
            await API.post('/admin/coaches', formData);
            alert("Coach saved successfully!");
            setIsCreateModalOpen(false);
            setFormData({ name: '', phone: '', mpin: '' });
            fetchCoaches();
        } catch (err) {
            alert("Error saving coach");
        }
    };

    const handleDeleteCoach = async (id) => {
        if (!window.confirm("Are you sure you want to remove this coach?")) return;
        try {
            await API.delete(`/admin/coaches/${id}`);
            fetchCoaches();
        } catch (err) {
            alert("Error deleting coach");
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Coach Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage academy coaches.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-100"
                >
                    <Plus className="w-5 h-5" /> Add New Coach
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coaches.map(coach => (
                        <div key={coach.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all group relative flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                
                                {/* 🌟 UPDATED: Display Club Logo OR Default Icon */}
                                {coach.Club?.logo_url ? (
                                    <img 
                                        src={getDriveImageUrl(coach.Club.logo_url)} 
                                        alt={coach.Club.name} 
                                        className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-100 bg-slate-50"
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = "https://placehold.co/150x150/0f172a/ffffff?text=Logo"; 
                                        }}
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <Award className="w-6 h-6" />
                                    </div>
                                )}

                                <button 
                                    onClick={() => handleDeleteCoach(coach.id)} 
                                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                    title="Delete Coach"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-extrabold text-slate-900 mb-1 truncate">
                                    {coach.Club ? coach.Club.name : "Independent Coach"}
                                </h3>
                                
                                <p className="text-sm font-bold text-emerald-600 mb-3 uppercase tracking-wider">
                                    {coach.name}
                                </p>

                                <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mb-4">
                                    <Phone className="w-3.5 h-3.5" /> {coach.phone}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 mt-auto">
                                <button 
                                    onClick={() => setSelectedCoach(coach)}
                                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors border border-slate-200 shadow-sm"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 🌟 COACH DETAILS MODAL 🌟 */}
            {selectedCoach && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-extrabold text-slate-900">Coach Profile</h2>
                            <button onClick={() => setSelectedCoach(null)} className="text-slate-400 hover:text-rose-500 p-2 bg-white rounded-full shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-8">
                                
                                {/* 🌟 UPDATED: Display Club Logo in Modal */}
                                {selectedCoach.Club?.logo_url ? (
                                    <img 
                                        src={getDriveImageUrl(selectedCoach.Club.logo_url)} 
                                        alt={selectedCoach.Club.name} 
                                        className="w-20 h-20 rounded-2xl object-cover shadow-md border border-slate-100 bg-white"
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = "https://placehold.co/150x150/0f172a/ffffff?text=Logo"; 
                                        }}
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                                        <Award className="w-10 h-10" />
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedCoach.name}</h3>
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold mt-1">
                                        <Building2 className="w-4 h-4" />
                                        <span>{selectedCoach.Club?.name || "No Club Assigned"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><Phone className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Contact Number</p>
                                        <p className="font-bold text-slate-900">{selectedCoach.phone}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><MapPin className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Club Location</p>
                                        <p className="font-bold text-slate-900">{selectedCoach.Club?.city || "Not Available"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedCoach(null)} 
                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-95"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE COACH MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2"><UserCog className="w-5 h-5 text-emerald-600" /> Create Coach</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-rose-500 bg-slate-50 p-2 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    placeholder="e.g. Pep Guardiola" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    placeholder="+91" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Assign Login MPIN</label>
                                <input 
                                    type="password" 
                                    maxLength="4" 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-center tracking-[0.5em] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    placeholder="••••" 
                                    value={formData.mpin}
                                    onChange={(e) => setFormData({...formData, mpin: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex gap-3">
                            <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-100">Cancel</button>
                            <button onClick={handleSaveCoach} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all">Save Coach</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
