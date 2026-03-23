import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Shield, Clock } from 'lucide-react';

export default function ManagerDashboardHome({ setActiveTab, clubId }) {
    const [stats, setStats] = useState({ totalPlayers: 0, pendingEvals: 0, teamCount: 0 });
    const [activeTrials, setActiveTrials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (clubId) {
            fetchDashboardData();
        }
    }, [clubId]);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch all players applied to this club
            const playersRes = await fetch(`https://backend.dhsa.co.in/clubs/applications?club_id=${clubId}`);
            let playersData = [];
            if (playersRes.ok) {
                playersData = await playersRes.json();
            }

            // 2. Fetch the permanent team status for this club
            const teamRes = await fetch(`https://backend.dhsa.co.in/manager/team/${clubId}`);
            let teamCount = 0;
            if (teamRes.ok) {
                const teamData = await teamRes.json();
                if (teamData && teamData.id) {
                    teamCount = 1; // Manager has successfully created their 1 permanent team
                }
            }

            // Filter players based on their current status
            const trialists = playersData.filter(p => p.status === "Trialist");
            const registered = playersData.filter(p => p.status === "Registered");

            setStats({
                totalPlayers: registered.length,
                pendingEvals: trialists.length,
                teamCount: teamCount
            });

            // Store the first 5 active trials to display in the table
            setActiveTrials(trialists.slice(0, 5));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading dashboard metrics...</div>;
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
            
            {/* Stat Cards - Adjusted to grid-cols-3 since we removed Avg Attendance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Registered Players", count: stats.totalPlayers, icon: <Users className="w-6 h-6 text-blue-500"/>, color: "border-blue-500", tab: "My Players" },
                    { title: "Pending Evals", count: stats.pendingEvals, icon: <ClipboardList className="w-6 h-6 text-amber-500"/>, color: "border-amber-500", tab: "Assigned Trials" },
                    { title: "My Teams", count: stats.teamCount, icon: <Shield className="w-6 h-6 text-emerald-500"/>, color: "border-emerald-500", tab: "My Teams" }
                ].map((stat, i) => (
                    <div key={i} onClick={() => setActiveTab(stat.tab)} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-t-4 ${stat.color} hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 font-semibold text-sm mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-slate-900">{stat.count}</h3>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Trials Table - Now Dynamic */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Active Trials</h3>
                        {activeTrials.length > 0 && (
                            <button onClick={() => setActiveTab("Assigned Trials")} className="text-sm text-emerald-600 font-bold hover:underline">View All</button>
                        )}
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Player Name</th>
                                    <th className="px-4 py-3">Position</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-tr-lg text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeTrials.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-slate-500 font-medium">
                                            No pending evaluations right now.
                                        </td>
                                    </tr>
                                ) : (
                                    activeTrials.map((player) => (
                                        <tr key={player.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-3">
                                                <img 
                                                    src={player.player_photo_url || "https://via.placeholder.com/150"} 
                                                    alt={player.full_name} 
                                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                />
                                                {player.full_name}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 font-medium">{player.position}</td>
                                            <td className="px-4 py-3">
                                                <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max">
                                                    <Clock className="w-3 h-3"/> Pending
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => setActiveTab("Assigned Trials")} className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                                    Evaluate
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Today's Schedule - Keeping it as a UI element for now */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Schedule</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 relative">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                            </div>
                            <div className="pb-4">
                                <p className="text-sm font-bold text-slate-900">Trial Evaluations</p>
                                <p className="text-xs text-slate-500 mt-0.5">Review pending players</p>
                                <button onClick={() => setActiveTab("Assigned Trials")} className="mt-2 text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-md border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                    Start Session
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4 relative">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Squad Finalization</p>
                                <p className="text-xs text-slate-500 mt-0.5">Submit team for approval</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
