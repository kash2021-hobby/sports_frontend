import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Activity, Clock, Flag, FileWarning, Trophy, ArrowRightLeft, User, LogOut, Calendar, MapPin } from 'lucide-react';

export default function RefereeDashboard({ user }) {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveMatch, setLiveMatch] = useState(null);
    const [timeInSeconds, setTimeInSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [currentHalf, setCurrentHalf] = useState(1);
    const timerRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [eventModal, setEventModal] = useState({ isOpen: false, teamId: null, type: '', teamName: '' });
    const [subOffPlayer, setSubOffPlayer] = useState("");
    const [subOnPlayer, setSubOnPlayer] = useState("");
    
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        if (user?.id) fetchMatches();
    }, [user]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeInSeconds((prev) => prev + 1);
            }, 1000); 
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/referee/${user.id}/matches`);
            const data = await res.json();
            
            console.log("Raw Backend Data:", data); 

            if (res.ok) {
                const matchArray = Array.isArray(data) ? data : (data.results || data.matches || []);
                const sortedMatches = [...matchArray].sort((a, b) => b.id - a.id);
                setMatches(sortedMatches);
            } else {
                console.error("Backend Error:", data);
            }
        } catch (error) {
            console.error("Error fetching matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('currentUser');
            window.location.href = '/login'; 
        }
    };

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    
    const currentMinute = Math.floor(timeInSeconds / 60);
    const team1Score = events.filter(e => e.type === 'Goal' && e.teamId === liveMatch?.Team1?.id).length;
    const team2Score = events.filter(e => e.type === 'Goal' && e.teamId === liveMatch?.Team2?.id).length;

    const hasMatchStarted = isRunning || timeInSeconds > 0;

    const handleStartMatch = async (match) => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/matches/${match.id}/toggle-live`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!res.ok) {
                console.error("Failed to sync live status to server");
            }
        } catch (error) {
            console.error("Network error syncing live status:", error);
        }

        setLiveMatch(match);
        setTimeInSeconds(0);
        setEvents([]);
        setCurrentHalf(1);
        setIsRunning(false);
    };

    // 🌟 HELPER FUNCTION: Syncs scores AND timeline events to the database instantly
    const syncLiveToDatabase = async (updatedEventsList) => {
        const newTeam1Score = updatedEventsList.filter(e => e.type === 'Goal' && e.teamId === liveMatch?.Team1?.id).length;
        const newTeam2Score = updatedEventsList.filter(e => e.type === 'Goal' && e.teamId === liveMatch?.Team2?.id).length;

        try {
            await fetch(`https://backend.dhsa.co.in/admin/matches/${liveMatch.id}/update-score`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    team1_score: newTeam1Score, 
                    team2_score: newTeam2Score,
                    match_events: updatedEventsList // Sends the full timeline!
                })
            });
        } catch (error) {
            console.error("Live sync error:", error);
        }
    };

    // 🌟 UPDATED: Handle Goals, Yellow Cards, Red Cards
    const handleAddStandardEvent = async (playerId, playerName) => {
        const newEvent = {
            id: Date.now(),
            minute: currentMinute,
            type: eventModal.type, 
            teamId: eventModal.teamId,
            playerId,
            playerName
        };

        const updatedEvents = [newEvent, ...events];
        setEvents(updatedEvents); 
        closeModal();

        // Instantly push to database
        await syncLiveToDatabase(updatedEvents);
    };

    // 🌟 UPDATED: Handle Substitutions
    const handleAddSubstitution = async () => {
        if (!subOffPlayer || !subOnPlayer) {
            alert("Please select both players.");
            return;
        }
        
        const teamPlayers = eventModal.teamId === liveMatch.Team1.id ? liveMatch.Team1.Players : liveMatch.Team2.Players;
        const playerOff = teamPlayers.find(p => String(p.id) === subOffPlayer);
        const playerOn = teamPlayers.find(p => String(p.id) === subOnPlayer);

        const newEvent = {
            id: Date.now(),
            minute: currentMinute,
            type: 'Substitution',
            teamId: eventModal.teamId,
            playerOffId: playerOff.id,
            playerOffName: playerOff.full_name,
            playerOnId: playerOn.id,
            playerOnName: playerOn.full_name
        };
        
        const updatedEvents = [newEvent, ...events];
        setEvents(updatedEvents);
        closeModal();

        // Instantly push to database
        await syncLiveToDatabase(updatedEvents);
    };

    const closeModal = () => {
        setEventModal({ isOpen: false, teamId: null, type: '', teamName: '' });
        setSubOffPlayer("");
        setSubOnPlayer("");
    };

    const handleEndMatch = async () => {
        if (!window.confirm("End match and lock final score?")) return;
        setIsRunning(false);
        try {
            const res = await fetch(`https://backend.dhsa.co.in/referee/matches/${liveMatch.id}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    team1_score: team1Score, 
                    team2_score: team2Score,
                    match_events: JSON.stringify(events) 
                })
            });
            if (res.ok) {
                alert("Match successfully completed!");
                setLiveMatch(null);
                fetchMatches();
            }
        } catch (error) {
            alert("Network error.");
        }
    };

    const groupedMatches = {
        'Knockout': [],
        'League': [],
        'Group': []
    };

    matches.forEach(m => {
        const type = m.match_type || 'Knockout';
        if (groupedMatches[type]) {
            groupedMatches[type].push(m);
        } else {
            groupedMatches['Knockout'].push(m);
        }
    });

    const availableTypes = Object.keys(groupedMatches).filter(type => groupedMatches[type].length > 0);

    if (loading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading Duty Desk...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-40 shrink-0">
                <div className="flex items-center gap-2 font-black text-xl tracking-tight">
                    <Activity className="text-emerald-400 w-6 h-6" />
                    <span className="hidden sm:inline">Referee</span><span className="text-emerald-400 sm:text-white">Pro</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden md:block text-sm font-medium text-slate-300">Official: {user?.full_name || 'Match Official'}</span>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-all"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-8">
                {liveMatch ? (
                    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6 pb-20">
                        {/* Live Match UI goes here */}
                        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-48 h-48 animate-pulse"/></div>
                            <div className="text-center mb-6">
                                <span className="bg-rose-500 text-white px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full animate-pulse">Live • </span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
                                <div className="w-full md:flex-1 text-center md:text-right"><h2 className="text-2xl md:text-4xl font-black truncate px-2">{liveMatch.Team1?.name}</h2></div>
                                <div className="flex flex-col items-center shrink-0">
                                    <div className="text-5xl md:text-7xl font-black tracking-tighter text-emerald-400 font-mono leading-none">{team1Score} - {team2Score}</div>
                                    <div className={`text-3xl md:text-4xl font-black font-mono mt-3 bg-slate-800/80 px-6 py-2 md:px-8 md:py-3 rounded-2xl border ${isRunning ? 'border-emerald-500 text-emerald-300' : 'border-slate-600 text-slate-400'}`}>{formatTime(timeInSeconds)}</div>
                                </div>
                                <div className="w-full md:flex-1 text-center md:text-left"><h2 className="text-2xl md:text-4xl font-black truncate px-2">{liveMatch.Team2?.name}</h2></div>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-3 mt-8 md:mt-10 relative z-10">
                                <button onClick={() => setIsRunning(!isRunning)} className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-8 py-3 rounded-full font-black transition-all ${isRunning ? 'bg-amber-50 text-amber-950 hover:bg-amber-100' : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'}`}>{isRunning ? <><Pause className="w-5 h-5"/> Pause Match</> : <><Play className="w-5 h-5"/> {timeInSeconds > 0 ? 'Resume Match' : 'Start Match'}</>}</button>
                                <button onClick={() => setCurrentHalf(currentHalf === 1 ? 2 : 1)} className="flex-1 md:flex-none bg-slate-800 border border-slate-600 hover:bg-slate-700 px-6 py-3 rounded-full font-bold text-slate-300">{currentHalf === 1 ? 'Start 2nd Half' : 'Back to 1st Half'}</button>
                                <button onClick={handleEndMatch} className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex justify-center items-center gap-2 transition-all"><Square className="w-4 h-4 fill-current"/> End Match</button>
                            </div>
                        </div>

                        {!hasMatchStarted && (
                            <div className="bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm">
                                <FileWarning className="w-5 h-5" />
                                Please press 'Start Match' above before recording goals or cards.
                            </div>
                        )}

                        <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${!hasMatchStarted ? 'opacity-50' : 'opacity-100'}`}>
                            {/* TEAM 1 CONTROLS */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                                <h3 className="font-black text-lg text-center border-b pb-3 truncate">{liveMatch.Team1?.name}</h3>
                                <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team1.id, type: 'Goal', teamName: liveMatch.Team1.name })} className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-xl border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"><Activity className="w-5 h-5"/> Add Goal</button>
                                <div className="flex gap-2">
                                    <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team1.id, type: 'Yellow Card', teamName: liveMatch.Team1.name })} className="flex-1 bg-amber-50 text-amber-700 font-bold py-3 rounded-xl border border-amber-100 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Yellow</button>
                                    <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team1.id, type: 'Red Card', teamName: liveMatch.Team1.name })} className="flex-1 bg-rose-50 text-rose-700 font-bold py-3 rounded-xl border border-rose-100 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Red</button>
                                </div>
                                <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team1.id, type: 'Substitution', teamName: liveMatch.Team1.name })} className="w-full bg-blue-50 text-blue-700 font-bold py-4 rounded-xl border border-blue-100 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"><ArrowRightLeft className="w-5 h-5"/> Substitution</button>
                            </div>

                            {/* TIMELINE */}
                            <div className="bg-slate-50 rounded-3xl p-4 lg:col-span-2 h-[400px] flex flex-col border border-slate-200">
                                <h3 className="font-black text-slate-800 text-center mb-4">Match Timeline</h3>
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar px-2">
                                    {events.length === 0 ? <p className="text-center text-slate-400 mt-20 font-medium">No events recorded yet.</p> :
                                        events.map(ev => (
                                            <div key={ev.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 animate-in slide-in-from-left-2">
                                                <div className="font-black text-slate-400 w-8">{ev.minute}'</div>
                                                <div className={`w-3 h-8 rounded-full ${ev.type === 'Goal' ? 'bg-emerald-500' : ev.type === 'Substitution' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
                                                <div className="flex-1 text-sm">
                                                    <p className="font-black text-slate-800">{ev.type}</p>
                                                    <p className="text-slate-500 font-medium">{ev.type === 'Substitution' ? `${ev.playerOnName} for ${ev.playerOffName}` : ev.playerName}</p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* TEAM 2 CONTROLS */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                                <h3 className="font-black text-lg text-center border-b pb-3 truncate">{liveMatch.Team2?.name}</h3>
                                <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team2.id, type: 'Goal', teamName: liveMatch.Team2.name })} className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-xl border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"><Activity className="w-5 h-5"/> Add Goal</button>
                                <div className="flex gap-2">
                                    <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team2.id, type: 'Yellow Card', teamName: liveMatch.Team2.name })} className="flex-1 bg-amber-50 text-amber-700 font-bold py-3 rounded-xl border border-amber-100 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Yellow</button>
                                    <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team2.id, type: 'Red Card', teamName: liveMatch.Team2.name })} className="flex-1 bg-rose-50 text-rose-700 font-bold py-3 rounded-xl border border-rose-100 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Red</button>
                                </div>
                                <button disabled={!hasMatchStarted} onClick={() => setEventModal({ isOpen: true, teamId: liveMatch.Team2.id, type: 'Substitution', teamName: liveMatch.Team2.name })} className="w-full bg-blue-50 text-blue-700 font-bold py-4 rounded-xl border border-blue-100 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"><ArrowRightLeft className="w-5 h-5"/> Substitution</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto space-y-8">
                        <header>
                            <h1 className="text-3xl font-extrabold text-slate-900">Official Assignments</h1>
                            <p className="text-slate-500 font-medium mt-1">Select a match to launch the live referee controller.</p>
                        </header>
                        
                        {availableTypes.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                <button 
                                    onClick={() => setActiveFilter('All')} 
                                    className={`px-5 py-2.5 rounded-full font-extrabold text-sm whitespace-nowrap transition-all ${activeFilter === 'All' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                                >
                                    All Matches ({matches.length})
                                </button>
                                {availableTypes.map(type => (
                                    <button 
                                        key={type} 
                                        onClick={() => setActiveFilter(type)} 
                                        className={`px-5 py-2.5 rounded-full font-extrabold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === type ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                                    >
                                        {type} 
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === type ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {groupedMatches[type].length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {matches.length === 0 ? (
                            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400">
                                <Flag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-bold text-lg">No matches assigned to you yet.</p>
                            </div>
                        ) : (
                            Object.entries(groupedMatches)
                                .filter(([matchType]) => activeFilter === 'All' || activeFilter === matchType)
                                .map(([matchType, typeMatches]) => {
                                    if (typeMatches.length === 0) return null;
                                    return (
                                        <div key={matchType} className="space-y-6 animate-in fade-in duration-300">
                                            
                                            {activeFilter === 'All' && (
                                                <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-2 mt-4">
                                                    <Trophy className="w-5 h-5 text-emerald-500" />
                                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">{matchType} Matches</h2>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {typeMatches.map((match) => (
                                                    <div key={match.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all group">
                                                        
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center gap-2">
                                                                {activeFilter === 'All' && <span className="bg-slate-100 text-slate-400 px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md">{matchType}</span>}
                                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full">{match.round_name}</span>
                                                            </div>
                                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${match.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{match.status}</span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-bold text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                            <span className="flex items-center gap-1 md:gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm"><Calendar className="w-3.5 h-3.5 text-emerald-500"/> {match.match_date || "TBD"}</span>
                                                            <span className="flex items-center gap-1 md:gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm"><Clock className="w-3.5 h-3.5 text-blue-500"/> {match.match_time || "TBD"}</span>
                                                            <span className="flex items-center gap-1 md:gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm truncate max-w-[120px] md:max-w-full"><MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0"/> <span className="truncate">{match.venue || "TBD"}</span></span>
                                                        </div>

                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex-1 text-center font-black text-lg md:text-xl text-slate-800 truncate px-2" title={match.Team1?.name}>{match.Team1?.name || "TBD"}</div>
                                                            <div className="px-2 md:px-4 text-slate-300 italic font-black">VS</div>
                                                            <div className="flex-1 text-center font-black text-lg md:text-xl text-slate-800 truncate px-2" title={match.Team2?.name}>{match.Team2?.name || "TBD"}</div>
                                                        </div>

                                                        {match.status !== 'Completed' ? (
                                                            <button onClick={() => handleStartMatch(match)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 active:scale-95 transition-all group-hover:translate-y-[-2px]"><Play className="w-4 h-4"/> Start Live Control</button>
                                                        ) : (
                                                            <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-xl text-center border border-emerald-100">Final Score: {match.team1_score} - {match.team2_score}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                            })
                        )}
                    </div>
                )}
            </main>

            {/* EVENT MODALS */}
            {eventModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95">
                        <div className={`p-6 text-white text-center shrink-0 sm:rounded-t-3xl ${eventModal.type === 'Goal' ? 'bg-emerald-600' : eventModal.type === 'Substitution' ? 'bg-blue-600' : 'bg-rose-600'}`}>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">{eventModal.teamName}</p>
                            <h3 className="text-2xl font-black">{eventModal.type}</h3>
                        </div>
                        <div className="p-6 overflow-y-auto bg-slate-50 flex-1 custom-scrollbar">
                            {eventModal.type === 'Substitution' ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">Player OFF</label>
                                    <select value={subOffPlayer} onChange={(e) => setSubOffPlayer(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-white font-semibold outline-none focus:border-blue-500">
                                        <option value="">-- Select Player --</option>
                                        {(eventModal.teamId === liveMatch.Team1.id ? liveMatch.Team1.Players : liveMatch.Team2.Players)?.map(p => (<option key={p.id} value={p.id}>{p.full_name}</option>))}
                                    </select>
                                    
                                    <label className="block text-sm font-bold text-slate-700 pt-2">Player ON</label>
                                    <select value={subOnPlayer} onChange={(e) => setSubOnPlayer(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-white font-semibold outline-none focus:border-blue-500">
                                        <option value="">-- Select Player --</option>
                                        {(eventModal.teamId === liveMatch.Team1.id ? liveMatch.Team1.Players : liveMatch.Team2.Players)?.map(p => (<option key={p.id} value={p.id}>{p.full_name}</option>))}
                                    </select>
                                    
                                    <button onClick={handleAddSubstitution} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl mt-4 shadow-md transition-colors">Confirm Substitution</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {(eventModal.teamId === liveMatch.Team1.id ? liveMatch.Team1.Players : liveMatch.Team2.Players)?.map(p => (
                                        <button key={p.id} onClick={() => handleAddStandardEvent(p.id, p.full_name)} className="w-full flex justify-between items-center bg-white p-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors">
                                            <span>{p.full_name}</span>
                                            <span className="text-slate-400 text-[10px] uppercase tracking-wider">{p.assigned_position}</span>
                                        </button>
                                    ))}
                                    <div className="my-4 border-b border-slate-200 w-full"></div>
                                    <button onClick={() => handleAddStandardEvent('unknown', 'Unknown')} className="text-slate-400 italic text-sm font-medium hover:text-slate-600 transition-colors">Record as 'Unknown Player'</button>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100 sm:rounded-b-3xl">
                            <button onClick={closeModal} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
