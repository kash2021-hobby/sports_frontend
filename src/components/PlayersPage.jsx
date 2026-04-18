import React, { useState, useEffect } from 'react';
import { Search, UserCircle, FileText, Activity, Trophy, X, Phone, Calendar, Ruler, Building2, ArrowRightLeft, Upload, Printer } from 'lucide-react';
import API from '../services/api';

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewPlayer, setViewPlayer] = useState(null);
    const [modalTab, setModalTab] = useState('Core Info');
    const [searchQuery, setSearchQuery] = useState('');

    // TRANSFER LOGIC
    const [clubs, setClubs] = useState([]);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferData, setTransferData] = useState({ newClubId: '', nocFile: null });
    const [transferring, setTransferring] = useState(false);

    useEffect(() => { 
        fetchPlayers(); 
        fetchClubs(); 
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

    const fetchClubs = async () => {
        try {
            const res = await API.get('/clubs'); 
            setClubs(res.data);
        } catch (err) {
            console.error("Error fetching clubs:", err);
        }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        if (!transferData.newClubId || !transferData.nocFile) {
            alert("Please select a new club and upload the NOC document.");
            return;
        }

        setTransferring(true);
        try {
            const formData = new FormData();
            formData.append('player_id', viewPlayer.id);
            formData.append('new_club_id', transferData.newClubId);
            formData.append('noc_document', transferData.nocFile);

            await API.post('/admin/transfer-player', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Player transferred successfully!");
            setIsTransferModalOpen(false);
            setViewPlayer(null); 
            fetchPlayers(); 
            setTransferData({ newClubId: '', nocFile: null }); 
        } catch (err) {
            console.error("Transfer failed", err);
            alert("Error transferring player. Please try again.");
        } finally {
            setTransferring(false);
        }
    };

  const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

    // 🌟 REWRITTEN: HORIZONTAL SINGLE-SIDED ID CARD (WITH FIXED COMPLETE LOGO)
    const generateIdCard = () => {
        if (!viewPlayer) return;

        const photoUrl = getDriveImageUrl(viewPlayer.player_photo_url);
        const clubName = viewPlayer.Club?.name || 'Independent';
        const formattedDob = viewPlayer.dob ? new Date(viewPlayer.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : "N/A";
        const bloodGroup = viewPlayer.blood_group || 'N/A';
        const phone = viewPlayer.phone || 'N/A';

        const printWindow = window.open('', '', 'width=1000,height=700');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Player Pass - ${viewPlayer.full_name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&family=Oswald:wght@900&display=swap');
                        
                        @page {
                            size: landscape;
                            margin: 0;
                        }

                        body { 
                            font-family: 'Roboto', sans-serif; 
                            margin: 0; 
                            padding: 40px; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center;
                            background-color: #f8fafc;
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        /* Horizontal ID Card Container */
                        .id-card {
                            width: 850px;
                            height: 530px;
                            background: white;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            border: 2px solid #000;
                            box-sizing: border-box;
                        }

                        /* Top Header */
                        .header {
                            background: #dc2626; /* Deep Red */
                            color: #fde047; /* Yellow Text */
                            display: flex;
                            align-items: center;
                            padding: 15px 30px;
                            border-bottom: 3px solid #000;
                        }

                        /* 🌟 FIXED LOGO STYLES (NO NESTED CLIPPING) */
                        .logo-circle {
                            width: 100px;
                            height: 100px;
                            background: #fff;
                            border-radius: 50%;
                            border: 2px solid #000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-shrink: 0;
                            margin-right: 25px;
                            overflow: hidden; /* NEATLY MASKS THE CORNERS OF THE RECTANGULAR IMAGE FILE */
                            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                        }
                        
                        .logo-circle img {
                            width: 80%; /* 🌟 Gives more breathing room so edges don't cut off */
                            height: 80%;
                            object-fit: contain; 
                            /* border-radius: 50%; /* 🌟 REMOVE THIS as it clips the circular design near its perimeter text */
                        }

                        .header-text {
                            flex-grow: 1;
                            text-align: center;
                        }

                        .header-text h1 {
                            font-family: 'Oswald', sans-serif;
                            margin: 0;
                            font-size: 42px;
                            font-weight: 900;
                            letter-spacing: 1px;
                            text-shadow: 2px 2px 0 #000;
                        }

                        .header-text h2 {
                            margin: 0;
                            font-size: 18px;
                            color: #fff;
                            letter-spacing: 3px;
                        }

                        /* Player Pass Banner */
                        .pass-banner {
                            background: linear-gradient(to right, #047857, #10b981); /* Green Gradient */
                            color: white;
                            text-align: center;
                            padding: 8px;
                            font-size: 46px;
                            font-family: 'Oswald', sans-serif;
                            font-weight: 900;
                            letter-spacing: 6px;
                            border-bottom: 3px solid #000;
                            text-shadow: 2px 2px 0 #000;
                        }

                        /* Main Content Area */
                        .main-content {
                            display: flex;
                            padding: 20px 30px;
                            flex-grow: 1;
                            background: #fff;
                            position: relative;
                        }

                        /* Photo Section */
                        .photo-section {
                            width: 220px;
                            height: 260px;
                            border: 4px solid #000;
                            background: #f1f5f9;
                            flex-shrink: 0;
                            box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
                        }

                        .photo-section img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }

                        /* Details Section */
                        .details-section {
                            margin-left: 40px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            flex-grow: 1;
                        }

                        .detail-row {
                            display: flex;
                            margin-bottom: 12px;
                            align-items: flex-end;
                        }

                        .detail-label {
                            font-size: 26px;
                            font-weight: 700;
                            color: #000;
                            width: 160px;
                            flex-shrink: 0;
                        }

                        .detail-value {
                            font-size: 32px;
                            font-weight: 900;
                            color: #000;
                            text-transform: uppercase;
                            border-bottom: 2px dashed #94a3b8;
                            flex-grow: 1;
                            padding-left: 10px;
                            line-height: 1.1;
                        }

                        /* Footer Area */
                        .footer {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            padding: 0 30px 15px 30px;
                            margin-top: -10px;
                        }

                        .validity {
                            background: #be123c;
                            color: white;
                            padding: 8px 20px;
                            font-size: 20px;
                            font-weight: 900;
                            border-radius: 8px;
                            border: 2px solid #000;
                        }

                        .signature-area {
                            text-align: center;
                            margin-right: 20px;
                        }

                        .signature-line {
                            width: 200px;
                            border-bottom: 2px solid #000;
                            margin-bottom: 5px;
                            height: 40px;
                        }

                        .signature-text {
                            font-size: 14px;
                            font-weight: 700;
                            color: #000;
                        }

                        @media print {
                            body { background-color: white; padding: 0; }
                            .id-card { box-shadow: none; break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    
                    <div class="id-card">
                        
                        <div class="header">
                            <div class="logo-circle">
                                <img src="https://hub.dhsa.co.in/assets/dhsa_logo-C7UT0L8w.jpeg" alt="DHSA Logo" />
                            </div>
                            <div class="header-text">
                                <h1>DIMA HASAO SPORTS ASSOCIATION</h1>
                                <h2>OFFICIAL REGISTRATION PORTAL</h2>
                            </div>
                        </div>

                        <div class="pass-banner">
                            PLAYER ID
                        </div>
                        
                        <div class="main-content">
                            <div class="photo-section">
                                <img src="${photoUrl}" onerror="this.src='https://placehold.co/220x260?text=No+Photo'" />
                            </div>
                            
                            <div class="details-section">
                                <div class="detail-row">
                                    <div class="detail-label">Name :</div>
                                    <div class="detail-value">${viewPlayer.full_name}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Club :</div>
                                    <div class="detail-value">${clubName}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">D.O.B :</div>
                                    <div class="detail-value">${formattedDob}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Phone :</div>
                                    <div class="detail-value" style="font-size: 26px;">${phone}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Blood :</div>
                                    <div class="detail-value" style="font-size: 26px;">${bloodGroup}</div>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <div class="validity">
                                VALID FOR CURRENT SEASON
                            </div>
                            <div class="signature-area">
                                <div class="signature-line"></div>
                                <div class="signature-text">Organizing Secretary</div>
                            </div>
                        </div>

                    </div>

                </body>
            </html>
        `);

        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };

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

            {/* FULL SCREEN MODAL (PLAYER PROFILE) */}
            {viewPlayer && (
                <div className="fixed inset-0 z-[100] bg-white md:bg-slate-900/60 md:backdrop-blur-sm flex items-center justify-center">
                    <div className="w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-3xl bg-white flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        
                        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
                            <div className="flex items-center gap-4">
                                <img src={getDriveImageUrl(viewPlayer.player_photo_url)} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-emerald-500 object-cover" alt="" />
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black">{viewPlayer.full_name}</h2>
                                    <p className="text-emerald-400 text-xs font-bold uppercase">{viewPlayer.position} • {viewPlayer.Club?.name || 'Independent'}</p>
                                </div>
                            </div>
                            
                            {/* ACTION BUTTONS */}
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={generateIdCard}
                                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors shadow-md"
                                >
                                    <Printer size={16} /> Generate ID
                                </button>
                                <button 
                                    onClick={() => setIsTransferModalOpen(true)}
                                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors shadow-md"
                                >
                                    <ArrowRightLeft size={16} /> Transfer
                                </button>
                                <button onClick={() => setViewPlayer(null)} className="hidden sm:block p-2 bg-slate-800 hover:bg-rose-500 rounded-full transition-colors ml-2"><X className="w-5 h-5" /></button>
                            </div>
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
                        
                        <div className="sm:hidden p-4 border-t border-slate-100 bg-white">
                             <button onClick={() => setViewPlayer(null)} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Close Profile</button>
                        </div>
                    </div>
                </div>
            )}

            {/* TRANSFER POPUP MODAL */}
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
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Club</label>
                                <div className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl text-slate-600 font-bold flex items-center gap-2 cursor-not-allowed">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    {viewPlayer.Club?.name || 'Independent'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-600 uppercase mb-1.5">Select New Club *</label>
                                <select 
                                    required
                                    value={transferData.newClubId}
                                    onChange={(e) => setTransferData({...transferData, newClubId: e.target.value})}
                                    className="w-full bg-white border border-emerald-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 shadow-sm"
                                >
                                    <option value="" disabled>-- Choose Destination Club --</option>
                                    {clubs
                                        .filter(club => club.id !== viewPlayer.club_applied) 
                                        .map(club => (
                                            <option key={club.id} value={club.id}>{club.name}</option>
                                    ))}
                                </select>
                            </div>

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
