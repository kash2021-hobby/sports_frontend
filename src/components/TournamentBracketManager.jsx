import React, { useState, useEffect } from 'react';
import { ArrowLeft, Swords, Trophy, Activity, CheckCircle, Clock, UserCheck, ListOrdered, BarChart3, HelpCircle, Edit3, Save, AlertCircle, Calendar, MapPin } from 'lucide-react';

export default function TournamentBracketManager({ tournament, onClose }) {
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]); 
    const [activeTab, setActiveTab] = useState('Matches'); 
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    
    // Modal State
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [refereeId, setRefereeId] = useState("");
    const [scores, setScores] = useState({ team1: 0, team2: 0 });
    const [referees, setReferees] = useState([]);
    
    const [schedule, setSchedule] = useState({ date: "", time: "", venue: "" });
    const [isEditingTeams, setIsEditingTeams] = useState(false);
    const [editTeams, setEditTeams] = useState({ team1_id: "", team2_id: "" });

    const isBracketLocked = matches.some(m => 
        m.referee_id || 
        m.status === 'Live' || 
        (m.status === 'Completed' && m.team1_id !== null && m.team2_id !== null)
    );

    useEffect(() => {
        fetchData();
        fetchReferees();
    }, [tournament.id]);

    useEffect(() => {
        if (selectedMatch) {
            setEditTeams({
                team1_id: selectedMatch.team1_id || "",
                team2_id: selectedMatch.team2_id || ""
            });
            setIsEditingTeams(false);
            setScores({ team1: selectedMatch.team1_score || 0, team2: selectedMatch.team2_score || 0 });
            setRefereeId(selectedMatch.referee_id || "");
            
            setSchedule({
                date: selectedMatch.match_date || "",
                time: selectedMatch.match_time || "",
                venue: selectedMatch.venue || tournament.venue || ""
            });
        }
    }, [selectedMatch, tournament.venue]);

    const fetchReferees = async () => {
        try {
            const res = await fetch('https://backend.dhsa.co.in/admin/referees');
            if (res.ok) setReferees(await res.json());
        } catch (error) {
            console.error("Error fetching referees:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const resMatches = await fetch(`https://backend.dhsa.co.in/admin/tournaments/${tournament.id}/matches`);
            if (resMatches.ok) setMatches(await resMatches.json());

            if (tournament.format !== 'Knockout') {
                const resStandings = await fetch(`https://backend.dhsa.co.in/tournaments/${tournament.id}/standings`);
                if (resStandings.ok) setStandings(await resStandings.json());
            }
        } catch (error) {
            console.error("Error fetching tournament data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getUniqueTeams = () => {
        const teamsMap = new Map();
        matches.forEach(m => {
            if (m.team1_id && m.team1_name) teamsMap.set(m.team1_id, { id: m.team1_id, name: m.team1_name });
            if (m.team2_id && m.team2_name) teamsMap.set(m.team2_id, { id: m.team2_id, name: m.team2_name });
        });
        return Array.from(teamsMap.values());
    };
    const tournamentTeams = getUniqueTeams();

    const handleSaveTeams = async () => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/matches/${selectedMatch.id}/edit-teams`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    team1_id: editTeams.team1_id || null, 
                    team2_id: editTeams.team2_id || null 
                })
            });
            if (res.ok) {
                alert("Match updated!");
                fetchData();
                setSelectedMatch(null);
            }
        } catch (error) {
            alert("Error updating teams.");
        }
    };

    const handleGenerateFixtures = async () => {
        if (!window.confirm(`Generate ${tournament.format} fixtures?`)) return;
        setGenerating(true);
        try {
           const res = await fetch(`https://backend.dhsa.co.in/admin/tournaments/${tournament.id}/generate-fixtures`, { method: 'POST' });
            if (res.ok) {
                alert(`Success! Bracket Map built.`);
                fetchData();
            }
        } catch (error) {
            alert("Server Error");
        } finally {
            setGenerating(false);
        }
    };
    
    const handleResetBracket = async () => {
        if (isBracketLocked) return;
        if (!window.confirm("🚨 Delete ALL matches and scores permanently?")) return;
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/tournaments/${tournament.id}/fixtures`, { method: 'DELETE' });
            if (res.ok) {
                alert("Bracket reset.");
                setMatches([]);
                setStandings([]);
                setActiveTab('Matches');
            }
        } catch (error) {
            alert("Server Error");
        }
    };

    const handleAssignReferee = async () => {
        if (!refereeId || !schedule.date || !schedule.time || !schedule.venue) {
            return alert("Please fill out all schedule fields (Date, Time, Venue) and select a referee.");
        }
        
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/matches/${selectedMatch.id}/assign-referee`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    referee_id: refereeId,
                    match_date: schedule.date,
                    match_time: schedule.time,
                    venue: schedule.venue
                })
            });
            if (res.ok) {
                alert("Match officially scheduled and Referee assigned!");
                fetchData();
                setSelectedMatch(null);
            }
        } catch (error) { alert("Network Error"); }
    };

    const handleToggleLive = async () => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/matches/${selectedMatch.id}/toggle-live`, { method: 'PUT' });
            if (res.ok) { 
                fetchData(); 
                setSelectedMatch(null); 
            } else {
                const err = await res.json();
                alert(err.error || "Failed to toggle live status");
            }
        } catch (error) { alert("Error toggling live status"); }
    };

    // 🌟 NEW: Update Score Without Completing
    const handleUpdateLiveScore = async () => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/matches/${selectedMatch.id}/update-score`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team1_score: scores.team1, team2_score: scores.team2 })
            });
            if (res.ok) {
                fetchData(); 
                alert("Live score updated!");
            } else {
                const err = await res.json();
                alert(err.error || "Failed to update score");
            }
        } catch (error) { alert("Error updating score"); }
    };

    const handleCompleteMatch = async () => {
        if (tournament.format === 'Knockout' && scores.team1 === scores.team2) {
            alert("Knockout matches cannot end in a draw!");
            return;
        }
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/matches/${selectedMatch.id}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team1_score: scores.team1, team2_score: scores.team2 })
            });
            if (res.ok) {
                fetchData(); 
                setSelectedMatch(null);
            } else {
                // 🌟 Added error visibility so it never fails silently again
                const err = await res.json();
                alert(err.error || "Failed to complete match");
            }
        } catch (error) { alert("Error completing match"); }
    };

    const rounds = matches.reduce((acc, match) => {
        if (!acc[match.round_number]) acc[match.round_number] = [];
        acc[match.round_number].push(match);
        return acc;
    }, {});

    const groupedStandings = standings.reduce((acc, row) => {
        const group = row.group_name || 'League';
        if (!acc[group]) acc[group] = [];
        acc[group].push(row);
        return acc;
    }, {});

    let currentDisplayNum = 1;
    const displayNumMap = {};
    
    [...matches].sort((a,b) => {
        if(a.round_number !== b.round_number) return a.round_number - b.round_number;
        return a.match_number - b.match_number;
    }).forEach(m => {
        const isBye = m.status === 'Completed' && (!m.team1_id || !m.team2_id);
        if (!isBye) {
            displayNumMap[m.match_number] = currentDisplayNum++;
        }
    });

    const formatPlaceholder = (text) => {
        if (!text) return "TBD";
        const matchObj = text.match(/Winner Match (\d+)/);
        if (matchObj) {
            const oldNum = parseInt(matchObj[1]);
            const newNum = displayNumMap[oldNum];
            if (newNum) return `Winner Match ${newNum}`;
        }
        return text;
    };

    if (loading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading Bracket...</div>;

    return (
        <div className="animate-in fade-in duration-500 space-y-6 flex flex-col h-full bg-slate-50/50 pb-10">
            <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">{tournament.name}</h1>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{tournament.format} Tournament</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {tournament.format !== 'Knockout' && matches.length > 0 && (
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setActiveTab('Matches')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'Matches' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Map</button>
                            <button onClick={() => setActiveTab('Standings')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'Standings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Standings</button>
                        </div>
                    )}

                    {matches.length > 0 && (
                        <button 
                            onClick={handleResetBracket} 
                            disabled={isBracketLocked}
                            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
                                isBracketLocked 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isBracketLocked ? "Cannot reset bracket once officials are assigned or matches started" : ""}
                        >
                            Reset Bracket
                        </button>
                    )}

                    {matches.length === 0 && (
                        <button onClick={handleGenerateFixtures} disabled={generating} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 flex items-center gap-2">
                            <Swords className="w-5 h-5" /> {generating ? "Generating..." : "Generate Fixtures"}
                        </button>
                    )}
                </div>
            </header>

            {matches.length > 0 ? (
                activeTab === 'Matches' ? (
                    <div className="flex-1 overflow-auto p-8 flex gap-16 items-stretch custom-scrollbar">
                        {Object.keys(rounds).sort((a,b) => a-b).map((roundNum) => (
                            <div key={roundNum} className="flex-none w-72 flex flex-col pt-12">
                                <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-6 text-center">{rounds[roundNum][0].round_name}</h3>
                                <div className="flex-1 flex flex-col justify-start gap-6">
                                    {rounds[roundNum].map(match => {
                                        const isBye = match.status === 'Completed' && (!match.team1_id || !match.team2_id);
                                        const isFutureMatch = match.status === 'Pending TBD';

                                        if (isBye) return null;

                                        const displayNum = displayNumMap[match.match_number];

                                        if (isFutureMatch) {
                                            return (
                                                <div key={match.id} className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 transition-all flex flex-col opacity-80 h-[120px]">
                                                    <div className="px-3 py-1.5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Match {displayNum}</span>
                                                        <span className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-1">
                                                            <HelpCircle className="w-3 h-3" /> WAITING
                                                        </span>
                                                    </div>
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex justify-between items-center text-sm font-bold text-slate-400 italic">
                                                            <span className={`truncate ${match.team1_id ? 'text-slate-700 not-italic' : ''}`}>
                                                                {match.team1_id ? match.team1_name : formatPlaceholder(match.team1_placeholder)}
                                                            </span>
                                                            <span className="font-black">-</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm font-bold text-slate-400 italic">
                                                            <span className={`truncate ${match.team2_id ? 'text-slate-700 not-italic' : ''}`}>
                                                                {match.team2_id ? match.team2_name : formatPlaceholder(match.team2_placeholder)}
                                                            </span>
                                                            <span className="font-black">-</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div 
                                                key={match.id} 
                                                onClick={() => setSelectedMatch(match)}
                                                className={`group bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 flex flex-col ${
                                                    match.status === 'Completed' ? 'border-slate-200 grayscale-[0.5]' :
                                                    match.status === 'Live' ? 'border-rose-500 ring-4 ring-rose-500/10' :
                                                    match.status === 'Scheduled' ? 'border-emerald-500' : 
                                                    match.status === 'Pending Setup' ? 'border-amber-300' : 'border-slate-100'
                                                }`}
                                            >
                                                <div className="px-3 py-1.5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Match {displayNum}</span>
                                                    <span className={`text-[9px] font-black uppercase ${
                                                        match.status === 'Live' ? 'text-rose-500 animate-pulse' : 'text-slate-400'
                                                    }`}>
                                                        {match.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="p-4 space-y-3">
                                                    <div className={`flex justify-between items-center text-sm font-bold ${match.winner_id === match.team1_id ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                        <span className="truncate">{match.team1_name || "TBD"}</span>
                                                        {/* 🌟 FIXED: Scores now display if the match is Live OR Completed */}
                                                        <span className="font-black">{(match.status === 'Completed' || match.status === 'Live') ? match.team1_score : '-'}</span>
                                                    </div>
                                                    
                                                    <div className={`flex justify-between items-center text-sm font-bold ${match.winner_id === match.team2_id ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                        <span className="truncate">{match.team2_name || "TBD"}</span>
                                                        <span className="font-black">{(match.status === 'Completed' || match.status === 'Live') ? match.team2_score : '-'}</span>
                                                    </div>

                                                    <div className="pt-3 mt-1 border-t border-slate-50">
                                                        {match.status === 'Pending Setup' && !match.referee_id ? (
                                                            <p className="text-[10px] font-black text-amber-600 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" /> YET TO ASSIGN REFEREE
                                                            </p>
                                                        ) : match.match_date ? (
                                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500"/> {match.match_date}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500"/> {match.match_time}</span>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* STANDINGS TABLE */
                    <div className="p-8 space-y-8">
                         {Object.entries(groupedStandings).map(([groupName, groupStandings]) => (
                            <div key={groupName} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                                    <h3 className="font-extrabold text-white text-lg">{groupName === 'League' ? 'League Standings' : `Group ${groupName}`}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Club</th>
                                                <th className="px-4 py-4 text-center">MP</th>
                                                <th className="px-4 py-4 text-center">W</th>
                                                <th className="px-4 py-4 text-center">D</th>
                                                <th className="px-4 py-4 text-center">L</th>
                                                <th className="px-4 py-4 text-center">GD</th>
                                                <th className="px-6 py-4 text-center">PTS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {groupStandings.map((team) => (
                                                <tr key={team.id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 font-bold text-slate-900">{team.team_name}</td>
                                                    <td className="px-4 py-4 text-center">{team.matches_played}</td>
                                                    <td className="px-4 py-4 text-center text-emerald-600">{team.wins}</td>
                                                    <td className="px-4 py-4 text-center text-amber-500">{team.draws}</td>
                                                    <td className="px-4 py-4 text-center text-rose-500">{team.losses}</td>
                                                    <td className="px-4 py-4 text-center">{team.goal_difference}</td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-900">{team.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                         ))}
                    </div>
                )
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <Trophy className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-bold">No Bracket Generated</p>
                </div>
            )}

            {/* ACTION MODAL */}
            {selectedMatch && selectedMatch.status !== 'Pending TBD' && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-6 text-white text-center">
                            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{selectedMatch.round_name}</p>
                            <h2 className="text-xl font-black mb-4">MATCH {displayNumMap[selectedMatch.match_number]}</h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex-1 text-right font-bold truncate">{selectedMatch.team1_name || selectedMatch.team1_placeholder || "TBD"}</div>
                                <div className="text-emerald-500 font-black italic">VS</div>
                                <div className="flex-1 text-left font-bold truncate">{selectedMatch.team2_name || selectedMatch.team2_placeholder || "TBD"}</div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Manual Team Override */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-800 uppercase">Matchup Control</h3>
                                    <button onClick={() => setIsEditingTeams(!isEditingTeams)} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                        {isEditingTeams ? "Cancel" : "Manual Swap"}
                                    </button>
                                </div>
                                {isEditingTeams && (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                        <select value={editTeams.team1_id} onChange={e => setEditTeams({...editTeams, team1_id: e.target.value})} className="w-full p-2 border rounded-lg text-sm font-bold outline-none">
                                            <option value="">-- Select Team 1 --</option>
                                            {tournamentTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <select value={editTeams.team2_id} onChange={e => setEditTeams({...editTeams, team2_id: e.target.value})} className="w-full p-2 border rounded-lg text-sm font-bold outline-none">
                                            <option value="">-- Select Team 2 --</option>
                                            {tournamentTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <button onClick={handleSaveTeams} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm">Update Matchup</button>
                                    </div>
                                )}
                            </div>

                            {!isEditingTeams && (
                                <div className="space-y-6">
                                    
                                    {selectedMatch.status === 'Pending Setup' || selectedMatch.status === 'Scheduled' ? (
                                        <div className="space-y-4">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Match Schedule & Official</label>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <input 
                                                    type="date" 
                                                    value={schedule.date} 
                                                    onChange={e => setSchedule({...schedule, date: e.target.value})} 
                                                    className="w-full p-3 border rounded-xl font-bold bg-slate-50 text-sm outline-none focus:border-emerald-500 text-slate-700" 
                                                />
                                                <input 
                                                    type="time" 
                                                    value={schedule.time} 
                                                    onChange={e => setSchedule({...schedule, time: e.target.value})} 
                                                    className="w-full p-3 border rounded-xl font-bold bg-slate-50 text-sm outline-none focus:border-emerald-500 text-slate-700" 
                                                />
                                            </div>
                                            
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Match Venue/Pitch" 
                                                    value={schedule.venue} 
                                                    onChange={e => setSchedule({...schedule, venue: e.target.value})} 
                                                    className="w-full pl-10 pr-3 py-3 border rounded-xl font-bold bg-slate-50 text-sm outline-none focus:border-emerald-500 text-slate-700" 
                                                />
                                            </div>

                                            <select value={refereeId} onChange={e => setRefereeId(e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 text-sm outline-none focus:border-emerald-500 text-slate-700">
                                                <option value="">-- Assign Referee --</option>
                                                {referees.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                                            </select>
                                            
                                            <button onClick={handleAssignReferee} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all">
                                                {selectedMatch.status === 'Scheduled' ? "Update Schedule" : "Schedule Match"}
                                            </button>
                                        </div>
                                    ) : null}

                                    {/* LIVE & SCORE CONTROLS */}
                                    {selectedMatch.status === 'Scheduled' || selectedMatch.status === 'Live' ? (
                                        <div className="space-y-6 pt-4 border-t border-slate-100">
                                            <button onClick={handleToggleLive} className={`w-full py-3 rounded-xl font-black transition-colors ${selectedMatch.status === 'Live' ? 'bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-200' : 'bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-200'}`}>
                                                {selectedMatch.status === 'Live' ? 'End Live Broadcast' : 'Start Live Broadcast'}
                                            </button>
                                            
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                <h4 className="text-center text-[10px] font-black text-slate-400 uppercase mb-3">Admin Score Override</h4>
                                                <div className="flex items-center justify-center gap-4">
                                                    <input type="number" value={scores.team1} onChange={e => setScores({...scores, team1: parseInt(e.target.value, 10) || 0})} className="w-16 text-center text-2xl font-black p-2 rounded-lg border bg-white outline-none focus:border-emerald-500"/>
                                                    <span className="text-slate-300 font-bold">-</span>
                                                    <input type="number" value={scores.team2} onChange={e => setScores({...scores, team2: parseInt(e.target.value, 10) || 0})} className="w-16 text-center text-2xl font-black p-2 rounded-lg border bg-white outline-none focus:border-emerald-500"/>
                                                </div>
                                                
                                                {/* 🌟 NEW: UPDATE SCORE WITHOUT COMPLETING BUTTON */}
                                                {selectedMatch.status === 'Live' && (
                                                    <button onClick={handleUpdateLiveScore} className="w-full mt-4 bg-emerald-100 text-emerald-700 py-2 rounded-lg font-bold text-sm hover:bg-emerald-200 transition-colors">
                                                        Update Live Score
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <button onClick={handleCompleteMatch} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all">Submit Final Result</button>
                                        </div>
                                    ) : selectedMatch.status === 'Completed' ? (
                                        <div className="text-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                                            <p className="text-slate-400 font-bold italic text-sm">
                                                Final result locked. Winner advanced.
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                            <button onClick={() => setSelectedMatch(null)} className="w-full text-slate-500 font-bold text-sm pt-2 hover:text-slate-700 transition-colors">Close Menu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
