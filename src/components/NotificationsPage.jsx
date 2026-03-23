import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Eye, Shield, MapPin, Calendar, FileText, Image as ImageIcon, X } from 'lucide-react';

export default function NotificationsPage() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewApplication, setViewApplication] = useState(null);

    const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const res = await fetch("http://localhost:5000/admin/tournament-registrations");
            if (res.ok) setRegistrations(await res.json());
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus, teamName) => {
        const actionText = newStatus === 'Approved' ? 'approve' : 'reject';
        if (!window.confirm(`Are you sure you want to ${actionText} the tournament application for ${teamName}?`)) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/admin/tournament-registrations/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Update UI instantly
                setRegistrations(registrations.map(reg => 
                    reg.id === id ? { ...reg, status: newStatus } : reg
                ));
                setViewApplication(null); // Close modal if open
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            alert("Server error.");
        }
    };

    const getParsedRoster = (rosterData) => {
        if (!rosterData) return { starters: [], subs: [] };
        return typeof rosterData === 'string' ? JSON.parse(rosterData) : rosterData;
    };

    if (loading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading notifications...</div>;

    const pendingRequests = registrations.filter(r => r.status === "Pending Verification");

    return (
        <div className="animate-in fade-in duration-500 space-y-6 relative">
            <header className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1">Review pending tournament applications and payments.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                        Tournament Applications
                        <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-xs">{pendingRequests.length} Pending</span>
                    </h2>
                </div>
                
                {registrations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No applications found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Tournament</th>
                                    <th className="px-6 py-4 font-bold">Team Details</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900 text-base">{reg.Tournament?.name}</p>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/> {new Date(reg.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{reg.Team?.name || 'Unknown Team'}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Shield className="w-3 h-3"/> {reg.Team?.Club?.name || 'Unknown Club'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                reg.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                reg.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => setViewApplication(reg)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> Review
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* REVIEW MODAL */}
            {viewApplication && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                            <div>
                                <h2 className="text-xl font-extrabold flex items-center gap-2">
                                    Review Application: {viewApplication.Team?.name}
                                </h2>
                                <p className="text-sm font-medium text-slate-400 mt-1">Tournament: {viewApplication.Tournament?.name}</p>
                            </div>
                            <button onClick={() => setViewApplication(null)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-8">
                            
                            {/* Payment Receipt Section */}
                            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                                    <FileText className="w-5 h-5 text-blue-500"/> Payment Verification
                                </h3>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1 space-y-3">
                                        <p className="text-sm font-medium text-slate-600">Entry Fee Required: <strong className="text-emerald-600 text-lg">₹{viewApplication.Tournament?.entry_fee}</strong></p>
                                        <p className="text-sm font-medium text-slate-600">Applied On: <strong className="text-slate-900">{new Date(viewApplication.createdAt).toLocaleString()}</strong></p>
                                        <p className="text-sm font-medium text-slate-600">Manager/Club: <strong className="text-slate-900">{viewApplication.Team?.Club?.name}</strong></p>
                                    </div>
                                    <div className="w-full md:w-64">
                                        {viewApplication.payment_receipt_url ? (
                                            <a href={getDriveImageUrl(viewApplication.payment_receipt_url)} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border-2 border-slate-200 shadow-sm">
                                                <img src={getDriveImageUrl(viewApplication.payment_receipt_url)} alt="Receipt" className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm gap-2">
                                                    <ImageIcon className="w-4 h-4"/> View Full
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm font-bold p-4 text-center">
                                                {viewApplication.Tournament?.entry_fee > 0 ? "No Receipt Uploaded!" : "Free Tournament (No receipt required)"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Squad Review Section */}
                            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                                    <Shield className="w-5 h-5 text-emerald-500"/> Submitted Roster
                                </h3>
                                
                                {(() => {
                                    const roster = getParsedRoster(viewApplication.roster_data);
                                    const allPlayers = viewApplication.Team?.Players || [];
                                    const starters = allPlayers.filter(p => roster.starters.includes(p.id));
                                    const subs = allPlayers.filter(p => roster.subs.includes(p.id));

                                    // Helper component for drawing a beautiful player card
                                    const renderPlayerCard = (p) => (
                                        <div key={p.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                                            <div className="relative shrink-0">
                                                {p.player_photo_url ? (
                                                    <img src={getDriveImageUrl(p.player_photo_url)} alt={p.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 border-2 border-white shadow-sm">
                                                        {p.full_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="Jersey Number">
                                                    {p.TeamPlayer?.jersey_number || '-'}
                                                </div>
                                            </div>
                                            <div className="truncate flex-1">
                                                <p className="text-sm font-bold text-slate-900 truncate leading-tight">{p.full_name}</p>
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                    {p.assigned_position || 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-bold text-slate-700 text-sm mb-3 bg-slate-100 inline-block px-3 py-1 rounded-md">Starting XI ({starters.length})</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    {starters.map(renderPlayerCard)}
                                                </div>
                                            </div>
                                            
                                            {subs.length > 0 && (
                                                <div className="pt-4 border-t border-slate-100">
                                                    <h4 className="font-bold text-slate-700 text-sm mb-3 bg-slate-100 inline-block px-3 py-1 rounded-md">Substitutes ({subs.length})</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                        {subs.map(renderPlayerCard)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </section>

                        </div>

                        {/* Admin Action Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center">
                            <button onClick={() => setViewApplication(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                            
                            {viewApplication.status === "Pending Verification" && (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleStatusUpdate(viewApplication.id, 'Rejected', viewApplication.Team?.name)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-colors"
                                    >
                                        <XCircle className="w-5 h-5" /> Reject
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(viewApplication.id, 'Approved', viewApplication.Team?.name)}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 rounded-xl font-bold transition-all active:scale-95"
                                    >
                                        <CheckCircle className="w-5 h-5" /> Approve Registration
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}