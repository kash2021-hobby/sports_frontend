import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playerAPI } from "../services/api";
import { 
    User, Shield, Activity, LogOut, Menu, X, 
    Calendar, MapPin, CheckCircle, ShieldAlert, 
    Trophy, Swords, Clock, ChevronRight
} from "lucide-react";

export default function PlayerDashboard() {
    const navigate = useNavigate();
    
    // Core State
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Stats & Matches State
    const [stats, setStats] = useState({
        goals: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, recentEvents: []
    });
    const [upcomingMatches, setUpcomingMatches] = useState([]); 
    
    // Layout State
    const [activeTab, setActiveTab] = useState("Team"); // Defaulting to Team tab for better UX
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewProfile, setViewProfile] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser"));

        if (!user || user.role !== "player") {
            navigate("/login");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Player Profile
                const profileRes = await playerAPI.getProfile(user.id);
                setPlayerData(profileRes.data);

                // 2. Fetch Player Stats
                const statsRes = await fetch(`https://backend.dhsa.co.in/players/${user.id}/stats`);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // 3. Fetch Upcoming Matches
                const matchesRes = await fetch(`https://backend.dhsa.co.in/players/${user.id}/matches`);
                if (matchesRes.ok) {
                    const matchesData = await matchesRes.json();
                    
                    // Smart Sorting by Date and Time
                    const sortedMatches = matchesData.sort((a, b) => {
                        // Push TBD dates to the bottom
                        if (!a.match_date || a.match_date === "TBD") return 1;
                        if (!b.match_date || b.match_date === "TBD") return -1;
                        
                        // Fallback time to midnight if not set
                        const timeA = a.match_time && a.match_time !== "TBD" ? a.match_time : "00:00";
                        const timeB = b.match_time && b.match_time !== "TBD" ? b.match_time : "00:00";
                        
                        // Convert string to Real JS Date Objects to sort correctly
                        const dateA = new Date(`${a.match_date} ${timeA}`);
                        const dateB = new Date(`${b.match_date} ${timeB}`);
                        
                        return dateA - dateB; // Earliest match comes first
                    });

                    setUpcomingMatches(sortedMatches);
                }
                
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    /* ===============================
       HELPERS & LOGOUT
    ================================ */
    const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("currentUser");
            window.location.href = "/login"; 
        }
    };

    const navItems = [
        { id: "Profile", label: "My Profile", icon: User },
        { id: "Team", label: "Team & Fixtures", icon: Shield },
        { id: "Stats", label: "Performance Stats", icon: Activity },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    // 🌟 THE FIX: Extract the jersey number from the Teams array if it exists
    let displayJerseyNumber = "TBD";
    if (playerData?.Teams && playerData.Teams.length > 0) {
        // Find the first team and check its junction table (TeamPlayer)
        const teamData = playerData.Teams[0];
        if (teamData.TeamPlayer && teamData.TeamPlayer.jersey_number) {
            displayJerseyNumber = teamData.TeamPlayer.jersey_number;
        }
    }

    /* ===============================
       TAB RENDERERS
    ================================ */
    const renderProfileTab = () => (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Player Profile</h1>
                <p className="text-slate-500 mt-1">Manage your application and track your status.</p>
            </header>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start transition-all hover:shadow-md">
                <div className="flex-shrink-0 relative">
                    <img
                        src={getDriveImageUrl(playerData.player_photo_url)}
                        alt="profile"
                        className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-md border-4 border-slate-50"
                        onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Photo"; }}
                    />
                    <div className={`absolute bottom-2 right-4 w-6 h-6 rounded-full border-4 border-white ${playerData.status === 'Registered' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                </div>

                <div className="flex-grow w-full text-center md:text-left flex flex-col h-full justify-between">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-1">{playerData.full_name}</h2>
                            <span className="inline-block bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                                {playerData.position}
                            </span>
                        </div>
                        <div className={`px-5 py-2 border rounded-full font-bold text-sm tracking-wide uppercase shadow-sm ${playerData.status === 'Registered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                            {playerData.status}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Application Status</h3>
                            <p className="font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2 text-sm">
                                {playerData.status === "Registered" ? (
                                    <><CheckCircle className="w-4 h-4 text-emerald-500" /> Officially Registered</>
                                ) : (
                                    <><ShieldAlert className="w-4 h-4 text-amber-500" /> Under Review</>
                                )}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Team</h3>
                            <p className="font-bold text-slate-800 text-sm">
                                {playerData.Club ? playerData.Club.name : `Club #${playerData.club_applied}`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setViewProfile(true)}
                        className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        View Complete Profile <ChevronRight className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderTeamTab = () => (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6">
            <header className="mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team & Fixtures</h1>
                <p className="text-slate-500 mt-1">View your current club and upcoming matches.</p>
            </header>

            {playerData.status !== "Registered" ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center text-slate-500">
                    <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                    <p className="font-bold text-xl text-slate-700">Not Assigned to a Team Yet</p>
                    <p className="text-sm mt-2 max-w-md mx-auto">Your application is still being processed. Once an Admin or Manager approves your profile, your team details will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
                    
                    {/* --- LEFT COL: TEAM CARD (STICKY) --- */}
                    <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-6">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-slate-700">
                            <div className="absolute -right-8 -top-8 opacity-10 transform rotate-12"><Shield className="w-56 h-56" /></div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Roster
                                </div>
                                
                                <h2 className="text-3xl font-black mb-2 leading-tight">
                                    {playerData.Club ? playerData.Club.name : `Club #${playerData.club_applied}`}
                                </h2>
                                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                                    You are officially registered and eligible to play in upcoming tournaments.
                                </p>
                                
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex items-center justify-between border border-white/10 shadow-inner">
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Position</p>
                                        <p className="font-bold text-lg text-white">{playerData.position}</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10"></div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Jersey</p>
                                        <p className="font-black text-2xl text-emerald-400 leading-none">
                                            {/* 🌟 THE FIX: Display the actual jersey number! */}
                                            {displayJerseyNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COL: UPCOMING MATCHES --- */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <Swords className="w-5 h-5 text-emerald-500"/> Upcoming Matches
                            </h3>
                            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{upcomingMatches.length}</span>
                        </div>

                        {upcomingMatches.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="font-bold text-slate-700 text-lg">No Upcoming Matches</p>
                                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Your manager hasn't registered for any active tournaments yet, or fixtures haven't been drawn by the admin.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {upcomingMatches.map((match) => (
                                    <div key={match.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
                                        
                                        {/* Match Header */}
                                        <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <span className="font-bold text-slate-800 text-sm truncate max-w-[150px] sm:max-w-xs">{match.tournament_name}</span>
                                                <span className="text-slate-400 text-xs font-bold hidden sm:inline">• {match.round_name}</span>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full shrink-0 ${match.status === 'Live' ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                {match.status === 'Pending Setup' ? 'Awaiting Official' : match.status}
                                            </span>
                                        </div>

                                        {/* VS Section */}
                                        <div className="px-5 py-8 flex items-center justify-between gap-4 relative">
                                            {/* Mobile specific round name */}
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-300 uppercase tracking-widest sm:hidden">
                                                {match.round_name}
                                            </div>

                                            <div className="flex-1 text-right">
                                                <p className="font-black text-lg md:text-2xl text-slate-800 leading-tight" title={match.team1_name}>{match.team1_name}</p>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-center px-1 md:px-4">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] md:text-xs font-black text-slate-400 italic">VS</div>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-black text-lg md:text-2xl text-slate-800 leading-tight" title={match.team2_name}>{match.team2_name}</p>
                                            </div>
                                        </div>

                                        {/* Match Footer */}
                                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold text-slate-600 gap-2">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500"/> {match.match_date || "Date TBD"}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500"/> {match.match_time || "Time TBD"}</span>
                                            </div>
                                            <span className="flex items-center gap-1.5 text-slate-500"><MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0"/> <span className="truncate max-w-[200px]">{match.venue || "Venue TBD"}</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderStatsTab = () => (
        <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Stats</h1>
                <p className="text-slate-500 mt-1">Your career statistics and recorded match events.</p>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-emerald-300 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5"><Activity className="w-24 h-24 text-emerald-500"/></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 z-10">Goals</p>
                    <p className="text-5xl font-black text-slate-800 z-10">{stats.goals}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-300 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5"><Shield className="w-24 h-24 text-blue-500"/></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 z-10">Matches</p>
                    <p className="text-5xl font-black text-slate-800 z-10">{stats.matchesPlayed}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-300 transition-colors">
                    <div className="w-2 h-10 bg-amber-400 rounded absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Yellow Cards</p>
                    <p className="text-5xl font-black text-slate-800">{stats.yellowCards}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-rose-300 transition-colors">
                    <div className="w-2 h-10 bg-rose-500 rounded absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Red Cards</p>
                    <p className="text-5xl font-black text-slate-800">{stats.redCards}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500"/> Recent Events Log
                    </h3>
                </div>
                
                <div className="p-6">
                    {stats.recentEvents.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-600 text-lg">No Events Recorded</p>
                            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Goals and cards officially assigned to you by the match referee will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentEvents.map(ev => (
                                <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="font-black text-slate-300 w-8 text-right">{ev.minute}'</div>
                                        <div className={`w-2 h-8 rounded-full ${ev.type === 'Goal' ? 'bg-emerald-500' : ev.type === 'Yellow Card' ? 'bg-amber-400' : 'bg-rose-500'}`}></div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{ev.type}</p>
                                            <p className="text-xs text-slate-500 font-semibold mt-0.5">vs {ev.match_name.split(' vs ').find(name => !name.includes("TBD")) || ev.match_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">{ev.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            
            {/* --- MOBILE SIDEBAR OVERLAY --- */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex flex-col border-r border-slate-800
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight">Player<span className="text-emerald-400">Hub</span></span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <div className="px-3 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dashboard Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive ? "bg-emerald-500/15 text-emerald-400 font-bold" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 font-semibold"}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400 transition-colors"}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3.5 rounded-xl font-bold transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/50">
                
                {/* Mobile Header */}
                <header className="lg:hidden h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-extrabold text-slate-900 text-lg">Player<span className="text-emerald-500">Hub</span></span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar">
                    {activeTab === "Profile" && renderProfileTab()}
                    {activeTab === "Team" && renderTeamTab()}
                    {activeTab === "Stats" && renderStatsTab()}
                </div>
            </main>

            {/* ===============================
                FULL PROFILE MODAL
            =============================== */}
            {viewProfile && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h2 className="text-2xl font-bold text-slate-900">My Complete Profile</h2>
                            <button onClick={() => setViewProfile(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

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

                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-grow">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                            <span className="w-2 h-5 bg-emerald-500 rounded-full"></span> Documents
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                            <a href={playerData.gov_doc_1_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Gov Document 1</span>
                                            </a>
                                            <a href={playerData.gov_doc_2_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Gov Document 2</span>
                                            </a>
                                            <a href={playerData.gov_doc_3_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Gov Document 3</span>
                                            </a>
                                            <a href={playerData.fitness_certificate_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-100 p-3 rounded-xl transition-all group">
                                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Fitness Certificate</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end rounded-b-3xl">
                            <button onClick={() => setViewProfile(false)} className="px-8 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
