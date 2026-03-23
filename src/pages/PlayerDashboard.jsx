import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playerAPI } from "../services/api";

const PlayerDashboard = () => {

    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewProfile, setViewProfile] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser"));

        if (!user || user.role !== "player") {
            navigate("/login");
            return;
        }

        const fetchPlayerData = async () => {
            try {
                const response = await playerAPI.getProfile(user.id);
                setPlayerData(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerData();
    }, [navigate]);

   /* ===============================
       DRIVE IMAGE HELPER
    ================================ */
     const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

    const logout = () => {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    const getBadgeStyles = (status) => {
        switch (status) {
            case "Registered":
                return "bg-emerald-100 text-emerald-800 border-emerald-300";
            case "Recommended":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "Trialist":
                return "bg-purple-100 text-purple-800 border-purple-300";
            case "Applied":
                return "bg-amber-100 text-amber-800 border-amber-300";
            default:
                return "bg-slate-100 text-slate-800 border-slate-300";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* --- DASHBOARD HEADER --- */}
                <header className="mb-10 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Player Portal</h1>
                        <p className="text-slate-500 mt-1">Manage your applications and track your status.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Logout
                    </button>
                </header>

                {/* --- MAIN PROFILE CARD --- */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start transition-all duration-300 hover:shadow-md">
                    
                    {/* PHOTO */}
                    <div className="flex-shrink-0 relative">
                        <img
                            src={getDriveImageUrl(playerData.player_photo_url)}
                            alt="profile"
                            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-md border-4 border-slate-50"
                            onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }}
                        />
                        <div className={`absolute bottom-2 right-4 w-6 h-6 rounded-full border-4 border-white ${playerData.status === 'Registered' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                    </div>

                    {/* BASIC INFO & STATUS */}
                    <div className="flex-grow w-full text-center md:text-left flex flex-col h-full justify-between">
                        
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-1">
                                    {playerData.full_name}
                                </h2>
                                <span className="inline-block bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                                    {playerData.position}
                                </span>
                            </div>
                            <div className={`px-5 py-2 border rounded-full font-bold text-sm tracking-wide uppercase shadow-sm ${getBadgeStyles(playerData.status)}`}>
                                {playerData.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div>
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Application Status</h3>
                                <p className="font-semibold text-slate-900 flex items-center gap-2">
                                    {playerData.status === "Registered" ? (
                                        <><svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> You are officially registered!</>
                                    ) : (
                                        <><svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg> Application is under review</>
                                    )}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Target Club ID</h3>
                                <p className="font-semibold text-slate-900 bg-white inline-block px-3 py-1 rounded-lg border border-slate-200">
                                    #{playerData.club_applied}
                                </p>
                            </div>
                        </div>

                        {/* VIEW PROFILE BUTTON */}
                        <div className="mt-auto">
                            <button
                                onClick={() => setViewProfile(true)}
                                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-emerald-200 transition-all duration-200 active:scale-95"
                            >
                                View Complete Profile
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* ===============================
                PROFILE MODAL
            =============================== */}
            {viewProfile && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h2 className="text-2xl font-bold text-slate-900">My Complete Profile</h2>
                            <button 
                                onClick={() => setViewProfile(false)}
                                className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/50">
                            
                            <div className="flex flex-col md:flex-row gap-8 mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <img
                                    src={getDriveImageUrl(playerData.player_photo_url)}
                                    alt="player"
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-md border-4 border-slate-50"
                                    onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }}
                                />
                                <div className="flex flex-col justify-center">
                                    <h2 className="text-3xl font-extrabold text-slate-900">{playerData.full_name}</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">{playerData.position}</span>
                                        <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">{playerData.age} Years Old</span>
                                        <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">{playerData.nationality}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Personal & Physical */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <span className="w-2 h-5 bg-emerald-500 rounded-full"></span> Physical & Personal
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">DOB</span> <span className="font-semibold text-slate-900">{playerData.dob}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Gender</span> <span className="font-semibold text-slate-900">{playerData.gender}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Height</span> <span className="font-semibold text-slate-900">{playerData.height} cm</span></p>
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Weight</span> <span className="font-semibold text-slate-900">{playerData.weight} kg</span></p>
                                        <p className="flex justify-between pb-1"><span className="text-slate-500 font-medium">Blood Group</span> <span className="font-semibold text-slate-900">{playerData.blood_group}</span></p>
                                    </div>
                                </div>

                                {/* Playing Profile */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <span className="w-2 h-5 bg-emerald-500 rounded-full"></span> Playing Profile
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Position</span> <span className="font-semibold text-slate-900">{playerData.position}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Strong Foot</span> <span className="font-semibold text-slate-900">{playerData.strong_foot}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Experience</span> <span className="font-semibold text-slate-900">{playerData.experience_years} years</span></p>
                                        <p className="flex flex-col pb-1 mt-2">
                                            <span className="text-slate-500 font-medium mb-1">Preferred Team / Current</span> 
                                            <span className="font-semibold text-slate-900 bg-slate-50 p-2 rounded">{playerData.preferred_team || "N/A"}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Medical */}
                                <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl shadow-sm md:col-span-2">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <span className="w-2 h-5 bg-rose-500 rounded-full"></span> Medical Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="bg-white p-3 rounded-xl border border-rose-50 shadow-sm">
                                            <span className="text-rose-600 block text-xs uppercase font-bold mb-1">Injury (Last 6 Months)</span>
                                            <span className="font-medium text-slate-900">{playerData.injury_last_6_months || "None reported"}</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-rose-50 shadow-sm">
                                            <span className="text-rose-600 block text-xs uppercase font-bold mb-1">Pain While Running</span>
                                            <span className="font-medium text-slate-900">{playerData.pain_running || "No"}</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-rose-50 shadow-sm">
                                            <span className="text-rose-600 block text-xs uppercase font-bold mb-1">Ongoing Treatment</span>
                                            <span className="font-medium text-slate-900">{playerData.medical_treatment || "None"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <span className="w-2 h-5 bg-emerald-500 rounded-full"></span> Contact & Location
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Email</span> <span className="font-semibold text-slate-900">{playerData.email}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Phone</span> <span className="font-semibold text-slate-900">{playerData.phone}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">City/District</span> <span className="font-semibold text-slate-900">{playerData.city}, {playerData.district}</span></p>
                                        <p className="flex justify-between pb-1"><span className="text-slate-500 font-medium">Pincode</span> <span className="font-semibold text-slate-900">{playerData.pincode}</span></p>
                                    </div>
                                </div>

                                {/* Emergency & Docs */}
                                <div className="flex flex-col gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                            <span className="w-2 h-5 bg-emerald-500 rounded-full"></span> Emergency Contact
                                        </h3>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="font-bold text-slate-900">{playerData.emergency_contact_name}</p>
                                            <p className="text-slate-600 font-medium">{playerData.emergency_contact_phone}</p>
                                        </div>
                                    </div>

                                    {/* 🌟 UPDATED DOCUMENTS SECTION 🌟 */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-grow">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                            <span className="w-2 h-5 bg-emerald-500 rounded-full"></span> Documents
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                            
                                            <a href={playerData.gov_doc_1_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Gov Document 1</span>
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            </a>

                                            <a href={playerData.gov_doc_2_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Gov Document 2</span>
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            </a>

                                            <a href={playerData.gov_doc_3_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Gov Document 3</span>
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            </a>
                                            
                                            <a href={playerData.fitness_certificate_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Fitness Certificate</span>
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            </a>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end rounded-b-3xl">
                            <button
                                onClick={() => setViewProfile(false)}
                                className="px-8 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Close Profile
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default PlayerDashboard;