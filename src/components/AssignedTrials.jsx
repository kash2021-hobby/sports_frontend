import React, { useState, useEffect } from "react";
import { clubAPI, trialAPI } from "../services/api";
import TrialForm from "./TrialForm"; // Ensure this import path matches your project
import { ClipboardList, Search, X } from "lucide-react";

export default function AssignedTrials({ clubId }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewPlayer, setViewPlayer] = useState(null);
    const [evaluatingPlayer, setEvaluatingPlayer] = useState(null);
    const [invitePlayer, setInvitePlayer] = useState(null);
    const [trialForm, setTrialForm] = useState({ trialDate: "", trialTime: "", venue: "" });
    const [activeTab, setActiveTab] = useState("Pending");
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        fetchApplications();
    }, [clubId]);

   const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://drive.google.com/uc?export=view&id=${fileId}`; };

   const fetchApplications = async () => {
        try {
            const response = await clubAPI.getApplications(clubId);
            
            // 🌟 SAFETY CHECK: Ensure we always set an Array, even if the API sends weird data
            if (response.data && Array.isArray(response.data)) {
                setPlayers(response.data);
            } else if (response.data && Array.isArray(response.data.applications)) {
                // Sometimes backends nest the array inside another object
                setPlayers(response.data.applications);
            } else {
                console.warn("API did not return an array of players:", response.data);
                setPlayers([]); 
            }
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            setPlayers([]); // Prevent crash on error
        } finally {
            setLoading(false);
        }
    };

    const handleInviteTrial = async () => {
        const { trialDate, trialTime, venue } = trialForm;
        if (!trialDate || !trialTime || !venue) {
            alert("Please fill all fields");
            return;
        }
        try {
            await trialAPI.invite({
                player_id: invitePlayer.id,
                club_id: clubId,
                trial_date: trialDate,
                venue
            });
            const message = `Hello ${invitePlayer.full_name}\nYou are invited for a football trial.\nDate: ${trialDate}\nTime: ${trialTime}\nVenue: ${venue}\nPlease confirm your availability.`;
            window.open(`https://wa.me/${invitePlayer.phone}?text=${encodeURIComponent(message)}`, "_blank");
            alert("Trial invitation sent");
            setInvitePlayer(null);
            setTrialForm({ trialDate: "", trialTime: "", venue: "" });
            fetchApplications();
        } catch (error) {
            console.error(error);
            alert("Error inviting player");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-emerald-500"></div>
        </div>
    );

    const newApplications = players.filter(p => p.status === "Applied");
    const trialists = players.filter(p => p.status === "Trialist");
    const recommendedPlayers = players.filter(p => p.status === "Recommended");

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Assigned Trials</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage applications and evaluate active trialists.</p>
                </div>
            </header>

            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                {/* NEW APPLICATIONS */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs">
                            {newApplications.length}
                        </span> New Applications
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newApplications.map(player => (
                            <div key={player.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={getDriveImageUrl(player.player_photo_url)}
                                        alt={player.full_name}
                                        className="w-14 h-14 rounded-full object-cover shadow-sm border"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Photo"; }}
                                    />
                                    <div>
                                        <h3 className="font-bold text-slate-900">{player.full_name}</h3>
                                        <span className="text-xs font-bold text-slate-500 uppercase">{player.position}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                                    <button onClick={() => setViewPlayer(player)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl text-sm transition-colors border border-slate-200">Profile</button>
                                    <button onClick={() => setInvitePlayer(player)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl shadow-md text-sm transition-all active:scale-95">Invite Trial</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ACTIVE TRIALISTS */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Active Trialists</h2>
                        <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-sm font-bold">{trialists.length}</span>
                    </div>
                    {trialists.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
                            <p className="font-medium">No active trialists waiting for evaluation.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trialists.map(player => (
                                <div key={player.id} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 flex justify-between items-center p-5">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={getDriveImageUrl(player.player_photo_url)}
                                            alt={player.full_name}
                                            className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-white"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Photo"; }}
                                        />
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">{player.full_name}</h3>
                                            <span className="text-sm text-emerald-700 font-medium">{player.position}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setEvaluatingPlayer(player)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all duration-200 active:scale-95 text-sm">
                                        Evaluate
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* PENDING ADMIN APPROVAL */}
                <section className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Pending Admin Approval</h2>
                        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-bold">{recommendedPlayers.length}</span>
                    </div>
                    {recommendedPlayers.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
                            <p className="font-medium">No players currently waiting for admin approval.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedPlayers.map(player => (
                                <div key={player.id} className="bg-blue-50/50 border border-blue-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col p-5">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img
                                            src={getDriveImageUrl(player.player_photo_url)}
                                            alt={player.full_name}
                                            className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-white"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Photo"; }}
                                        />
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">{player.full_name}</h3>
                                            <span className="text-sm text-blue-700 font-medium">{player.position}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewPlayer(player)} className="w-full bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm mt-auto">
                                        View Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* =============================== PLAYER PROFILE MODAL ================================ */} 
            {viewPlayer && ( 
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"> 
                    <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"> 
                        {/* Header */} 
                        <div className="px-8 py-6 border-b flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white"> 
                            <h2 className="text-2xl font-bold text-gray-800"> Applicant Profile </h2> 
                            <button onClick={() => setViewPlayer(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition"> ✕ </button> 
                        </div> 
                        
                        {/* Body */} 
                        <div className="p-8 overflow-y-auto space-y-8"> 
                            
                            {/* PLAYER BASIC INFO */} 
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-gray-50 p-6 rounded-2xl border"> 
                                <img src={getDriveImageUrl(viewPlayer.player_photo_url)} alt="player" className="w-36 h-36 rounded-2xl object-cover shadow" onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }} /> 
                                <div className="space-y-2 text-center md:text-left"> 
                                    <h2 className="text-3xl font-bold text-gray-800"> {viewPlayer.full_name} </h2> 
                                    <p className="text-emerald-600 font-semibold"> {viewPlayer.position} </p> 
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2"> 
                                        <span className="bg-white border px-3 py-1 rounded-full"> Age: {viewPlayer.age} </span> 
                                        <span className="bg-white border px-3 py-1 rounded-full"> {viewPlayer.nationality} </span> 
                                        <span className="bg-white border px-3 py-1 rounded-full"> {viewPlayer.gender} </span> 
                                    </div> 
                                </div> 
                            </div> 

                            {/* PERSONAL DETAILS */} 
                            <div className="bg-white border rounded-2xl p-6 shadow-sm"> 
                                <h3 className="text-lg font-bold mb-4 text-gray-800"> Personal Details </h3> 
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700"> 
                                    {/* 🌟 FIXED: Format DOB to DD-MM-YYYY 🌟 */}
                                    <p><span className="font-semibold">DOB:</span> {viewPlayer.dob ? new Date(viewPlayer.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p> 
                                    <p><span className="font-semibold">Height:</span> {viewPlayer.height} cm</p> 
                                    <p><span className="font-semibold">Weight:</span> {viewPlayer.weight} kg</p> 
                                    <p><span className="font-semibold">Blood Group:</span> {viewPlayer.blood_group}</p> 
                                    <p><span className="font-semibold">Aadhaar:</span> {viewPlayer.aadhaar_number}</p> 
                                </div> 
                            </div> 

                            {/* FOOTBALL PROFILE */} 
                            <div className="bg-white border rounded-2xl p-6 shadow-sm"> 
                                <h3 className="text-lg font-bold mb-4 text-gray-800"> Football Profile </h3> 
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700"> 
                                    <p><span className="font-semibold">Position:</span> {viewPlayer.position}</p> 
                                    <p><span className="font-semibold">Strong Foot:</span> {viewPlayer.strong_foot}</p> 
                                    <p><span className="font-semibold">Experience:</span> {viewPlayer.experience_years} years</p> 
                                    <p><span className="font-semibold">Preferred Team:</span> {viewPlayer.preferred_team}</p> 
                                </div> 
                            </div> 

                            {/* CONTACT DETAILS */} 
                            <div className="bg-white border rounded-2xl p-6 shadow-sm"> 
                                <h3 className="text-lg font-bold mb-4 text-gray-800"> Contact Details </h3> 
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700"> 
                                    <p><span className="font-semibold">Email:</span> {viewPlayer.email}</p> 
                                    <p><span className="font-semibold">Phone:</span> {viewPlayer.phone}</p> 
                                    <p><span className="font-semibold">City:</span> {viewPlayer.city}</p> 
                                    <p><span className="font-semibold">District:</span> {viewPlayer.district}</p> 
                                    <p><span className="font-semibold">Pincode:</span> {viewPlayer.pincode}</p> 
                                </div> 
                            </div> 

                            {/* EMERGENCY CONTACT */} 
                            <div className="bg-white border rounded-2xl p-6 shadow-sm"> 
                                <h3 className="text-lg font-bold mb-4 text-gray-800"> Emergency Contact </h3> 
                                <div className="space-y-2 text-sm text-gray-700"> 
                                    <p><span className="font-semibold">Name:</span> {viewPlayer.emergency_contact_name}</p> 
                                    <p><span className="font-semibold">Phone:</span> {viewPlayer.emergency_contact_phone}</p> 
                                </div> 
                            </div> 

                            {/* MEDICAL INFO */} 
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm"> 
                                <h3 className="text-lg font-bold mb-4 text-red-700"> Medical Information </h3> 
                                <div className="space-y-2 text-sm text-gray-700"> 
                                    <p><span className="font-semibold">Injury last 6 months:</span> {viewPlayer.injury_last_6_months}</p> 
                                    <p><span className="font-semibold">Pain while running:</span> {viewPlayer.pain_running}</p> 
                                    <p><span className="font-semibold">Medical treatment:</span> {viewPlayer.medical_treatment}</p> 
                                </div> 
                            </div> 

                            {/* DOCUMENTS SECTION */} 
                            <div> 
                                <h3 className="text-lg font-bold mb-4 text-gray-800"> Documents </h3> 
                                <div className="grid md:grid-cols-2 gap-6"> 
                                    
                                    {/* Gov Doc 1 */}
                                    <div className="bg-white border rounded-xl p-4 shadow-sm"> 
                                        <p className="font-semibold mb-3 text-gray-700"> Gov Document 1 </p> 
                                        {viewPlayer.gov_doc_1_url ? ( 
                                            <iframe src={viewPlayer.gov_doc_1_url} className="w-full h-72 border rounded" title="Gov Doc 1" allow="autoplay" ></iframe> 
                                        ) : ( 
                                            <img src="https://placehold.co/600x400?text=No+Document" className="w-full h-72 object-contain border rounded bg-slate-50" alt="No Doc" /> 
                                        )} 
                                    </div> 

                                    {/* Gov Doc 2 */}
                                    <div className="bg-white border rounded-xl p-4 shadow-sm"> 
                                        <p className="font-semibold mb-3 text-gray-700"> Gov Document 2 </p> 
                                        {viewPlayer.gov_doc_2_url ? ( 
                                            <iframe src={viewPlayer.gov_doc_2_url} className="w-full h-72 border rounded" title="Gov Doc 2" allow="autoplay" ></iframe> 
                                        ) : ( 
                                            <img src="https://placehold.co/600x400?text=No+Document" className="w-full h-72 object-contain border rounded bg-slate-50" alt="No Doc" /> 
                                        )} 
                                    </div> 

                                    {/* Gov Doc 3 */}
                                    <div className="bg-white border rounded-xl p-4 shadow-sm"> 
                                        <p className="font-semibold mb-3 text-gray-700"> Gov Document 3 </p> 
                                        {viewPlayer.gov_doc_3_url ? ( 
                                            <iframe src={viewPlayer.gov_doc_3_url} className="w-full h-72 border rounded" title="Gov Doc 3" allow="autoplay" ></iframe> 
                                        ) : ( 
                                            <img src="https://placehold.co/600x400?text=No+Document" className="w-full h-72 object-contain border rounded bg-slate-50" alt="No Doc" /> 
                                        )} 
                                    </div> 

                                    {/* Fitness Certificate */} 
                                    <div className="bg-white border rounded-xl p-4 shadow-sm"> 
                                        <p className="font-semibold mb-3 text-gray-700"> Fitness Certificate </p> 
                                        {viewPlayer.fitness_certificate_url ? ( 
                                            <iframe src={viewPlayer.fitness_certificate_url} className="w-full h-72 border rounded" title="Fitness Certificate" allow="autoplay" ></iframe> 
                                        ) : ( 
                                            <img src="https://placehold.co/600x400?text=No+Document" className="w-full h-72 object-contain border rounded bg-slate-50" alt="No Doc" /> 
                                        )} 
                                    </div> 

                                </div> 
                            </div> 
                        </div> 
                    </div> 
                </div> 
            )} 

            {/* =============================== INVITE TRIAL MODAL ================================ */} 
            {invitePlayer && ( 
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"> 
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl"> 
                        <h2 className="text-xl font-bold mb-4"> Invite Player for Physical Trial  </h2> 
                        <p className="mb-4 text-slate-600"> {invitePlayer.full_name} </p> 
                        <div className="space-y-4"> 
                            <input type="date" className="w-full border p-2 rounded" value={trialForm.trialDate} onChange={(e) => setTrialForm({ ...trialForm, trialDate: e.target.value })} /> 
                            <input type="time" className="w-full border p-2 rounded" value={trialForm.trialTime} onChange={(e) => setTrialForm({ ...trialForm, trialTime: e.target.value })} /> 
                            <input type="text" placeholder="Venue" className="w-full border p-2 rounded" value={trialForm.venue} onChange={(e) => setTrialForm({ ...trialForm, venue: e.target.value })} /> 
                        </div> 
                        <div className="flex gap-3 mt-6"> 
                            <button onClick={() => setInvitePlayer(null)} className="flex-1 bg-gray-300 py-2 rounded" > Cancel </button> 
                            <button onClick={handleInviteTrial} className="flex-1 bg-emerald-600 text-white py-2 rounded" > Send Invite </button> 
                        </div> 
                    </div> 
                </div> 
            )} 

            {/* =============================== TRIAL EVALUATION MODAL ================================ */} 
            {evaluatingPlayer && ( 
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"> 
                    <div className="bg-white p-0 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"> 
                        <TrialForm player={evaluatingPlayer} clubId={clubId} questions={questions} onClose={() => setEvaluatingPlayer(null)} onSuccess={() => { setEvaluatingPlayer(null); fetchApplications(); }} /> 
                    </div> 
                </div> 
            )}
        </div>
    );
}
