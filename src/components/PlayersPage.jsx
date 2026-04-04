import React, { useState, useEffect } from 'react';
import { Search, UserCircle, FileText, Activity, Trophy, X, Phone, Calendar, Ruler, Building2, ArrowRightLeft, Upload } from 'lucide-react';
import API from '../services/api';

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewPlayer, setViewPlayer] = useState(null);
    const [modalTab, setModalTab] = useState('Core Info');
    const [searchQuery, setSearchQuery] = useState('');

    // 🌟 1. NEW STATE FOR TRANSFER LOGIC
    const [clubs, setClubs] = useState([]);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferData, setTransferData] = useState({ newClubId: '', nocFile: null });
    const [transferring, setTransferring] = useState(false);

    useEffect(() => { 
        fetchPlayers(); 
        fetchClubs(); // 🌟 Fetch clubs when page loads
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await API.get('/admin/players');
            setPlayers(res.data);
        } catch (err) {
            console.error("Error fetching players:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 2. FETCH CLUBS FOR DROPDOWN
    const fetchClubs = async () => {
        try {
            const res = await API.get('/admin/clubs'); // Adjust this endpoint if needed
            setClubs(res.data);
        } catch (err) {
            console.error("Error fetching clubs:", err);
        }
    };

    // 🌟 3. HANDLE TRANSFER SUBMIT
    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        if (!transferData.newClubId || !transferData.nocFile) {
            alert("Please select a new club and upload the NOC document.");
            return;
        }

        setTransferring(true);
        try {
            // Using FormData because we are uploading a file (NOC photo)
            const formData = new FormData();
            formData.append('player_id', viewPlayer.id);
            formData.append('new_club_id', transferData.newClubId);
            formData.append('noc_document', transferData.nocFile);

            // Send to backend (Adjust endpoint to match your server logic)
            await API.post('/admin/transfer-player', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Player transferred successfully!");
            setIsTransferModalOpen(false);
            setViewPlayer(null); // Close profile modal to refresh view
            fetchPlayers(); // Refresh player list
            setTransferData({ newClubId: '', nocFile: null }); // Reset form
        } catch (err) {
            console.error("Transfer failed", err);
            alert("Error transferring player. Please try again.");
        } finally {
            setTransferring(false);
        }
    };

    /* ===============================
        DRIVE IMAGE HELPER (Fixed the missing $ sign!)
    ================================ */
    const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };
    /* ===============================
        OMNI-SEARCH FILTER LOGIC 
    ================================ */
    const filteredPlayers = players.filter(p => {
        if (p.status !== "Registered") return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.full_name?.toLowerCase().includes(query) ||
            p.Club?.name?.toLowerCase().includes(query) ||
            p.phone?.toLowerCase().includes(query) ||
            p.position?.toLowerCase().includes(query) ||
            p.email?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="animate-in fade-in duration-500 space-y-4 md:space-y-6 pb-20 md:pb-0">
            <header className="flex flex-col gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Players Directory</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">Manage all registered athletes.</p>
                </div>
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, club, phone, email, or position..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Player</th>
                            <th className="px-6 py-4">Position</th>
                            <th className="px-6 py-4">Club</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPlayers.map(player => (
                            <tr key={player.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setViewPlayer(player)}>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                        <img src={getDriveImageUrl(player.player_photo_url)} className="w-full h-full object-cover" alt={player.full_name} />
                                    </div>
                                    <span className="font-bold text-slate-900">{player.full_name}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">{player.position}</td>
                                <td className="px-6 py-4 font-semibold text-emerald-600">{player.Club?.name || 'Independent'}</td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-600">View</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MOBILE LIST VIEW */}
            <div className="md:hidden space-y-3">
                {filteredPlayers.map(player => (
                    <div key={player.id} onClick={() => setViewPlayer(player)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform">
                        <img src={getDriveImageUrl(player.player_photo_url)} className="w-14 h-14 rounded-xl object-cover" alt="" />
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{player.full_name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black bg-slate-100 px-1.5 py-0.5 rounded uppercase">{player.position}</span>
                                <span className="text-xs font-bold text-emerald-600">{player.Club?.name || 'Independent'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FULL SCREEN MOBILE MODAL (PLAYER PROFILE) */}
            {viewPlayer && (
                <div className="fixed inset-0 z-[100] bg-white md:bg-slate-900/60 md:backdrop-blur-sm flex items-center justify-center">
                    <div className="w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-3xl bg-white flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <img src={getDriveImageUrl(viewPlayer.player_photo_url)} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-emerald-500 object-cover" alt="" />
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black">{viewPlayer.full_name}</h2>
                                    <p className="text-emerald-400 text-xs font-bold uppercase">{viewPlayer.position} • {viewPlayer.Club?.name || 'Independent'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* 🌟 4. TRANSFER BUTTON */}
                                <button 
                                    onClick={() => setIsTransferModalOpen(true)}
                                    className="hidden md:flex bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold items-center gap-2 transition-colors"
                                >
                                    <ArrowRightLeft size={16} /> Transfer Player
                                </button>
                                <button onClick={() => setViewPlayer(null)} className="p-2 bg-slate-800 hover:bg-rose-500 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Mobile Transfer Button (Shows below header on small screens) */}
                        <div className="md:hidden bg-slate-800 p-3 flex justify-center border-t border-slate-700">
                            <button 
                                onClick={() => setIsTransferModalOpen(true)}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors"
                            >
                                <ArrowRightLeft size={18} /> Transfer Player to New Club
                            </button>
                        </div>

                        <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto shrink-0 px-4">
                            {['Core Info', 'Documents'].map(tab => (
                                <button key={tab} onClick={() => setModalTab(tab)} className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${modalTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                            {modalTab === 'Core Info' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoItem label="Phone" value={viewPlayer.phone} icon={<Phone size={16} />} />
                                    <InfoItem label="Email" value={viewPlayer.email} icon={<FileText size={16} />} />
                                    <InfoItem label="Club" value={viewPlayer.Club?.name} icon={<Building2 size={16} />} />
                                    <InfoItem label="Strong Foot" value={viewPlayer.strong_foot} icon={<Trophy size={16} />} />
                                    <InfoItem label="Height" value={`${viewPlayer.height}cm`} icon={<Ruler size={16} />} />
                                    <InfoItem label="Weight" value={`${viewPlayer.weight}kg`} icon={<Activity size={16} />} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DocItem label="Gov Document 1" url={viewPlayer.gov_doc_1_url} />
                                    <DocItem label="Gov Document 2" url={viewPlayer.gov_doc_2_url} />
                                    <DocItem label="Gov Document 3" url={viewPlayer.gov_doc_3_url} />
                                    <DocItem label="Fitness Certificate" url={viewPlayer.fitness_certificate_url} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 5. TRANSFER POPUP MODAL */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <ArrowRightLeft className="w-5 h-5 text-emerald-600" /> Transfer Request
                            </h2>
                            <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-rose-500 bg-white p-1.5 rounded-full shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleTransferSubmit} className="p-6 space-y-5">
                            {/* Present Club (Read Only) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Club</label>
                                <div className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl text-slate-600 font-bold flex items-center gap-2 cursor-not-allowed">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    {viewPlayer.Club?.name || 'Independent'}
                                </div>
                            </div>

                            {/* New Club Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-600 uppercase mb-1.5">Select New Club *</label>
                                <select 
                                    required
                                    value={transferData.newClubId}
                                    onChange={(e) => setTransferData({...transferData, newClubId: e.target.value})}
                                    className="w-full bg-white border border-emerald-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 shadow-sm"
                                >
                                    <option value="" disabled>-- Choose Destination Club --</option>
                                    {clubs.map(club => (
                                        <option key={club.id} value={club.id}>{club.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* NOC Document Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Upload NOC Document *</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-emerald-500 mb-2" />
                                        <p className="text-sm font-semibold text-slate-700">
                                            {transferData.nocFile ? transferData.nocFile.name : "Click to upload NOC photo/PDF"}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        required 
                                        accept="image/*,.pdf"
                                        onChange={(e) => setTransferData({...transferData, nocFile: e.target.files[0]})}
                                    />
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-3">
                                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={transferring} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50">
                                    {transferring ? 'Processing...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const InfoItem = ({ label, value, icon }) => (
    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 shrink-0">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="font-bold text-slate-900 truncate">{value || 'N/A'}</p>
        </div>
    </div>
);

const DocItem = ({ label, url }) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
        <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <FileText size={14} className="text-emerald-500" /> {label}
        </p>
        {url ? (
            <iframe src={url} className="w-full h-48 rounded-xl bg-white border border-slate-200" title={label} />
        ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <X size={24} className="text-slate-300 mb-2" />
                <span className="italic text-xs font-bold">No Document Uploaded</span>
            </div>
        )}
    </div>
);
