import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, Eye, Users, Palette } from 'lucide-react';

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State to handle the View Details modal
    const [viewTeam, setViewTeam] = useState(null);

    // 🌟 ADDED YOUR CUSTOM IMAGE FETCHER
    const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await fetch("https://backend.dhsa.co.in/admin/teams");
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
            }
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (teamId) => {
        if (!window.confirm("Approve this team for official tournaments?")) return;
        
        setIsProcessing(true);
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/teams/${teamId}/approve`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                // Update local state to instantly reflect the approval
                setTeams(teams.map(team => 
                    team.id === teamId ? { ...team, status: "Approved" } : team
                ));
                // Close modal if it was open
                setViewTeam(null);
            } else {
                alert("Failed to approve team.");
            }
        } catch (error) {
            console.error("Error approving team:", error);
            alert("Server error.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading teams...</div>;
    }

    const pendingTeams = teams.filter(t => t.status === "Pending Approval");
    const approvedTeams = teams.filter(t => t.status === "Approved");

    return (
        <div className="animate-in fade-in duration-500 space-y-10 relative">
            
            <header>
                <h1 className="text-3xl font-extrabold text-slate-900">Team Management</h1>
                <p className="text-slate-500 mt-1">Review and approve official club rosters for tournaments.</p>
            </header>

            {/* PENDING APPROVALS SECTION */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Pending Approvals</h2>
                    <span className="bg-amber-100 text-amber-800 py-1 px-3 rounded-full text-sm font-bold">
                        {pendingTeams.length}
                    </span>
                </div>

                {pendingTeams.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-medium">
                        No teams are currently waiting for approval.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingTeams.map(team => (
                            <div key={team.id} className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-bl-xl flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pending
                                </div>
                                
                                <div className="flex items-center gap-4 mb-6 mt-2">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner" style={{ backgroundColor: team.jersey_color || '#f8fafc' }}>
                                        <Shield className={`w-7 h-7 ${team.jersey_color ? 'text-white mix-blend-difference' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{team.name}</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">{team.Club?.name || "Unknown Club"}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-auto flex gap-2">
                                    <button 
                                        onClick={() => setViewTeam(team)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Eye className="w-4 h-4" /> View Details
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(team.id)}
                                        disabled={isProcessing}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-200 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* REGISTERED TEAMS SECTION */}
            <section>
                <div className="flex items-center gap-3 mb-6 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-800">Registered Teams</h2>
                    <span className="bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full text-sm font-bold">
                        {approvedTeams.length}
                    </span>
                </div>

                {approvedTeams.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500 font-medium">
                        No teams have been approved yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvedTeams.map(team => (
                            <div key={team.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer" onClick={() => setViewTeam(team)}>
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: team.jersey_color || '#f8fafc' }}>
                                    <Shield className={`w-7 h-7 ${team.jersey_color ? 'text-white mix-blend-difference' : 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{team.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">{team.Club?.name}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600" title="Approved">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ===============================
                TEAM DETAILS MODAL
            ================================ */}
            {viewTeam && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900">Team Roster Review</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Verify players before approving this team.</p>
                            </div>
                            <button onClick={() => setViewTeam(null)} className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-colors">✕</button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                            
                            {/* Team Info Card */}
                            <div className="flex items-center gap-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-inner" style={{ backgroundColor: viewTeam.jersey_color || '#f8fafc' }}>
                                    <Shield className={`w-10 h-10 ${viewTeam.jersey_color ? 'text-white mix-blend-difference' : 'text-slate-400'}`} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900">{viewTeam.name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{viewTeam.Club?.name}</p>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        <p className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                                            <Palette className="w-4 h-4"/> {viewTeam.jersey_color}
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-auto flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold">
                                    <Users className="w-5 h-5"/> {viewTeam.Players?.length || 0} Players
                                </div>
                            </div>

                            {/* Player List */}
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Squad Members</h4>
                                {(!viewTeam.Players || viewTeam.Players.length === 0) ? (
                                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">No players assigned to this team yet.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {viewTeam.Players.map(player => (
                                            <div key={player.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">No.</span>
                                                    <span className="font-black text-slate-900 leading-none">{player.TeamPlayer?.jersey_number || '-'}</span>
                                                </div>
                                                {/* 🌟 APPLIED FUNCTION HERE */}
                                                <img src={getDriveImageUrl(player.player_photo_url)} alt={player.full_name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                                                <div>
                                                    <h5 className="font-bold text-slate-900 leading-tight">{player.full_name}</h5>
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                        {player.TeamPlayer?.assigned_position || 'Unassigned'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
                            <button onClick={() => setViewTeam(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                            {viewTeam.status === "Pending Approval" && (
                                <button 
                                    onClick={() => handleApprove(viewTeam.id)} 
                                    disabled={isProcessing}
                                    className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> {isProcessing ? "Processing..." : "Approve Team"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
