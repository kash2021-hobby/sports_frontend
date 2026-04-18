import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Calendar, Users, MapPin, Coins, CheckCircle, UploadCloud, ChevronRight, ShieldAlert, ArrowLeft, Clock } from 'lucide-react';

export default function TournamentHub({ clubId }) {
    const [tournaments, setTournaments] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    // Registration Flow State
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [step, setStep] = useState(1); // 1: Info, 2: Starters, 3: Subs, 4: Payment
    const [selectedStarters, setSelectedStarters] = useState([]);
    const [selectedSubs, setSelectedSubs] = useState([]);
    
    // Payment State
    const receiptRef = useRef(null);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

  const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };
        if (clubId) {
            fetchData();
        }
    }, [clubId]);

    const fetchData = async () => {
        try {
            // Fetch Tournaments
            const tourneyRes = await fetch("https://backend.dhsa.co.in/tournaments");
            if (tourneyRes.ok) setTournaments(await tourneyRes.json());

            // Fetch Manager's Permanent Team
            const teamRes = await fetch(`https://backend.dhsa.co.in/manager/team/${clubId}`);
            if (teamRes.ok) setMyTeam(await teamRes.json());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle player selection for Starters (Max 11)
    const toggleStarter = (playerId) => {
        if (selectedStarters.includes(playerId)) {
            setSelectedStarters(selectedStarters.filter(id => id !== playerId));
        } else {
            if (selectedStarters.length >= 11) {
                alert("You can only select 11 starting players.");
                return;
            }
            setSelectedStarters([...selectedStarters, playerId]);
        }
    };

    // Toggle player selection for Subs (Max 5)
    const toggleSub = (playerId) => {
        if (selectedSubs.includes(playerId)) {
            setSelectedSubs(selectedSubs.filter(id => id !== playerId));
        } else {
            if (selectedSubs.length >= 5) {
                alert("You can only select up to 5 substitutes.");
                return;
            }
            setSelectedSubs([...selectedSubs, playerId]);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    const submitRegistration = async () => {
        if (!receiptFile && selectedTournament.entry_fee > 0) {
            alert("Please upload your payment receipt/screenshot.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("tournament_id", selectedTournament.id);
        formData.append("team_id", myTeam.id);
        formData.append("roster_data", JSON.stringify({ starters: selectedStarters, subs: selectedSubs }));
        
        if (receiptFile) {
            formData.append("receipt_file", receiptFile);
        }

        try {
            const res = await fetch("https://backend.dhsa.co.in/manager/tournaments/register", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                alert("Registration submitted! Awaiting Admin approval.");
                setSelectedTournament(null);
                setStep(1);
                setSelectedStarters([]);
                setSelectedSubs([]);
                setReceiptFile(null);
                setReceiptPreview(null);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to register.");
            }
        } catch (error) {
            alert("Server Error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🌟 HELPER TO CHECK DEADLINE
    const isDeadlinePassed = (deadlineStr) => {
        if (!deadlineStr) return false;
        const deadlineDate = new Date(deadlineStr);
        deadlineDate.setHours(23, 59, 59, 999);
        const now = new Date();
        return now > deadlineDate;
    };

    if (loading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading Tournaments...</div>;

    // Group players by position for UI
    const groupedPlayers = { Forward: [], Midfielder: [], Defender: [], Goalkeeper: [] };
    if (myTeam && myTeam.players) {
        myTeam.players.forEach(p => {
            const pos = p.assigned_position || 'Midfielder';
            if (groupedPlayers[pos]) groupedPlayers[pos].push(p);
        });
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-8 relative">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Tournament Hub</h1>
                    <p className="text-slate-500 mt-1">Discover competitions and register your squad.</p>
                </div>
            </header>

            {/* TEAM STATUS CHECK */}
            {(!myTeam || myTeam.status !== "Approved") && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                    <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                        <h3 className="font-bold text-amber-800 text-lg">Team Approval Required</h3>
                        <p className="text-amber-700 text-sm mt-1">
                            {!myTeam 
                                ? "You must create a Permanent Team before you can join tournaments." 
                                : "Your Permanent Team is currently awaiting Admin approval. You can browse tournaments, but cannot register until your roster is verified."}
                        </p>
                    </div>
                </div>
            )}

            {/* TOURNAMENT LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tournaments.map(t => {
                    const deadlinePassed = isDeadlinePassed(t.registration_deadline);
                    // 🌟 BOTH conditions must be true to register!
                    const canRegister = t.status === "Registration Open" && !deadlinePassed;

                    return (
                        <div key={t.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col relative">
                            <div className="h-48 bg-slate-200 relative overflow-hidden">
                                <img src={getDriveImageUrl(t.banner_url)} alt="Banner" className={`w-full h-full object-cover transition-transform duration-500 ${canRegister ? "group-hover:scale-105" : "grayscale-[0.3]"}`} />
                                
                                {/* BADGE LOGIC */}
                                {canRegister ? (
                                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-md animate-pulse flex items-center gap-1">
                                        Open
                                    </div>
                                ) : deadlinePassed && t.status === "Registration Open" ? (
                                     <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Closed
                                    </div>
                                ) : (
                                    <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-md">
                                        {t.status === "Pending Setup" ? "Upcoming" : "Ongoing"}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-extrabold text-xl text-slate-900 leading-tight mb-3">{t.name}</h3>
                                <div className="space-y-2 mb-6 flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-slate-600 text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400"/> {t.city} • {t.venue}</p>
                                    <p className="text-slate-600 text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400"/> {new Date(t.start_date).toLocaleDateString()}</p>
                                    <p className="text-slate-600 text-sm font-medium flex items-center gap-2"><Coins className="w-4 h-4 text-slate-400"/> Entry: {t.entry_fee > 0 ? `₹${t.entry_fee}` : 'Free'}</p>
                                </div>
                                
                                {/* 🌟 DYNAMIC BUTTON LOGIC */}
                                {canRegister ? (
                                    <button 
                                        onClick={() => { setSelectedTournament(t); setStep(1); }}
                                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        View Details & Register
                                    </button>
                                ) : (
                                    <button 
                                        disabled
                                        className="w-full bg-slate-100 text-slate-400 border border-slate-200 font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {deadlinePassed && t.status === "Registration Open" 
                                            ? "Deadline Passed" 
                                            : t.status === "Ongoing" 
                                                ? "Tournament Ongoing" 
                                                : "Registrations Closed"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* REGISTRATION WIZARD MODAL */}
            {selectedTournament && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                            <div>
                                <h2 className="text-xl font-extrabold">{selectedTournament.name} Registration</h2>
                                <p className="text-sm font-medium text-slate-400">Step {step} of 4</p>
                            </div>
                            <button onClick={() => setSelectedTournament(null)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">✕</button>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex bg-slate-50 border-b border-slate-100 overflow-x-auto shrink-0">
                            {['Tournament Info', 'Starting XI', 'Substitutes', 'Payment'].map((label, idx) => (
                                <div key={label} className={`flex-1 text-center py-3 px-4 min-w-[120px] text-xs font-bold uppercase transition-colors ${step >= idx + 1 ? 'text-emerald-600 border-b-2 border-emerald-500 bg-white' : 'text-slate-400'}`}>
                                    {idx + 1}. {label}
                                </div>
                            ))}
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                            
                            {step === 1 && (
                                <div className="space-y-6">
                                    {/* Banner */}
                                    <img src={getDriveImageUrl(selectedTournament.banner_url)} className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-sm border border-slate-200" alt="Banner" />
                                    
                                    {/* Description */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">About Tournament</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedTournament.description}</p>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        
                                        {/* Logistics & Dates */}
                                        <div className="space-y-3 text-sm font-medium text-slate-700 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <h4 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500"/> Logistics & Dates
                                            </h4>
                                            <p className="flex justify-between items-center">
                                                <span>Reg. Deadline:</span> 
                                                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">{new Date(selectedTournament.registration_deadline).toLocaleDateString()}</span>
                                            </p>
                                            <p className="flex justify-between"><span>Start Date:</span> <span className="font-bold text-slate-900">{new Date(selectedTournament.start_date).toLocaleDateString()}</span></p>
                                            <p className="flex justify-between"><span>End Date:</span> <span className="font-bold text-slate-900">{new Date(selectedTournament.end_date).toLocaleDateString()}</span></p>
                                            <p className="flex justify-between items-start mt-2 pt-2 border-t border-slate-100">
                                                <span>Location:</span> 
                                                <span className="font-bold text-slate-900 text-right max-w-[60%]">{selectedTournament.venue}, {selectedTournament.city}</span>
                                            </p>
                                        </div>

                                        {/* Rules & Eligibility */}
                                        <div className="space-y-3 text-sm font-medium text-slate-700 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <h4 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-emerald-500"/> Structure & Eligibility
                                            </h4>
                                            <p className="flex justify-between"><span>Format:</span> <span className="font-bold text-slate-900">{selectedTournament.format}</span></p>
                                            <p className="flex justify-between"><span>Category & Gender:</span> <span className="font-bold text-slate-900">{selectedTournament.age_category} • {selectedTournament.gender}</span></p>
                                            <p className="flex justify-between"><span>Team Limit:</span> <span className="font-bold text-slate-900">Max {selectedTournament.max_teams} Teams</span></p>
                                            <p className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                                <span>Entry Fee:</span> 
                                                <span className="font-black text-emerald-600 text-base">{selectedTournament.entry_fee > 0 ? `₹${selectedTournament.entry_fee}` : 'Free'}</span>
                                            </p>
                                        </div>

                                        {/* Prize Pool Highlight */}
                                        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 rounded-2xl border border-amber-200 shadow-sm gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-inner">
                                                    <Trophy className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-0.5">Prize Pool & Awards</p>
                                                    <p className="text-xl font-extrabold text-amber-900">{selectedTournament.prize_pool}</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* STEP 2: STARTING XI */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                                        <h3 className="font-bold text-blue-900 text-sm md:text-base">Select Starting XI</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedStarters.length === 11 ? 'bg-emerald-500 text-white' : 'bg-blue-200 text-blue-800'}`}>
                                            {selectedStarters.length} / 11 Selected
                                        </span>
                                    </div>

                                    {Object.entries(groupedPlayers).map(([position, players]) => (
                                        <div key={position} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <h4 className="font-extrabold text-slate-800 uppercase text-sm mb-4 border-b border-slate-100 pb-2">{position}s</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {players.map(p => (
                                                    <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedStarters.includes(p.id) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                                        <input type="checkbox" className="hidden" checked={selectedStarters.includes(p.id)} onChange={() => toggleStarter(p.id)} />
                                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-900 shrink-0 shadow-sm">
                                                            {p.TeamPlayer?.jersey_number || '-'}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-bold text-slate-900 text-sm truncate">{p.full_name}</p>
                                                        </div>
                                                        {selectedStarters.includes(p.id) && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto shrink-0"/>}
                                                    </label>
                                                ))}
                                                {players.length === 0 && <p className="text-xs text-slate-400 font-medium col-span-full">No players assigned to this position.</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* STEP 3: SUBSTITUTES */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                                        <h3 className="font-bold text-amber-900 text-sm md:text-base">Select Substitutes (Max 5)</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedSubs.length > 0 ? 'bg-emerald-500 text-white' : 'bg-amber-200 text-amber-800'}`}>
                                            {selectedSubs.length} / 5 Selected
                                        </span>
                                    </div>

                                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {myTeam.players.filter(p => !selectedStarters.includes(p.id)).map(p => (
                                            <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedSubs.includes(p.id) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                                <input type="checkbox" className="hidden" checked={selectedSubs.includes(p.id)} onChange={() => toggleSub(p.id)} />
                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-900 shrink-0">
                                                    {p.TeamPlayer?.jersey_number || '-'}
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-bold text-slate-900 text-sm truncate">{p.full_name}</p>
                                                    <p className="text-xs text-slate-500">{p.assigned_position}</p>
                                                </div>
                                                {selectedSubs.includes(p.id) && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto shrink-0"/>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: PAYMENT */}
                            {step === 4 && (
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Registration Fee</h3>
                                        <div className="text-4xl md:text-5xl font-black text-emerald-600 mb-6">₹{selectedTournament.entry_fee}</div>
                                        
                                        {selectedTournament.entry_fee > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-8 text-left mt-8 border-t border-slate-100 pt-8">
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-slate-900 text-lg">Scan & Pay</h4>
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block w-full text-center">
                                                        <img src={getDriveImageUrl(selectedTournament.qr_code_url)} alt="QR Code" className="w-48 h-48 mx-auto object-contain" />
                                                    </div>
                                                    {selectedTournament.upi_id && (
                                                        <p className="text-sm font-medium text-slate-600 bg-slate-100 p-3 rounded-xl text-center">UPI ID: <span className="font-bold text-slate-900">{selectedTournament.upi_id}</span></p>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-slate-900 text-lg">Upload Receipt</h4>
                                                    <p className="text-sm text-slate-500">Please upload a screenshot of your successful transaction or an image of your offline cash receipt.</p>
                                                    
                                                    <div onClick={() => receiptRef.current.click()} className="w-full h-48 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center bg-emerald-50 cursor-pointer overflow-hidden group">
                                                        {receiptPreview ? (
                                                            <img src={receiptPreview} className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-opacity" />
                                                        ) : (
                                                            <>
                                                                <UploadCloud className="w-10 h-10 text-emerald-600 mb-2" />
                                                                <span className="text-sm font-bold text-emerald-700">Select Image</span>
                                                            </>
                                                        )}
                                                        <input type="file" accept="image/*" ref={receiptRef} onChange={handleFileChange} className="hidden" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl font-bold border border-emerald-200">
                                                This tournament is free! Click submit to finish your registration.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 md:px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                            {step > 1 ? (
                                <button onClick={() => setStep(step - 1)} className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-2 text-sm md:text-base">
                                    <ArrowLeft className="w-4 h-4"/> <span className="hidden sm:inline">Back</span>
                                </button>
                            ) : (
                                <button onClick={() => setSelectedTournament(null)} className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm md:text-base">
                                    Cancel
                                </button>
                            )}
                            
                            {step < 4 ? (
                                <button 
                                    onClick={() => {
                                        if (!myTeam || myTeam.status !== "Approved") {
                                            alert("Your Permanent Team must be approved by the admin before you can register.");
                                            return;
                                        }
                                        if (step === 2 && (selectedStarters.length === 0 || selectedStarters.length > 11)) {
                                            alert("You must select exactly 11 starting players.");
                                            return;
                                        }
                                        setStep(step + 1);
                                    }} 
                                    className="px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-2 text-sm md:text-base"
                                >
                                    Next <ChevronRight className="w-4 h-4"/>
                                </button>
                            ) : (
                                <button 
                                    onClick={submitRegistration}
                                    disabled={isSubmitting}
                                    className="px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-70 active:scale-95 transition-all text-sm md:text-base"
                                >
                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5"/> {isSubmitting ? "Submitting..." : "Submit Registration"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
