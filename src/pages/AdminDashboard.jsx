import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

const AdminDashboard = () => {

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewPlayer, setViewPlayer] = useState(null);
    const [actionStatus, setActionStatus] = useState("");

    useEffect(() => {
        fetchPlayers();
    }, []);

    /* ===============================
       DRIVE IMAGE HELPER (FIXED)
    ================================ */
    const getDriveImageUrl = (url) => {
      if (!url) return "https://placehold.co/150x150?text=No+Photo";
      
      const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/);
      const fileId = match ? match[1] : null;

      if (!fileId) return url;

      // This is the "secret" Google User Content endpoint for raw image delivery
      return `https://lh3.googleusercontent.com/d/${fileId}`;
   };

    const fetchPlayers = async () => {
        try {
            const res = await adminAPI.getPendingPlayers();
            setPlayers(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (id) => {
        if (!actionStatus) {
            alert("Please select an action from the dropdown first.");
            return;
        }

        if (!window.confirm(`Are you sure you want to mark this player as ${actionStatus}?`)) return;

        try {
            const response = await fetch("http://localhost:5000/admin/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: id, status: actionStatus })
            });

            if (response.ok) {
                // Remove player from the grid
                setPlayers(players.filter(p => p.id !== id));
                setViewPlayer(null); // Close modal
                setActionStatus(""); // Reset dropdown
                alert(`Player successfully marked as: ${actionStatus}`);
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error(err);
            alert("Status update failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading pending applications...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* --- DASHBOARD HEADER --- */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1">Review and approve pending player applications.</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold border border-emerald-100 flex items-center gap-2">
                        <span>Pending Applications:</span>
                        <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">{players.length}</span>
                    </div>
                </header>

                {/* --- PLAYER CARDS GRID --- */}
                {players.length === 0 ? (
                    <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-slate-500">
                        <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No pending players to review at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {players.map(player => (
                            <div
                                key={player.id}
                                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden"
                            >
                                <div className="p-6 flex items-start gap-4 flex-grow">
                                    <img
                                        src={getDriveImageUrl(player.player_photo_url)}
                                        alt={player.full_name}
                                        className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-slate-50"
                                        onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }}
                                    />
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1">
                                            {player.full_name}
                                        </h3>
                                        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                            {player.position}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                    <button
                                        onClick={() => setViewPlayer(player)}
                                        className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 font-semibold py-2.5 rounded-xl transition-colors duration-200"
                                    >
                                        Review Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===============================
                    PLAYER DETAILS MODAL
                =============================== */}
                {viewPlayer && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
                        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                            
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Player Application Profile
                                </h2>
                                <button 
                                    onClick={() => setViewPlayer(null)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-2 rounded-full shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                                <div className="flex flex-col md:flex-row gap-8 mb-8">
                                    <img
                                        src={getDriveImageUrl(viewPlayer.player_photo_url)}
                                        alt={viewPlayer.full_name}
                                        className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover shadow-md border-4 border-slate-50"
                                        onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }}
                                    />
                                    <div className="flex flex-col justify-center">
                                        <h2 className="text-4xl font-extrabold text-slate-900">{viewPlayer.full_name}</h2>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">{viewPlayer.position}</span>
                                            <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">{viewPlayer.age} Years Old</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Column 1 */}
                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Personal & Contact
                                            </h3>
                                            <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm border border-slate-100">
                                                <p className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 uppercase font-bold text-xs">DOB</span> <span className="font-semibold text-slate-900">{viewPlayer.dob}</span></p>
                                                <p className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 uppercase font-bold text-xs">Gender</span> <span className="font-semibold text-slate-900">{viewPlayer.gender}</span></p>
                                                <p className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 uppercase font-bold text-xs">Location</span> <span className="font-semibold text-slate-900">{viewPlayer.city}, {viewPlayer.district}</span></p>
                                                <p className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 uppercase font-bold text-xs">Email</span> <span className="font-semibold text-slate-900">{viewPlayer.email}</span></p>
                                                <p className="flex justify-between"><span className="text-slate-500 uppercase font-bold text-xs">Phone</span> <span className="font-semibold text-slate-900">{viewPlayer.phone}</span></p>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Documents
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                {/* Government ID */}
                                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                                    <p className="font-semibold mb-3 text-slate-700">
                                                        Government ID
                                                    </p>
                                                    {viewPlayer.gov_id_url ? (
                                                        <iframe
                                                            src={viewPlayer.gov_id_url}
                                                            className="w-full h-72 border border-slate-100 rounded-lg bg-slate-50"
                                                            title="Government ID"
                                                            allow="autoplay"
                                                        ></iframe>
                                                    ) : (
                                                        <img 
                                                            src="https://placehold.co/600x400?text=No+Document" 
                                                            className="w-full h-72 object-contain border border-slate-100 rounded-lg bg-slate-50" 
                                                            alt="No Government ID" 
                                                        />
                                                    )}
                                                </div>

                                                {/* Fitness Certificate */}
                                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                                    <p className="font-semibold mb-3 text-slate-700">
                                                        Fitness Certificate
                                                    </p>
                                                    {viewPlayer.fitness_certificate_url ? (
                                                        <iframe
                                                            src={viewPlayer.fitness_certificate_url}
                                                            className="w-full h-72 border border-slate-100 rounded-lg bg-slate-50"
                                                            title="Fitness Certificate"
                                                            allow="autoplay"
                                                        ></iframe>
                                                    ) : (
                                                        <img 
                                                            src="https://placehold.co/600x400?text=No+Document" 
                                                            className="w-full h-72 object-contain border border-slate-100 rounded-lg bg-slate-50" 
                                                            alt="No Fitness Certificate" 
                                                        />
                                                    )}
                                                </div>

                                            </div>
                                        </section>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-8">
                                        
                                        {/* Physical & Playing combined for space */}
                                        <section>
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Physical & Playing Profile
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100 mb-4">
                                                <p><span className="text-slate-500 block text-xs uppercase font-bold">Height</span> <span className="font-medium text-slate-900">{viewPlayer.height} cm</span></p>
                                                <p><span className="text-slate-500 block text-xs uppercase font-bold">Weight</span> <span className="font-medium text-slate-900">{viewPlayer.weight} kg</span></p>
                                                <p><span className="text-slate-500 block text-xs uppercase font-bold">Strong Foot</span> <span className="font-medium text-slate-900">{viewPlayer.strong_foot}</span></p>
                                                <p><span className="text-slate-500 block text-xs uppercase font-bold">Experience</span> <span className="font-medium text-slate-900">{viewPlayer.experience_years} Years</span></p>
                                            </div>
                                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-sm">
                                                <p className="mb-2"><span className="text-rose-500 block text-xs uppercase font-bold">Recent Injuries (6 mo)</span> <span className="font-medium text-slate-900">{viewPlayer.injury_last_6_months || "None"}</span></p>
                                                <p><span className="text-rose-500 block text-xs uppercase font-bold">Pain while running</span> <span className="font-medium text-slate-900">{viewPlayer.pain_running || "No"}</span></p>
                                            </div>
                                        </section>

                                        {/* =========================================
                                            UPDATED TRIAL EVALUATION SECTION 
                                        ========================================== */}
                                        {viewPlayer.Trials?.length > 0 && (
                                            <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                                                <div className="flex justify-between items-start mb-6">
                                                   <div>
                                                      <h3 className="text-xl font-bold text-emerald-900">Trial Evaluation</h3>
                                                      <p className="text-xs font-semibold text-emerald-700 mt-1">Submitted by Club Manager</p>
                                                   </div>
                                                   <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${viewPlayer.Trials[0].recommendation ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}`}>
                                                         {viewPlayer.Trials[0].recommendation ? "Recommended" : "Not Recommended"}
                                                   </span>
                                                </div>

                                                {/* 1. Technical Scores */}
                                                <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm mb-6 pb-6 border-b border-emerald-200/50">
                                                    <div>
                                                        <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Pace</span> 
                                                        <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{width: `${(viewPlayer.Trials[0].pace / 10) * 100}%`}}></div></div>
                                                        <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].pace}/10</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Passing</span> 
                                                        <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{width: `${(viewPlayer.Trials[0].passing / 10) * 100}%`}}></div></div>
                                                        <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].passing}/10</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Shooting</span> 
                                                        <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{width: `${(viewPlayer.Trials[0].shooting / 10) * 100}%`}}></div></div>
                                                        <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].shooting}/10</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-emerald-800 block text-xs uppercase font-bold mb-1.5">Stamina</span> 
                                                        <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full shadow-inner" style={{width: `${(viewPlayer.Trials[0].stamina / 10) * 100}%`}}></div></div>
                                                        <span className="font-bold text-emerald-900 float-right mt-1.5">{viewPlayer.Trials[0].stamina}/10</span>
                                                    </div>
                                                </div>

                                                {/* 2. Manager Checklist Answers */}
                                                {viewPlayer.Trials[0].checklist_answers && Object.keys(viewPlayer.Trials[0].checklist_answers).length > 0 && (
                                                   <div className="mb-6 pb-6 border-b border-emerald-200/50">
                                                      <span className="text-emerald-800 block text-xs uppercase font-bold mb-3">Manager Checklist Results</span>
                                                      <div className="grid grid-cols-1 gap-2">
                                                         
                                                         {/* FIXED: Directly prints the question text from the database */}
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

                                                {/* 3. Medical Notes & Live Photo */}
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                   
                                                   {/* Medical Notes */}
                                                   <div className="flex-1 bg-white/60 p-4 rounded-xl border border-emerald-100 shadow-sm">
                                                      <span className="text-emerald-800 block text-xs uppercase font-bold mb-2">Manager Medical Notes</span>
                                                      <p className="text-slate-700 text-sm font-medium leading-relaxed">
                                                         {viewPlayer.Trials[0].medical_checklist || "No additional medical notes provided by manager."}
                                                      </p>
                                                   </div>

                                                   {/* Live Trial Photo */}
                                                   {viewPlayer.Trials[0].trial_photo_url && (
                                                      <div className="shrink-0 flex flex-col items-center">
                                                         <span className="text-emerald-800 block text-xs uppercase font-bold mb-2 w-full text-center">Live Capture</span>
                                                         <a href={getDriveImageUrl(viewPlayer.Trials[0].trial_photo_url)} target="_blank" rel="noreferrer" className="block transform hover:scale-105 transition-transform">
                                                            
                                                            {/* CHANGED: Increased from w-24 h-24 to w-48 h-48 for a much larger photo */}
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
                            </div>
{/* Modal Footer (Sticky) */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-2xl">
                                
                                {/* Dropdown for Status Selection */}
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Action:</label>
                                    <select
                                        value={actionStatus}
                                        onChange={(e) => setActionStatus(e.target.value)}
                                        className="border border-slate-300 rounded-xl p-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[180px] shadow-sm cursor-pointer bg-white"
                                    >
                                        <option value="" disabled>-- Select Status --</option>
                                        <option value="Registered" className="text-emerald-600 font-bold">Approve Player</option>
                                        <option value="Pending" className="text-blue-600 font-bold">Pending</option>
                                        <option value="Hold" className="text-amber-600 font-bold">Hold</option>
                                        <option value="Rejected" className="text-rose-600 font-bold">Reject</option>
                                        <option value="Blacklisted" className="text-slate-900 font-bold">Blacklist</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setViewPlayer(null);
                                            setActionStatus(""); // reset on close
                                        }}
                                        className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(viewPlayer.id)}
                                        className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-lg transition-all active:scale-95"
                                    >
                                        Submit Action
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;