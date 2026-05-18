import React, { useState, useEffect } from "react";
import API, { adminAPI } from "../services/api";
import { 
    LayoutDashboard, Users, UserPlus, FileText, 
    UserCog, Shield, Trophy, Flag, Bell, 
    Menu, X, Search, ChevronRight, LogOut,
    History, ArrowRight, Calendar, 
    ExternalLink, CheckCircle, Maximize2, Settings // 🌟 ADDED SETTINGS ICON
} from "lucide-react";
import UsersPage from '../components/UsersPage';
import CoachManagement from '../components/CoachManagement';
import PlayersPage from '../components/PlayersPage';
import NotificationsPage from '../components/NotificationsPage';
import TeamsPage from '../components/TeamsPage';
import TournamentsPage from '../components/TournamentsPage';
import RefereePage from '../components/RefereePage';
//new2
/* =========================================================================
   GOOGLE DRIVE HELPER
========================================================================= */
const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

/* =========================================================================
   1. EXISTING APPLICATIONS MODULE
========================================================================= */
const ApplicationsView = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewPlayer, setViewPlayer] = useState(null);
    const [actionStatus, setActionStatus] = useState("");
    
    const [aadhaarVerified, setAadhaarVerified] = useState(false);
    const [aadhaarScreenshot, setAadhaarScreenshot] = useState(null);
    
    // Search Query State
    const [searchQuery, setSearchQuery] = useState("");

    // Full-screen document state
    const [fullscreenDoc, setFullscreenDoc] = useState(null);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await adminAPI.getPendingPlayers();
            setPlayers(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleCloseModal = () => {
        setViewPlayer(null);
        setActionStatus("");
        setAadhaarVerified(false);
        setAadhaarScreenshot(null);
    };

    const handleUpdateStatus = async (id) => {
        if (!actionStatus) {
            alert("Please select an action from the dropdown first.");
            return;
        }

        if (actionStatus === "Registered" && (!aadhaarVerified || !aadhaarScreenshot)) {
            alert("To approve a player, you MUST check the Aadhaar verification box and upload the screenshot.");
            return;
        }

        if (!window.confirm(`Are you sure you want to mark this player as ${actionStatus}?`)) return;

        try {
            const formData = new FormData();
            formData.append("player_id", id);
            formData.append("status", actionStatus);
            if (aadhaarScreenshot) {
                formData.append("aadhaar_screenshot", aadhaarScreenshot);
            }

            const response = await fetch("https://backend.dhsa.co.in/admin/update-status", {
                method: "POST",
                body: formData 
            });

            if (response.ok) {
                setPlayers(players.filter(p => p.id !== id));
                handleCloseModal();
                alert(`Player successfully marked as: ${actionStatus}`);
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error(err);
            alert("Status update failed");
        }
    };

    const filteredPlayers = players.filter(player => 
        player.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.aadhaar_number?.includes(searchQuery)
    );

    if (loading) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading pending applications...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header with Search Bar */}
            <header className="mb-8 flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Applications Review</h1>
                        <p className="text-slate-500 mt-1">Review and approve pending player applications.</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold border border-emerald-100 flex items-center gap-2 shrink-0">
                        <span>Pending Applications:</span>
                        <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">{players.length}</span>
                    </div>
                </div>

                <div className="relative w-full mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search applicants by name or Aadhaar number..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white text-sm font-medium transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {filteredPlayers.length === 0 ? (
                <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-slate-500">
                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-lg font-medium">
                        {players.length > 0 ? "No applicants found matching your search." : "No pending players to review at this time."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlayers.map(player => (
                        <div key={player.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden">
                            <div className="p-6 flex items-start gap-4 flex-grow">
                                <img src={getDriveImageUrl(player.player_photo_url)} alt={player.full_name} className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-slate-50" onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }} />
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1">{player.full_name}</h3>
                                    <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{player.position}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button onClick={() => setViewPlayer(player)} className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 font-semibold py-2.5 rounded-xl transition-colors duration-200">
                                    Review Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FULLSCREEN DOCUMENT MODAL */}
            {fullscreenDoc && (
                <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 animate-in zoom-in-95 duration-200">
                    <div className="w-full max-w-6xl flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg md:text-xl truncate pr-4">{fullscreenDoc.label}</h3>
                        <button 
                            onClick={() => setFullscreenDoc(null)} 
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors flex shrink-0"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="w-full max-w-6xl flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
                        <iframe src={fullscreenDoc.url} className="w-full h-full border-0" title={fullscreenDoc.label}></iframe>
                    </div>
                </div>
            )}

            {viewPlayer && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <h2 className="text-2xl font-bold text-slate-900">Player Application Profile</h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-2 rounded-full shadow-sm"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            
                            {/* CLUB & PLAYER HEADER */}
                            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-8 items-start">
                                {/* Player Info */}
                                <div className="flex items-center gap-6">
                                    <img src={getDriveImageUrl(viewPlayer.player_photo_url)} alt={viewPlayer.full_name} className="w-28 h-28 md:w-40 md:h-40 rounded-2xl object-cover shadow-md border-4 border-slate-50 shrink-0" onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }} />
                                    <div className="flex flex-col justify-center">
                                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">{viewPlayer.full_name}</h2>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">{viewPlayer.position}</span>
                                            <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">{viewPlayer.age} Years Old</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Club Submitted By Info */}
                                <div className="lg:ml-auto bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm w-full lg:w-auto shrink-0">
                                    <div className="w-14 h-14 bg-white rounded-full border-2 border-blue-200 overflow-hidden shadow-sm flex items-center justify-center shrink-0 p-1">
                                        {viewPlayer.Club?.logo_url ? (
                                            <img src={getDriveImageUrl(viewPlayer.Club.logo_url)} className="w-full h-full object-contain rounded-full" alt="Club Logo" />
                                        ) : (
                                            <Shield className="w-6 h-6 text-blue-300" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Submitted By</p>
                                        <p className="font-extrabold text-slate-900 text-lg">{viewPlayer.Club?.name || "Independent Player"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Personal & Contact</h3>
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm border border-slate-100">
                                            <p className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 uppercase font-bold text-xs">Aadhaar No.</span> <span className="font-black text-emerald-700 tracking-widest">{viewPlayer.aadhaar_number || "N/A"}</span></p>
                                            
                                            <p className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-slate-500 uppercase font-bold text-xs">DOB</span> 
                                                <span className="font-semibold text-slate-900">
                                                    {viewPlayer.dob ? new Date(viewPlayer.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : "N/A"}
                                                </span>
                                            </p>
                                            
                                            <p className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 uppercase font-bold text-xs">Location</span> <span className="font-semibold text-slate-900">{viewPlayer.city}, {viewPlayer.district}</span></p>
                                            <p className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 uppercase font-bold text-xs">Email</span> <span className="font-semibold text-slate-900">{viewPlayer.email}</span></p>
                                            <p className="flex justify-between"><span className="text-slate-500 uppercase font-bold text-xs">Phone</span> <span className="font-semibold text-slate-900">{viewPlayer.phone}</span></p>
                                        </div>
                                    </section>
                                    
                                    <section>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Documents</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            
                                            {/* Helper function to render documents beautifully with Expand button */}
                                            {[
                                                { label: "Gov Document 1", url: viewPlayer.gov_doc_1_url },
                                                { label: "Gov Document 2", url: viewPlayer.gov_doc_2_url },
                                                { label: "Gov Document 3", url: viewPlayer.gov_doc_3_url },
                                                { label: "Fitness Certificate", url: viewPlayer.fitness_certificate_url },
                                            ].map((doc, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <p className="font-semibold text-slate-700">{doc.label}</p>
                                                        {doc.url && (
                                                            <button 
                                                                onClick={() => setFullscreenDoc({ label: doc.label, url: getDriveImageUrl(doc.url) })}
                                                                className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors"
                                                                title="View Fullscreen"
                                                            >
                                                                <Maximize2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {doc.url ? (
                                                        <div className="relative group flex-grow h-72 border border-slate-100 rounded-lg overflow-hidden bg-slate-50">
                                                            <iframe src={getDriveImageUrl(doc.url)} className="w-full h-full border-0" title={doc.label}></iframe>
                                                            {/* Overlay to prevent accidental clicks inside iframe while scrolling */}
                                                            <div className="absolute inset-0 z-10 hidden md:block" onClick={() => setFullscreenDoc({ label: doc.label, url: getDriveImageUrl(doc.url) })}></div>
                                                        </div>
                                                    ) : (
                                                        <img src="https://placehold.co/600x400?text=No+Document" className="w-full h-72 object-contain border border-slate-100 rounded-lg bg-slate-50" alt="No Doc" />
                                                    )}
                                                </div>
                                            ))}

                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Physical & Playing Profile</h3>
                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100 mb-4">
                                            <p><span className="text-slate-500 block text-xs uppercase font-bold">Height</span> <span className="font-medium text-slate-900">{viewPlayer.height} cm</span></p>
                                            <p><span className="text-slate-500 block text-xs uppercase font-bold">Weight</span> <span className="font-medium text-slate-900">{viewPlayer.weight} kg</span></p>
                                            <p><span className="text-slate-500 block text-xs uppercase font-bold">Strong Foot</span> <span className="font-medium text-slate-900">{viewPlayer.strong_foot}</span></p>
                                            <p><span className="text-slate-500 block text-xs uppercase font-bold">Experience</span> <span className="font-medium text-slate-900">{viewPlayer.experience_years} Years</span></p>
                                        </div>
                                    </section>

                                    {viewPlayer.Trials?.length > 0 && (
                                        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-xl font-bold text-emerald-900">Trial Evaluation</h3>
                                                    <p className="text-xs font-semibold text-emerald-700 mt-1">Submitted by Club Secretary</p>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${viewPlayer.Trials[0].recommendation ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}`}>
                                                    {viewPlayer.Trials[0].recommendation ? "Recommended" : "Not Recommended"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm mb-6 pb-6 border-b border-emerald-200/50">
                                                <div>
                                                    <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Pace</span>
                                                    <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{ width: `${(viewPlayer.Trials[0].pace / 10) * 100}%` }}></div></div>
                                                    <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].pace}/10</span>
                                                </div>
                                                <div>
                                                    <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Passing</span>
                                                    <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{ width: `${(viewPlayer.Trials[0].passing / 10) * 100}%` }}></div></div>
                                                    <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].passing}/10</span>
                                                </div>
                                                <div>
                                                    <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Shooting</span>
                                                    <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{ width: `${(viewPlayer.Trials[0].shooting / 10) * 100}%` }}></div></div>
                                                    <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].shooting}/10</span>
                                                </div>
                                                <div>
                                                    <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Stamina</span>
                                                    <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{ width: `${(viewPlayer.Trials[0].stamina / 10) * 100}%` }}></div></div>
                                                    <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].stamina}/10</span>
                                                </div>
                                            </div>

                                            {viewPlayer.Trials[0].checklist_answers && Object.keys(viewPlayer.Trials[0].checklist_answers).length > 0 && (
                                                <div className="mb-6 pb-6 border-b border-emerald-200/50">
                                                    <span className="text-emerald-800 block text-xs uppercase font-bold mb-3">Secretary Checklist Results</span>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {Object.entries(viewPlayer.Trials[0].checklist_answers).map(([questionText, ans]) => (
                                                            <div key={questionText} className="bg-white/60 p-3 rounded-lg border border-emerald-100 flex justify-between items-center shadow-sm gap-4">
                                                                <span className="text-slate-700 text-sm font-medium flex-1 leading-snug">
                                                                    {questionText}
                                                                </span>
                                                                <span className={`text-sm font-bold px-3 py-1 rounded-md shrink-0 ${ans === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                    {ans}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 bg-white/60 p-4 rounded-xl border border-emerald-100 shadow-sm">
                                                    <span className="text-emerald-800 block text-xs uppercase font-bold mb-2">Secretary Medical Notes</span>
                                                    <p className="text-slate-700 text-sm font-medium leading-relaxed">
                                                        {viewPlayer.Trials[0].medical_checklist || "No additional medical notes provided by manager."}
                                                    </p>
                                                </div>

                                                {viewPlayer.Trials[0].trial_photo_url && (
                                                    <div className="shrink-0 flex flex-col items-center">
                                                        <span className="text-emerald-800 block text-xs uppercase font-bold mb-2 w-full text-center">Live Capture</span>
                                                        <a href={getDriveImageUrl(viewPlayer.Trials[0].trial_photo_url)} target="_blank" rel="noreferrer" className="block transform hover:scale-105 transition-transform">
                                                            <img
                                                                src={getDriveImageUrl(viewPlayer.Trials[0].trial_photo_url)}
                                                                alt="Trial Live Capture"
                                                                className="w-48 h-48 object-cover rounded-xl border-4 border-white shadow-lg"
                                                                onError={(e) => {
                                                                    if (!e.target.dataset.retried) {
                                                                        e.target.dataset.retried = "true";
                                                                        setTimeout(() => {
                                                                            e.target.src = `${getDriveImageUrl(viewPlayer.Trials[0].trial_photo_url)}?retry=${Date.now()}`;
                                                                        }, 3000);
                                                                    } else {
                                                                        e.target.src = "https://placehold.co/300x300?text=No+Photo";
                                                                    }
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                            
                           {/* Verification Bar */}
                            <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                                        <Shield className="w-5 h-5" /> Mandatory Verification Step
                                    </h3>
                                    <ul className="list-disc list-inside text-xs text-slate-600 mt-2 space-y-1 ml-1 font-medium">
                                        <li>Visit UIDAI portal and enter the player Aadhaar number.</li>
                                        <li>Request the OTP from the player and download the E-Aadhaar.</li>
                                    </ul>
                                </div>
                                
                                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4 mt-2">
                                    <a 
                                        href="https://myaadhaar.uidai.gov.in/genricDownloadAadhaar/en" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="bg-white border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 shrink-0 w-full lg:w-auto h-[46px]"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Visit UIDAI Portal
                                    </a>

                                    <label className="flex items-center justify-center gap-3 cursor-pointer text-sm font-semibold text-slate-700 bg-white px-6 py-3 rounded-xl border border-emerald-200 shadow-sm w-full lg:w-auto shrink-0 h-[46px]">
                                        <input 
                                            type="checkbox" 
                                            checked={aadhaarVerified} 
                                            onChange={e => setAadhaarVerified(e.target.checked)} 
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-emerald-300" 
                                        />
                                        <span className="flex items-center gap-1.5">
                                            I verify <span className="font-black text-emerald-700">{viewPlayer.aadhaar_number || "ID Document"}</span>
                                        </span>
                                    </label>

                                    <div className="flex-1 w-full flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1">
                                            Upload Verified Screenshot / PDF of the Aadhaar
                                        </label>
                                        <div className="relative group w-full">
                                            <input 
                                                type="file" 
                                                accept="image/*,.pdf" 
                                                onChange={e => setAadhaarScreenshot(e.target.files[0])} 
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-colors cursor-pointer bg-white border border-emerald-200 rounded-xl shadow-sm h-[46px]" 
                                            />
                                            {aadhaarScreenshot && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        {/* Action Bar */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-2xl shrink-0">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Action:</label>
                                <select value={actionStatus} onChange={(e) => setActionStatus(e.target.value)} className="border border-slate-300 rounded-xl p-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[180px] shadow-sm cursor-pointer bg-white">
                                    <option value="" disabled>-- Select Status --</option>
                                    <option value="Registered" className="text-emerald-600">Approve Player</option>
                                    <option value="Pending" className="text-blue-600">Pending</option>
                                    <option value="Hold" className="text-amber-600">Hold</option>
                                    <option value="Rejected" className="text-rose-600">Reject</option>
                                    <option value="Blacklisted" className="text-slate-900">Blacklist</option>
                                </select>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button onClick={handleCloseModal} className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors">Cancel</button>
                                <button 
                                    onClick={() => handleUpdateStatus(viewPlayer.id)} 
                                    className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                                        actionStatus === "Registered" && (!aadhaarVerified || !aadhaarScreenshot) 
                                            ? "bg-slate-400 cursor-not-allowed" 
                                            : "bg-slate-800 hover:bg-slate-900"
                                    }`}
                                >
                                    Submit Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   2. DASHBOARD HOME
========================================================================= */
const DashboardHome = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        counts: { totalPlayers: 0, pendingApps: 0, activeCoaches: 0, pendingTeams: 0 },
        recentApplications: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await API.get('/admin/dashboard-stats');
                setStats(res.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { title: "Total Players", count: stats.counts.totalPlayers, icon: <Users className="w-6 h-6 text-blue-500" />, color: "border-blue-500", tab: "Players" },
        { title: "Pending Apps", count: stats.counts.pendingApps, icon: <FileText className="w-6 h-6 text-emerald-500" />, color: "border-emerald-500", tab: "Applications" },
        { title: "Active Coaches", count: stats.counts.activeCoaches, icon: <UserCog className="w-6 h-6 text-purple-500" />, color: "border-purple-500", tab: "Coach Management" },
        { title: "Teams Pending", count: stats.counts.pendingTeams, icon: <Shield className="w-6 h-6 text-amber-500" />, color: "border-amber-500", tab: "Teams" }
    ];

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Overview Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((stat, i) => (
                    <div 
                        key={i} 
                        onClick={() => setActiveTab(stat.tab)}
                        className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-t-4 ${stat.color} hover:shadow-md transition-all cursor-pointer active:scale-95`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 font-semibold text-xs md:text-sm mb-1">{stat.title}</p>
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    {loading ? "..." : stat.count}
                                </h3>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Applications</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3">Player</th>
                                    <th className="px-4 py-3">Team</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.recentApplications.map((player) => (
                                    <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-900">{player.full_name}</td>
                                        <td className="px-4 py-3 text-slate-600">{player.Club?.name || "Indep."}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                                {player.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => setActiveTab("Applications")} className="text-emerald-600 font-bold">Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Quick Actions</h3>
                    <button 
                        onClick={() => setActiveTab("Coach Management")}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-slate-700 font-semibold group"
                    >
                        <span className="flex items-center gap-3"><UserPlus className="w-5 h-5 text-emerald-600" /> Create Secretary Profile</span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    </button>
                    <button 
                        onClick={() => setActiveTab("Teams")}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-slate-700 font-semibold group"
                    >
                        <span className="flex items-center gap-3"><Shield className="w-5 h-5 text-blue-600" /> View Pending Teams</span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* =========================================================================
   🌟 TRANSFER HISTORY COMPONENT
========================================================================= */
const TransferHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await API.get('/admin/transfer-history');
                setHistory(res.data);
            } catch (err) {
                console.error("Error fetching transfer history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(record => {
        const query = searchQuery.toLowerCase();
        const nameMatch = record.player_name?.toLowerCase().includes(query);
        const phoneMatch = record.player_phone?.includes(query);
        
        return nameMatch || phoneMatch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <header className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <History className="w-6 h-6 text-emerald-500" /> Transfer History Logs
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">A complete audit trail of all player movements between clubs.</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold border border-emerald-100 text-sm">
                        Total Transfers: {history.length}
                    </div>
                </div>

                <div className="relative w-full mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search transfers by player name or phone number..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white text-sm font-medium transition-all"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {filteredHistory.length === 0 ? (
                <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-slate-500">
                    <ArrowRight className="mx-auto h-12 w-12 text-slate-300 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No transfer history found matching your criteria.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Player</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Transfer Path</th>
                                    <th className="px-6 py-4 text-center">NOC Document</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-600 font-semibold">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                {new Date(record.transfer_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={getDriveImageUrl(record.player_photo)} 
                                                    alt={record.player_name} 
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm bg-slate-100"
                                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x150?text=No+Photo"; }}
                                                />
                                                <span className="font-bold text-slate-900">{record.player_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {record.player_phone || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 font-bold rounded-lg text-xs truncate max-w-[140px]" title={record.from_club}>
                                                    {record.from_club}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-lg text-xs truncate max-w-[140px]" title={record.to_club}>
                                                    {record.to_club}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {record.noc_document_url ? (
                                                <a 
                                                    href={record.noc_document_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 w-32 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:-translate-y-0.5 active:scale-95"
                                                >
                                                    <FileText className="w-4 h-4" /> View NOC
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-semibold italic bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">Not Uploaded</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   🌟 NEW: ADMIN SETTINGS COMPONENT (MPIN UPDATE)
========================================================================= */
const AdminSettings = () => {
    const [currentMpin, setCurrentMpin] = useState("");
    const [newMpin, setNewMpin] = useState("");
    const [confirmMpin, setConfirmMpin] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
//new
    const handleUpdateMpin = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newMpin !== confirmMpin) {
            setError("New MPINs do not match.");
            return;
        }
        if (newMpin.length < 4) {
            setError("MPIN must be at least 4 digits.");
            return;
        }

        setLoading(true);

        try {
            // Get the specific admin's ID from local storage safely
            const userRaw = localStorage.getItem("currentUser");
            let adminId = null;
            
            if (userRaw) {
                const parsedData = JSON.parse(userRaw);
                // Safely checks both common structures: parsedData.user.id OR parsedData.id
                adminId = parsedData?.user?.id || parsedData?.id || null;
            }

            if (!adminId) {
                setError("Could not verify your admin session. Please log out and log back in.");
                setLoading(false);
                return;
            }

            // Use API.put instead of fetch
            const response = await API.put("/admin/update-mpin", { 
                adminId, 
                currentMpin, 
                newMpin 
            });

            // Axios puts the response data inside .data
            setMessage(response.data.message || "Your MPIN has been updated successfully!");
            setCurrentMpin("");
            setNewMpin("");
            setConfirmMpin("");

        } catch (err) {
            // This safely grabs the exact error from the backend
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(`Connection failed: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Security Settings</h1>
                <p className="text-slate-500 mt-1">Manage your personal admin account security.</p>
            </header>

            <form onSubmit={handleUpdateMpin} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" /> Update Personal MPIN
                </h2>

                {message && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-sm flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {message}</div>}
                {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-sm">⚠️ {error}</div>}

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Current MPIN</label>
                        <input
                            type="password"
                            required
                            maxLength="6"
                            placeholder="Enter your current MPIN"
                            value={currentMpin}
                            onChange={(e) => setCurrentMpin(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold tracking-widest"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">New MPIN</label>
                        <input
                            type="password"
                            required
                            maxLength="6"
                            placeholder="Enter new MPIN"
                            value={newMpin}
                            onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold tracking-widest"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New MPIN</label>
                        <input
                            type="password"
                            required
                            maxLength="6"
                            placeholder="Confirm new MPIN"
                            value={confirmMpin}
                            onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold tracking-widest"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:bg-slate-400 flex justify-center items-center gap-2"
                >
                    {loading ? "Updating..." : "Save New MPIN"}
                </button>
            </form>
        </div>
    );
};

/* =========================================================================
   3. MAIN LAYOUT SHELL (WITH NOTIFICATION BADGES)
========================================================================= */
export default function AdminControlPanel() {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [sidebarBadges, setSidebarBadges] = useState({
        "Applications": 0,
        "Teams": 0,
        "Transfer History": 0,
        "Notifications": 0
    });

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await API.get('/admin/dashboard-stats');
                
                // MAP THE BADGE DATA DIRECTLY TO THIS NAV ITEM
                setSidebarBadges({
                    "Applications": res.data.counts.pendingApps || 0,
                    "Teams": res.data.counts.pendingTeams || 0,
                    "Transfer History": res.data.counts.pendingTransfers || 0,
                    "Notifications": res.data.counts.pendingTourneyRegs || 0
                });
            } catch (error) {
                console.error("Error fetching sidebar badges", error);
            }
        };

        fetchBadges(); 
        const interval = setInterval(fetchBadges, 30000); 
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
    };

    const navItems = [
        { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "User Management", label: "User Management", icon: Users },
        { id: "Players", label: "Players Directory", icon: UserPlus },
        { id: "Transfer History", label: "Transfer Logs", icon: History }, 
        { id: "Applications", label: "New Players", icon: FileText },
        { id: "Coach Management", label: "Team Manager", icon: UserCog },
        { id: "Teams", label: "Teams", icon: Shield },
        { id: "Tournaments", label: "Tournaments", icon: Trophy },
        { id: "Referee Management", label: "Referee Management", icon: Flag },
        { id: "Notifications", label: "Tournament Notification", icon: Bell },
        // 🌟 NEW SETTINGS NAV ITEM
        { id: "Settings", label: "Settings", icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "Dashboard": return <DashboardHome setActiveTab={setActiveTab} />;
            case "Applications": return <ApplicationsView />;
            case "User Management": return <UsersPage />;
            case "Players": return <PlayersPage />;
            case "Transfer History": return <TransferHistoryPage />; 
            case "Coach Management": return <CoachManagement />;
            case "Teams": return <TeamsPage/>;
            case "Tournaments": return <TournamentsPage/>;
            case "Referee Management": return <RefereePage />;
            case "Notifications": return <NotificationsPage/>;
            // 🌟 NEW SETTINGS RENDER ROUTE
            case "Settings": return <AdminSettings />;
            default: return <DashboardHome setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex flex-col
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight">DHSA <span className="text-emerald-400">Admin</span></span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar space-y-1">
                    <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Modules</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        
                        // MAP THE BADGE DATA DIRECTLY TO THIS NAV ITEM
                        const badgeCount = sidebarBadges[item.id] || 0;

                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? "bg-emerald-600/10 text-emerald-400 font-bold"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 font-medium"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400 transition-colors"}`} />
                                <span className="flex-1 text-left truncate">{item.label}</span>
                                
                                {badgeCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shrink-0 animate-in zoom-in duration-300">
                                        {badgeCount > 99 ? "99+" : badgeCount}
                                    </span>
                                )}

                                {isActive && badgeCount === 0 && <div className="ml-auto w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0"></div>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700">
                            A
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">Super Admin</p>
                            <p className="text-xs text-slate-400 truncate">admin@platform.com</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="lg:hidden h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-extrabold text-slate-900 text-lg">Admin<span className="text-emerald-500">Pro</span></span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
