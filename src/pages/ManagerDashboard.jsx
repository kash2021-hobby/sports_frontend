import React, { useState, useEffect } from "react";
import { clubAPI, trialAPI } from "../services/api";
import TrialForm from "../components/TrialForm";

const ManagerDashboard = ({ clubId = 1 }) => {

   const [players, setPlayers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [viewPlayer, setViewPlayer] = useState(null);
   const [evaluatingPlayer, setEvaluatingPlayer] = useState(null);
// Tab Navigation State
   const [activeTab, setActiveTab] = useState("applications");

   // Settings (Questions) States
   const [questions, setQuestions] = useState([]);
   const [newQuestion, setNewQuestion] = useState("");
   const [editingQuestionId, setEditingQuestionId] = useState(null);
   const [editQuestionText, setEditQuestionText] = useState("");
   /* ========= ADDED STATES ========= */

   const [invitePlayer, setInvitePlayer] = useState(null);

   const [trialForm, setTrialForm] = useState({
      trialDate: "",
      trialTime: "",
      venue: ""
   });

   useEffect(() => {
      if (activeTab === "applications") {
         fetchApplications();
      } else if (activeTab === "settings") {
         fetchQuestions();
      }
   }, [activeTab]);

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

   const fetchApplications = async () => {
      try {
         const response = await clubAPI.getApplications(clubId);
         setPlayers(response.data);
      } catch (error) {
         console.error(error);
      }
      setLoading(false);
   };
const fetchQuestions = async () => {
      try {
         const res = await fetch(`http://localhost:5000/manager/questions/${clubId}`);
         const data = await res.json();
         setQuestions(data);
      } catch (error) { console.error(error); }
   };

   const handleAddQuestion = async (e) => {
      e.preventDefault();
      if (!newQuestion.trim()) return;
      try {
         const res = await fetch("http://localhost:5000/manager/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ club_id: clubId, question: newQuestion })
         });
         const added = await res.json();
         setQuestions([...questions, added]);
         setNewQuestion("");
      } catch (error) { console.error(error); }
   };

   const handleDeleteQuestion = async (id) => {
      if (window.confirm("Delete this question?")) {
         // Add your DELETE fetch request here later
         setQuestions(questions.filter(q => q.id !== id)); 
      }
   };

   const handleSaveEdit = async (id) => {
      // Add your PUT fetch request here later
      setQuestions(questions.map(q => q.id === id ? { ...q, question: editQuestionText } : q));
      setEditingQuestionId(null);
   };
   /* ===============================
      INVITE TRIAL (UPDATED)
   ================================ */

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

         const message = `Hello ${invitePlayer.full_name}

You are invited for a football trial.

Date: ${trialDate}
Time: ${trialTime}
Venue: ${venue}

Please confirm your availability.`;

         window.open(
            `https://wa.me/${invitePlayer.phone}?text=${encodeURIComponent(message)}`,
            "_blank"
         );

         alert("Trial invitation sent");

         setInvitePlayer(null);

         setTrialForm({
            trialDate: "",
            trialTime: "",
            venue: ""
         });

         fetchApplications();

      } catch (error) {
         console.error(error);
         alert("Error inviting player");
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading manager dashboard...</p>
         </div>
      );
   }

   const newApplications = players.filter(p => p.status === "Applied");
   const trialists = players.filter(p => p.status === "Trialist");
   // NEW: Filter for players sent to admin
   const recommendedPlayers = players.filter(p => p.status === "Recommended");

   return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
         
         {/* ===============================
             SIDE NAVIGATION BAR (LEFT)
         ================================ */}
         <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm h-screen sticky top-0 hidden md:flex">
            <div className="p-6 border-b border-slate-100">
               <h2 className="text-2xl font-extrabold text-emerald-600 tracking-tight">Manager</h2>
               <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Dashboard Portal</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
               <button onClick={() => setActiveTab("applications")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "applications" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                  Applications
               </button>
               <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "settings" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                  Settings
               </button>
            </nav>

            <div className="p-4 border-t border-slate-100">
               <button onClick={() => { localStorage.removeItem("currentUser"); window.location.href = "/login"; }} className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl font-bold transition-colors">
                  Logout
               </button>
            </div>
         </aside>

         {/* ===============================
             MAIN CONTENT AREA (RIGHT)
         ================================ */}
         <main className="flex-1 overflow-y-auto relative w-full">
            
            {/* --- TAB 1: APPLICATIONS --- */}
            {activeTab === "applications" && (
               <div className="py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                  <div className="max-w-7xl mx-auto">

                     {/* --- DASHBOARD HEADER --- */}
                     <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div>
                           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                              Manager Dashboard
                           </h1>
                           <p className="text-slate-500 mt-1">Review applications and manage active trialists.</p>
                        </div>
                        <button
                           onClick={() => {
                              localStorage.removeItem("currentUser");
                              window.location.href = "/login";
                           }}
                           className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold md:hidden"
                        >
                           Logout
                        </button>
                     </header>

                     {/* ===============================
                            NEW APPLICATIONS
                         ================================ */}
                     <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                           <h2 className="text-2xl font-bold text-slate-800">New Applications</h2>
                           <span className="bg-slate-200 text-slate-700 py-1 px-3 rounded-full text-sm font-bold">{newApplications.length}</span>
                        </div>

                        {newApplications.length === 0 ? (
                           <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
                              <p className="font-medium">No new applications at the moment.</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {newApplications.filter(Boolean).map(player => (
                                 <div
                                    key={player.id}
                                    className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden p-5"
                                 >
                                    <div className="flex items-center gap-4 mb-5">
                                       <img
                                          src={getDriveImageUrl(player.player_photo_url)}
                                          alt={player.full_name}
                                          className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-slate-50"
                                         onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }}
                                       />
                                       <div>
                                          <h3 className="font-bold text-lg text-slate-900 leading-tight">
                                             {player.full_name}
                                          </h3>
                                          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider mt-1">
                                             {player.position}
                                          </span>
                                       </div>
                                    </div>

                                    <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                                       <button
                                          onClick={() => setViewPlayer(player)}
                                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl transition-colors duration-200 text-sm"
                                       >
                                          View Profile
                                       </button>
                                       <button
                                          onClick={() => setInvitePlayer(player)}
                                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl shadow-md shadow-emerald-200 transition-all duration-200 active:scale-95 text-sm"
                                       >
                                          Invite Trial
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </section>

                     {/* ===============================
                            TRIALISTS
                         ================================ */}
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
                                 <div
                                    key={player.id}
                                    className="bg-emerald-50/50 border border-emerald-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 flex justify-between items-center p-5"
                                 >
                                    <div className="flex items-center gap-4">
                                       <img
                                          src={getDriveImageUrl(player.player_photo_url)}
                                          alt={player.full_name}
                                          className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-white"
                                          onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Photo"; }}
                                       />
                                       <div>
                                          <h3 className="font-bold text-slate-900 leading-tight">
                                             {player.full_name}
                                          </h3>
                                          <span className="text-sm text-emerald-700 font-medium">
                                             {player.position}
                                          </span>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => setEvaluatingPlayer(player)}
                                       className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all duration-200 active:scale-95 text-sm"
                                    >
                                       Evaluate
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}
                     </section>
                     {/* ===============================
                            RECOMMENDED (PENDING ADMIN)
                         ================================ */}
                     <section className="mt-12">
                        <div className="flex items-center gap-3 mb-6">
                           <h2 className="text-2xl font-bold text-slate-800">Pending Admin Approval</h2>
                           <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-bold">
                              {recommendedPlayers.length}
                           </span>
                        </div>

                        {recommendedPlayers.length === 0 ? (
                           <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
                              <p className="font-medium">No players currently waiting for admin approval.</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {recommendedPlayers.map(player => (
                                 <div
                                    key={player.id}
                                    className="bg-blue-50/50 border border-blue-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col p-5"
                                 >
                                    <div className="flex items-center gap-4 mb-4">
                                       <img
                                          src={getDriveImageUrl(player.player_photo_url)}
                                          alt={player.full_name}
                                          className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-white"
                                          onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }}
                                       />
                                       <div>
                                          <h3 className="font-bold text-slate-900 leading-tight">
                                             {player.full_name}
                                          </h3>
                                          <span className="text-sm text-blue-700 font-medium">
                                             {player.position}
                                          </span>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => setViewPlayer(player)}
                                       className="w-full bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm mt-auto"
                                    >
                                       View Profile
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}
                     </section>
                  </div>
               </div>
            )}

            {/* --- TAB 2: SETTINGS --- */}
            {activeTab === "settings" && (
               <div className="py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                  <div className="max-w-4xl mx-auto">
                     <header className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trial Settings</h1>
                        <p className="text-slate-500 mt-1">Manage the checklist questions required during a player trial.</p>
                     </header>

                     <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                           <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Add New Question
                        </h2>
                        
                        <form onSubmit={handleAddQuestion} className="flex flex-col md:flex-row gap-3 mb-10">
                           <input type="text" placeholder="E.g., Does the player show good defensive awareness?" className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-emerald-500 p-3" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
                           <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md">Add Question</button>
                        </form>

                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 border-t border-slate-100 pt-8">
                           <span className="w-2 h-6 bg-blue-500 rounded-full"></span> Predefined Checklist
                        </h2>

                        {questions.length === 0 ? (
                           <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500">
                              No predefined questions added yet.
                           </div>
                        ) : (
                           <ul className="space-y-3">
                              {questions.map((q, index) => (
                                 <li key={q.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
                                    {editingQuestionId === q.id ? (
                                       <div className="flex-1 flex gap-2">
                                          <input 
                                             type="text" 
                                             className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                             value={editQuestionText}
                                             onChange={(e) => setEditQuestionText(e.target.value)}
                                             autoFocus
                                          />
                                          <button onClick={() => handleSaveEdit(q.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Save</button>
                                          <button onClick={() => setEditingQuestionId(null)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-300">Cancel</button>
                                       </div>
                                    ) : (
                                       <>
                                          <div className="flex items-start gap-3 flex-1">
                                             <span className="bg-blue-50 text-blue-600 font-bold w-7 h-7 flex items-center justify-center rounded-lg text-sm shrink-0">{index + 1}</span>
                                             <p className="text-slate-700 font-medium leading-relaxed">{q.question}</p>
                                          </div>
                                          <div className="flex gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button 
                                                onClick={() => { setEditingQuestionId(q.id); setEditQuestionText(q.question); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"
                                             >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                             </button>
                                             <button 
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"
                                             >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                             </button>
                                          </div>
                                       </>
                                    )}
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  </div>
               </div>
            )}
            
            {/* ===============================
                MODALS
            ================================ */}
            {viewPlayer && (
               <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                  <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

                     {/* Header */}

                     <div className="px-8 py-6 border-b flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">

                        <h2 className="text-2xl font-bold text-gray-800">
                           Applicant Profile
                        </h2>

                        <button
                           onClick={() => setViewPlayer(null)}
                           className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition"
                        >
                           ✕
                        </button>

                     </div>

                     {/* Body */}

                     <div className="p-8 overflow-y-auto space-y-8">

                        {/* PLAYER BASIC INFO */}

                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-gray-50 p-6 rounded-2xl border">

                           <img
                              src={getDriveImageUrl(viewPlayer.player_photo_url)}
                              alt="player"
                              className="w-36 h-36 rounded-2xl object-cover shadow"
                            onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Document"; }}
                           />

                           <div className="space-y-2 text-center md:text-left">

                              <h2 className="text-3xl font-bold text-gray-800">
                                 {viewPlayer.full_name}
                              </h2>

                              <p className="text-emerald-600 font-semibold">
                                 {viewPlayer.position}
                              </p>

                              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">

                                 <span className="bg-white border px-3 py-1 rounded-full">
                                    Age: {viewPlayer.age}
                                 </span>

                                 <span className="bg-white border px-3 py-1 rounded-full">
                                    {viewPlayer.nationality}
                                 </span>

                                 <span className="bg-white border px-3 py-1 rounded-full">
                                    {viewPlayer.gender}
                                 </span>

                              </div>

                           </div>

                        </div>


                        {/* PERSONAL DETAILS */}

                        <div className="bg-white border rounded-2xl p-6 shadow-sm">

                           <h3 className="text-lg font-bold mb-4 text-gray-800">
                              Personal Details
                           </h3>

                           <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">

                              <p><span className="font-semibold">DOB:</span> {viewPlayer.dob}</p>

                              <p><span className="font-semibold">Height:</span> {viewPlayer.height} cm</p>

                              <p><span className="font-semibold">Weight:</span> {viewPlayer.weight} kg</p>

                              <p><span className="font-semibold">Blood Group:</span> {viewPlayer.blood_group}</p>

                              <p><span className="font-semibold">Aadhaar:</span> {viewPlayer.aadhaar_number}</p>

                           </div>

                        </div>


                        {/* FOOTBALL PROFILE */}

                        <div className="bg-white border rounded-2xl p-6 shadow-sm">

                           <h3 className="text-lg font-bold mb-4 text-gray-800">
                              Football Profile
                           </h3>

                           <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">

                              <p><span className="font-semibold">Position:</span> {viewPlayer.position}</p>

                              <p><span className="font-semibold">Strong Foot:</span> {viewPlayer.strong_foot}</p>

                              <p><span className="font-semibold">Experience:</span> {viewPlayer.experience_years} years</p>

                              <p><span className="font-semibold">Preferred Team:</span> {viewPlayer.preferred_team}</p>

                           </div>

                        </div>


                        {/* CONTACT DETAILS */}

                        <div className="bg-white border rounded-2xl p-6 shadow-sm">

                           <h3 className="text-lg font-bold mb-4 text-gray-800">
                              Contact Details
                           </h3>

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

                           <h3 className="text-lg font-bold mb-4 text-gray-800">
                              Emergency Contact
                           </h3>

                           <div className="space-y-2 text-sm text-gray-700">

                              <p><span className="font-semibold">Name:</span> {viewPlayer.emergency_contact_name}</p>

                              <p><span className="font-semibold">Phone:</span> {viewPlayer.emergency_contact_phone}</p>

                           </div>

                        </div>


                        {/* MEDICAL INFO */}

                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">

                           <h3 className="text-lg font-bold mb-4 text-red-700">
                              Medical Information
                           </h3>

                           <div className="space-y-2 text-sm text-gray-700">

                              <p><span className="font-semibold">Injury last 6 months:</span> {viewPlayer.injury_last_6_months}</p>

                              <p><span className="font-semibold">Pain while running:</span> {viewPlayer.pain_running}</p>

                              <p><span className="font-semibold">Medical treatment:</span> {viewPlayer.medical_treatment}</p>

                           </div>

                        </div>


                        {/* DOCUMENTS */}
                        <div>
                           <h3 className="text-lg font-bold mb-4 text-gray-800">
                              Documents
                           </h3>

                           <div className="grid md:grid-cols-2 gap-6">

                              {/* Government ID */}
                              <div className="bg-white border rounded-xl p-4 shadow-sm">
                                 <p className="font-semibold mb-3 text-gray-700">
                                    Government ID
                                 </p>
                                 {viewPlayer.gov_id_url ? (
                                    <iframe
                                       src={viewPlayer.gov_id_url}
                                       className="w-full h-72 border rounded"
                                       title="Government ID"
                                       allow="autoplay"
                                    ></iframe>
                                 ) : (
                                    <img 
                                       src="https://placehold.co/600x400?text=No+Document" 
                                       className="w-full h-72 object-contain border rounded" 
                                       alt="No Government ID" 
                                    />
                                 )}
                              </div>

                              {/* Fitness Certificate */}
                              <div className="bg-white border rounded-xl p-4 shadow-sm">
                                 <p className="font-semibold mb-3 text-gray-700">
                                    Fitness Certificate
                                 </p>
                                 {viewPlayer.fitness_certificate_url ? (
                                    <iframe
                                       src={viewPlayer.fitness_certificate_url}
                                       className="w-full h-72 border rounded"
                                       title="Fitness Certificate"
                                       allow="autoplay"
                                    ></iframe>
                                 ) : (
                                    <img 
                                       src="https://placehold.co/600x400?text=No+Document" 
                                       className="w-full h-72 object-contain border rounded" 
                                       alt="No Fitness Certificate" 
                                    />
                                 )}
                              </div>

                           </div>
                        </div>

                     </div>

                  </div>

               </div>
            )}
            {/* ===============================
                   INVITE TRIAL MODAL (ADDED)
                ================================ */}

            {invitePlayer && (
               <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

                  <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">

                     <h2 className="text-xl font-bold mb-4">
                        Invite Player for Trial
                     </h2>

                     <p className="mb-4 text-slate-600">
                        {invitePlayer.full_name}
                     </p>

                     <div className="space-y-4">

                        <input
                           type="date"
                           className="w-full border p-2 rounded"
                           value={trialForm.trialDate}
                           onChange={(e) => setTrialForm({ ...trialForm, trialDate: e.target.value })}
                        />

                        <input
                           type="time"
                           className="w-full border p-2 rounded"
                           value={trialForm.trialTime}
                           onChange={(e) => setTrialForm({ ...trialForm, trialTime: e.target.value })}
                        />

                        <input
                           type="text"
                           placeholder="Venue"
                           className="w-full border p-2 rounded"
                           value={trialForm.venue}
                           onChange={(e) => setTrialForm({ ...trialForm, venue: e.target.value })}
                        />

                     </div>

                     <div className="flex gap-3 mt-6">

                        <button
                           onClick={() => setInvitePlayer(null)}
                           className="flex-1 bg-gray-300 py-2 rounded"
                        >
                           Cancel
                        </button>

                        <button
                           onClick={handleInviteTrial}
                           className="flex-1 bg-emerald-600 text-white py-2 rounded"
                        >
                           Send Invite
                        </button>

                     </div>

                  </div>
               </div>
            )}

            {/* ===============================
                   TRIAL EVALUATION MODAL
                ================================ */}

            {evaluatingPlayer && (
               <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
                  <div className="bg-white p-0 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                     <TrialForm
                        player={evaluatingPlayer}
                        clubId={clubId}
                        questions={questions}
                        onClose={() => setEvaluatingPlayer(null)}
                        onSuccess={() => {
                           setEvaluatingPlayer(null);
                           fetchApplications();
                        }}
                     />
                  </div>
               </div>
            )}

         </main>
      </div>
   );
};

export default ManagerDashboard;