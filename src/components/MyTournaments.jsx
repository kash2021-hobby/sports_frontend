import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, ShieldAlert, CheckCircle, Swords, Clock, Users, X, Activity } from 'lucide-react';

export default function MyTournaments({ clubId }) {
    const [registrations, setRegistrations] = useState([]);
    const [myTeam, setMyTeam] = useState(null); 
    const [myMatches, setMyMatches] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [viewRoster, setViewRoster] = useState(null);

    useEffect(() => {
        if (clubId) fetchData();
    }, [clubId]);

    const fetchData = async () => {
        try {
            const [regRes, teamRes] = await Promise.all([
                fetch(`https://backend.dhsa.co.in/manager/my-tournaments/${clubId}`),
                fetch(`https://backend.dhsa.co.in/manager/team/${clubId}`)
            ]);

            if (regRes.ok) {
                const data = await regRes.json();
                setRegistrations(data.registrations);
            }
            
            let actualTeamId = null;
            if (teamRes.ok) {
                const teamData = await teamRes.json();
                setMyTeam(teamData);
                actualTeamId = teamData.id;
            }

            if (actualTeamId) {
                const matchRes = await fetch(`https://backend.dhsa.co.in/manager/teams/${actualTeamId}/matches`);
                if (matchRes.ok) {
                    const matchesData = await matchRes.json();
                    setMyMatches(matchesData);
                }
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getParsedRoster = (rosterData) => {
        if (!rosterData) return { starters: [], subs: [] };
        return typeof rosterData === 'string' ? JSON.parse(rosterData) : rosterData;
    };

    if (loading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading your tournament data...</div>;

    return (
        <div className="animate-in fade-in duration-500 space-y-8 relative">
            <header>
                <h1 className="text-3xl font-extrabold text-slate-900">My Tournaments</h1>
                <p className="text-slate-500 mt-1">Track your registrations and view upcoming fixtures.</p>
            </header>

            {registrations.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg">You haven't registered for any tournaments yet.</p>
                    <p className="text-sm mt-1">Go to the Tournament Hub to find events.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {registrations.map((reg) => {
                        const t = reg.Tournament;
                        const isApproved = reg.status === "Approved";

                        const teamMatchesInTourney = myMatches.filter(m => 
                            (String(m.tournament_id) === String(t.id) || String(m.TournamentId) === String(t.id)) 
                            && m.status !== 'Completed'
                        );
                        
                        const nextMatch = teamMatchesInTourney.length > 0 ? teamMatchesInTourney[0] : null;

                        let opponentName = "TBD";
                        let isTBD = true;
                        let myTeamName = myTeam?.name || "Your Team";

                        if (nextMatch) {
                            const isTeam1 = String(nextMatch.team1_id) === String(myTeam?.id);
                            opponentName = isTeam1 ? nextMatch.team2_name : nextMatch.team1_name;
                            
                            if (nextMatch.status === "Pending Setup" || nextMatch.status === "Pending TBD") {
                                opponentName = "TBD";
                            }
                            
                            if (!opponentName || opponentName === "Unknown") opponentName = "TBD";
                            isTBD = opponentName === "TBD";
                        }

                        return (
                            <div key={reg.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row group">
                                
                                {/* Left Side: Tournament Info */}
                                <div className="p-6 md:w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col justify-center relative">
                                    <div className="absolute top-4 left-4">
                                        {isApproved ? (
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                                                <CheckCircle className="w-3 h-3"/> Approved
                                            </span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                                                <ShieldAlert className="w-3 h-3"/> {reg.status}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-extrabold text-slate-900 mt-8">{t.name}</h3>
                                    <div className="mt-4 space-y-2 text-sm text-slate-600 font-medium">
                                        <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/> {t.city}</p>
                                        <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500"/> {new Date(t.start_date).toLocaleDateString()}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setViewRoster(reg)}
                                        className="mt-6 w-full bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                    >
                                        <Users className="w-4 h-4" /> View Registered Squad
                                    </button>
                                </div>

                                {/* Right Side: Fixtures & Matches */}
                                <div className="p-6 md:w-2/3 flex flex-col justify-center">
                                    {!isApproved ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Clock className="w-8 h-8 text-amber-500" />
                                            </div>
                                            <h4 className="font-bold text-slate-800">Verification in Progress</h4>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                                                The admin is verifying your roster and payment. Once approved, your fixtures will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                                                <Swords className="w-4 h-4 text-emerald-500"/> Upcoming Fixture
                                            </h4>
                                            
                                            {nextMatch ? (
                                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                                    <div className="absolute -right-4 -top-4 opacity-10">
                                                        <Trophy className="w-32 h-32" />
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between relative z-10">
                                                        {/* My Team */}
                                                        <div className="text-center flex-1">
                                                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl border border-emerald-500/50">🛡️</div>
                                                            <p className="font-bold truncate px-2" title={myTeamName}>{myTeamName}</p>
                                                        </div>
                                                        
                                                        {/* VS Status Label */}
                                                        <div className="px-4 text-center">
                                                            <span className="text-emerald-400 font-black text-xl italic tracking-widest">VS</span>
                                                            <p className={`text-[10px] font-bold mt-1 px-3 py-1 rounded-md uppercase tracking-wider ${nextMatch.status === 'Live' ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-white/10 text-slate-300'}`}>
                                                                {nextMatch.status === 'Pending Setup' ? 'Awaiting Officials' : nextMatch.status}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Opponent Team */}
                                                        <div className="text-center flex-1">
                                                            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl border ${isTBD ? 'bg-white/10 border-dashed border-white/30 text-slate-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}>
                                                                {isTBD ? '?' : '⚔️'}
                                                            </div>
                                                            <p className={`font-bold truncate px-2 ${isTBD ? 'text-slate-400' : 'text-white'}`} title={opponentName}>{opponentName}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* 🌟 NEW: MATCH DETAILS & SCHEDULE */}
                                                    <div className="mt-6 pt-4 border-t border-white/10 flex flex-col items-center justify-center gap-3">
                                                        <div className="text-center text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
                                                            <Trophy className="w-4 h-4"/> 
                                                            {(nextMatch.status === 'Pending Setup' || nextMatch.status === 'Pending TBD')
                                                                ? "Schedule & Opponent revealed once assigned by Admin." 
                                                                : `${nextMatch.round_name} • Match ${nextMatch.match_number}`}
                                                        </div>

                                                        {/* Shows Date, Time, and Location if the Admin scheduled it! */}
                                                        {nextMatch.match_date && (
                                                            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-300 relative z-10">
                                                                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-md border border-white/5"><Calendar className="w-3.5 h-3.5 text-emerald-400"/> {nextMatch.match_date}</span>
                                                                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-md border border-white/5"><Clock className="w-3.5 h-3.5 text-blue-400"/> {nextMatch.match_time}</span>
                                                                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-md border border-white/5"><MapPin className="w-3.5 h-3.5 text-rose-400"/> {nextMatch.venue}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Fallback if the Admin hasn't generated the bracket yet */
                                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                                    <div className="absolute -right-4 -top-4 opacity-10">
                                                        <Trophy className="w-32 h-32" />
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="text-center flex-1">
                                                            <div className="w-12 h-12 bg-white/10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl">🛡️</div>
                                                            <p className="font-bold truncate px-2" title={myTeamName}>{myTeamName}</p>
                                                        </div>
                                                        
                                                        <div className="px-4 text-center">
                                                            <span className="text-emerald-400 font-black text-xl italic tracking-widest">VS</span>
                                                            <p className="text-xs text-slate-400 mt-1 font-medium bg-white/10 px-2 py-1 rounded-md">Pending Draw</p>
                                                        </div>
                                                        
                                                        <div className="text-center flex-1">
                                                            <div className="w-12 h-12 bg-white/10 rounded-full border border-dashed border-white/30 mx-auto mb-2 flex items-center justify-center font-bold text-slate-400">?</div>
                                                            <p className="font-bold text-slate-300">TBD</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm font-medium text-emerald-400">
                                                        Waiting for Admin to generate the tournament bracket.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 🌟 ROSTER MODAL */}
            {viewRoster && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                            <div>
                                <h2 className="text-xl font-extrabold">{viewRoster.Tournament?.name}</h2>
                                <p className="text-sm font-medium text-slate-400">Registered Squad Details</p>
                            </div>
                            <button onClick={() => setViewRoster(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-8">
                            
                            {(() => {
                                const roster = getParsedRoster(viewRoster.roster_data);
                                const starters = myTeam?.players?.filter(p => roster.starters.includes(p.id)) || [];
                                const subs = myTeam?.players?.filter(p => roster.subs.includes(p.id)) || [];

                                return (
                                    <>
                                        {/* STARTING XI SECTION */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                                                <h3 className="font-bold text-slate-800 text-lg">Starting XI</h3>
                                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{starters.length} Players</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {starters.map(p => (
                                                    <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-900 shrink-0">
                                                            {p.TeamPlayer?.jersey_number || '-'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm leading-tight">{p.full_name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{p.assigned_position}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {starters.length === 0 && <p className="text-sm text-slate-500">No starters recorded.</p>}
                                            </div>
                                        </div>

                                        {/* SUBSTITUTES SECTION */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                                                <h3 className="font-bold text-slate-800 text-lg">Substitutes</h3>
                                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">{subs.length} Players</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {subs.map(p => (
                                                    <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm opacity-80">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-900 shrink-0">
                                                            {p.TeamPlayer?.jersey_number || '-'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm leading-tight">{p.full_name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{p.assigned_position}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {subs.length === 0 && <p className="text-sm text-slate-500">No substitutes selected.</p>}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
