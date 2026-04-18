import React from 'react';
import { LayoutDashboard, ClipboardList, Shield, Users, Trophy, UserCircle, Settings, X, LogOut, Swords, } from 'lucide-react';

// 🌟 FIXED THE HELPER FUNCTION FOR GOOGLE DRIVE IMAGES
const getDriveImageUrl = (url) => { 
    if (!url) return "https://placehold.co/150x150?text=No+Photo"; 
    const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); 
    const fileId = match ? match[1] : null; 
    if (!fileId) return url; 
    return `https://drive.google.com/uc?export=view&id=${fileId}`; 
};

export default function ManagerSidebar({ 
    activeTab, 
    setActiveTab, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    handleLogout, 
    pendingTrialsCount = 0, 
    newTournamentsCount = 0, // 🌟 ADDED PROPS
    newMatchesCount = 0,     // 🌟 ADDED PROPS
    clubInfo 
}) {
    const navItems = [
        { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "Assigned Trials", label: "Assigned Trials", icon: ClipboardList },
        { id: "My Teams", label: "My Teams", icon: Shield },
        { id: "My Players", label: "My Players", icon: Users },
        { id: "Tournament", label: "Tournament Hub", icon: Trophy },
        { id: "My Tournaments", label: "My Tournaments", icon: Swords },
        { id: "Profile", label: "Secretary Profile", icon: UserCircle },
        { id: "Settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex flex-col
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
            {/* HEADER */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    
                    {clubInfo?.logo ? (
                        <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden shrink-0">
                            <img 
                                src={getDriveImageUrl(clubInfo.logo)} 
                                alt={clubInfo.name} 
                                className="w-full h-full object-contain rounded-lg"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x150?text=Logo"; }}
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    )}

                    <div className="flex flex-col truncate">
                        <span className="text-xl font-extrabold tracking-tight truncate" title={clubInfo?.name || "DHSA Secretary"}>
                            {clubInfo ? clubInfo.name : "DHSA Secretary"}
                        </span>
                        {clubInfo?.city && (
                            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider leading-none mt-1 truncate">
                                {clubInfo.city}
                            </span>
                        )}
                    </div>

                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white shrink-0 ml-2">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* NAVIGATION MENU */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Management</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive ? "bg-emerald-600/10 text-emerald-400 font-bold" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 font-medium"
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400"}`} />
                            
                            <div className="flex items-center gap-2">
                                {item.label}
                                
                                {/* 🌟 Trial Notifications */}
                                {item.id === "Assigned Trials" && pendingTrialsCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/30 animate-pulse">
                                        {pendingTrialsCount > 99 ? "99+" : pendingTrialsCount}
                                    </span>
                                )}

                                {/* 🌟 Tournament Hub Notifications */}
                                {item.id === "Tournament" && newTournamentsCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/30 animate-pulse">
                                        {newTournamentsCount > 99 ? "99+" : newTournamentsCount}
                                    </span>
                                )}

                                {/* 🌟 My Tournaments (Matches) Notifications */}
                                {item.id === "My Tournaments" && newMatchesCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/30 animate-pulse">
                                        {newMatchesCount > 99 ? "99+" : newMatchesCount}
                                    </span>
                                )}
                            </div>

                            {isActive && <div className="ml-auto w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                        </button>
                    );
                })}
            </nav>

            {/* FOOTER PROFILE */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700">M</div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">Secretary Name</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
