import React, { useState, useEffect } from 'react';
import { Search, UserCircle, FileText, Activity, Trophy, X, ShieldCheck } from 'lucide-react';

export default function MyPlayers({ clubId }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [modalTab, setModalTab] = useState('Core Info');

    // 🌟 YOUR CUSTOM IMAGE FETCHER
    const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

    useEffect(() => {
        if (clubId) {
            fetchMyPlayers();
        }
    }, [clubId]);

    const fetchMyPlayers = async () => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/clubs/applications?club_id=${clubId}`);
            if (res.ok) {
                const data = await res.json();
                const approvedPlayers = data.filter(p => p.status === "Registered");
                setPlayers(approvedPlayers);
            }
        } catch (error) {
            console.error("Failed to fetch players:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPlayers = players.filter(player => {
        const query = searchQuery.toLowerCase();
        return (
            player.full_name?.toLowerCase().includes(query) ||
            player.phone?.includes(query) ||
            player.position?.toLowerCase().includes(query)
        );
    });

    const getInitials = (name) => {
        if (!name) return "UK";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    if (loading) {
        return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading roster data...</div>;
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Roster Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Search and manage approved players in your club.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search Name, Phone, Position..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-sm" 
                    />
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold">Player</th>
                            <th className="px-6 py-4 font-bold">Position</th>
                            <th className="px-6 py-4 font-bold">Age</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPlayers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                    {searchQuery ? "No players match your search." : "No registered players found. Players must pass trials and be approved by the admin."}
                                </td>
                            </tr>
                        ) : (
                            filteredPlayers.map(player => (
                                <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        {player.player_photo_url ? (
                                            /* 🌟 APPLIED FUNCTION HERE */
                                            <img src={getDriveImageUrl(player.player_photo_url)} alt={player.full_name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                {getInitials(player.full_name)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-900">{player.full_name}</p>
                                            <p className="text-xs text-slate-500 font-medium">ID: PL-{player.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-700">{player.position}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{player.age} yrs</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1 w-max">
                                            <ShieldCheck className="w-3 h-3" /> Registered
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setSelectedPlayer(player);
                                                setModalTab('Core Info');
                                            }} 
                                            className="text-emerald-600 font-bold hover:text-emerald-800 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Profile Modal */}
            {selectedPlayer && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            
                            <div className="flex items-center gap-6 relative z-10">
                                {selectedPlayer.player_photo_url ? (
                                    /* 🌟 APPLIED FUNCTION HERE */
                                    <img src={getDriveImageUrl(selectedPlayer.player_photo_url)} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-slate-800 shadow-xl" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-bold border-4 border-slate-800 shadow-xl">
                                        {getInitials(selectedPlayer.full_name)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-3xl font-extrabold tracking-tight">{selectedPlayer.full_name}</h2>
                                    <p className="text-emerald-400 font-semibold tracking-wide mt-1 uppercase text-sm">
                                        {selectedPlayer.position} • {selectedPlayer.strong_foot} Foot
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPlayer(null)} className="relative z-10 text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-full transition-colors active:scale-95">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex border-b border-slate-100 bg-slate-50 px-8 pt-4 overflow-x-auto custom-scrollbar">
                            {[{name: 'Core Info', icon: UserCircle}, {name: 'Medical', icon: Activity}, {name: 'Documents', icon: FileText}].map(tab => (
                                <button 
                                    key={tab.name} 
                                    onClick={() => setModalTab(tab.name)} 
                                    className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${modalTab === tab.name ? 'border-emerald-500 text-emerald-700 bg-white rounded-t-xl shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-xl'}`}
                                >
                                    <tab.icon className="w-4 h-4" /> {tab.name}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 overflow-y-auto flex-grow bg-slate-50/50">
                            
                            {modalTab === 'Core Info' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Phone Number</span>
                                            <span className="font-bold text-slate-800 text-lg">{selectedPlayer.phone}</span>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Date of Birth</span>
                                            <span className="font-bold text-slate-800 text-lg">{selectedPlayer.dob}</span>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Location</span>
                                            <span className="font-bold text-slate-800 text-lg">{selectedPlayer.city}, {selectedPlayer.district}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-emerald-600"/> Physical & Technical</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Height</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.height} cm</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Weight</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.weight} kg</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Blood Group</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.blood_group}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Experience</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.experience_years} Years</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 'Medical' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 shadow-sm">
                                        <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> Medical Disclosure</h3>
                                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                                            <div className="bg-white/60 p-4 rounded-xl">
                                                <span className="block font-bold text-rose-600 mb-1">Recent Injury (Last 6 Months)</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.injury_last_6_months}</span>
                                            </div>
                                            <div className="bg-white/60 p-4 rounded-xl">
                                                <span className="block font-bold text-rose-600 mb-1">Pain While Running</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.pain_running}</span>
                                            </div>
                                            <div className="md:col-span-2 bg-white/60 p-4 rounded-xl">
                                                <span className="block font-bold text-rose-600 mb-1">Treatment History</span>
                                                <span className="font-medium text-slate-700 italic">{selectedPlayer.medical_treatment || "None reported"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                        <h3 className="font-bold text-slate-900 mb-4">Emergency Contact</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Name</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.emergency_contact_name}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Phone</span>
                                                <span className="font-bold text-slate-800">{selectedPlayer.emergency_contact_phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 'Documents' && (
                                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
                                        <h3 className="font-bold text-slate-900 mb-4">Government ID</h3>
                                        <div className="flex-1 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden min-h-[200px] border border-slate-200">
                                            {selectedPlayer.gov_id_url ? (
                                                <iframe src={selectedPlayer.gov_id_url} className="w-full h-full min-h-[250px]" title="Gov ID"></iframe>
                                            ) : (
                                                <span className="text-slate-400 font-medium">No document uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
                                        <h3 className="font-bold text-slate-900 mb-4">Fitness Certificate</h3>
                                        <div className="flex-1 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden min-h-[200px] border border-slate-200">
                                            {selectedPlayer.fitness_certificate_url ? (
                                                <iframe src={selectedPlayer.fitness_certificate_url} className="w-full h-full min-h-[250px]" title="Fitness Certificate"></iframe>
                                            ) : (
                                                <span className="text-slate-400 font-medium">No document uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
