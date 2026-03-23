import React, { useState, useEffect } from 'react';
import { Search, UserCircle, FileText, Activity, Trophy, X, Phone, Calendar, Ruler, Building2 } from 'lucide-react';
import API from '../services/api';

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewPlayer, setViewPlayer] = useState(null);
    const [modalTab, setModalTab] = useState('Core Info');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchPlayers(); }, []);

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

    /* ===============================
        DRIVE IMAGE HELPER
    ================================ */
     const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

    /* ===============================
        🌟 OMNI-SEARCH FILTER LOGIC 🌟
    ================================ */
    const filteredPlayers = players.filter(p => {
        // First, ensure they are registered
        if (p.status !== "Registered") return false;

        // If search is empty, show everyone
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();

        // Check against multiple fields
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
                        // 🌟 Updated Placeholder
                        placeholder="Search by name, club, phone, email, or position..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* DESKTOP TABLE / MOBILE CARDS */}
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
                                        <img
                                            src={getDriveImageUrl(player.player_photo_url)}
                                            className="w-full h-full object-cover"
                                            alt={player.full_name}
                                        />
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
                    <div
                        key={player.id}
                        onClick={() => setViewPlayer(player)}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"
                    >
                        <img
                            src={getDriveImageUrl(player.player_photo_url)}
                            className="w-14 h-14 rounded-xl object-cover"
                            alt=""
                        />
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

            {/* FULL SCREEN MOBILE MODAL */}
            {viewPlayer && (
                <div className="fixed inset-0 z-[100] bg-white md:bg-slate-900/60 md:backdrop-blur-sm flex items-center justify-center">
                    <div className="w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-3xl bg-white flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <img
                                    src={getDriveImageUrl(viewPlayer.player_photo_url)}
                                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-emerald-500 object-cover"
                                    alt=""
                                />
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black">{viewPlayer.full_name}</h2>
                                    <p className="text-emerald-400 text-xs font-bold uppercase">{viewPlayer.position} • {viewPlayer.Club?.name || 'Independent'}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewPlayer(null)} className="p-2 bg-slate-800 hover:bg-rose-500 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto shrink-0 px-4">
                            {['Core Info', 'Documents'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setModalTab(tab)}
                                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${modalTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
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
                                    {/* 🌟 UPDATED: Render all 4 documents properly */}
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