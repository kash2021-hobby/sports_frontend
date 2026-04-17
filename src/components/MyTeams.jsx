import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit, AlertCircle, CheckCircle, Users, Palette, Shirt } from 'lucide-react';

// 🌟 THE HELPER FUNCTION FOR GOOGLE DRIVE IMAGES
const getDriveImageUrl = (url) => { 
    if (!url) return "https://placehold.co/150x150?text=No+Photo"; 
    const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); 
    const fileId = match ? match[1] : null; 
    if (!fileId) return url; 
    return `https://drive.google.com/uc?export=view&id=${fileId}`; 
};

// 🌟 FIXED: Renamed component to MyTeams to prevent export conflicts
export default function MyTeams({ clubId }) {
    const [existingTeam, setExistingTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal & Form States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Track edit mode
    const [approvedPlayers, setApprovedPlayers] = useState([]);
    const [teamDetails, setTeamDetails] = useState({ name: "", jerseyColor: "" });

    // Key-value map for selected players: { playerId: { jerseyNumber: "", assignedPosition: "" } }
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set to 0 to allow creating empty teams!
    const minPlayersRequired = 0; 
    const selectedCount = Object.keys(selectedPlayers).length;

    useEffect(() => {
        if (clubId) {
            fetchTeamData();
            fetchApprovedPlayers();
        }
    }, [clubId]);

    const fetchTeamData = async () => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/manager/team/${clubId}`);
            if (res.ok) {
                const data = await res.json();
                setExistingTeam(data); 
            }
        } catch (error) {
            console.error("Failed to fetch team:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApprovedPlayers = async () => {
        try {
            const res = await fetch(`https://backend.dhsa.co.in/clubs/applications?club_id=${clubId}`);
            if (res.ok) {
                const data = await res.json();
                const approved = data.filter(p => p.status === "Registered");
                setApprovedPlayers(approved);
            }
        } catch (error) {
            console.error("Failed to fetch players:", error);
        }
    };

    // HELPER: Reset Form
    const resetForm = () => {
        setTeamDetails({ name: "", jerseyColor: "" });
        setSelectedPlayers({});
        setIsEditing(false);
        setShowCreateModal(false);
    };

    const handleCreateClick = () => {
        if (existingTeam) {
            alert("A permanent team is already created for your club. You can only edit or delete the existing team.");
            return;
        }
        resetForm();
        setShowCreateModal(true);
    };

    // Handle Edit Button Click
    const handleEditClick = () => {
        if (!existingTeam) return;

        setTeamDetails({ 
            name: existingTeam.name, 
            jerseyColor: existingTeam.jersey_color || "" 
        });

        const currentRoster = {};
        existingTeam.players.forEach(p => {
            currentRoster[p.id] = {
                jerseyNumber: p.jersey_number,
                assignedPosition: p.assigned_position
            };
        });

        setSelectedPlayers(currentRoster);
        setIsEditing(true);
        setShowCreateModal(true);
    };

    // Handle Delete Button Click
    const handleDeleteClick = async () => {
        if (!window.confirm("🚨 Are you sure you want to delete this permanent team? This will clear your roster and cannot be undone.")) return;

        try {
            const res = await fetch(`https://backend.dhsa.co.in/manager/team/${existingTeam.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                alert("Team deleted successfully.");
                setExistingTeam(null);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete team.");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Server error while deleting team.");
        }
    };

    const togglePlayerSelection = (player) => {
        const newSelection = { ...selectedPlayers };

        if (newSelection[player.id]) {
            delete newSelection[player.id]; 
        } else {
            newSelection[player.id] = {
                jerseyNumber: "",
                assignedPosition: player.position
            };
        }
        setSelectedPlayers(newSelection);
    };

    const updatePlayerDetail = (playerId, field, value) => {
        setSelectedPlayers(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: value
            }
        }));
    };

    const handleSubmitTeam = async (e) => {
        e.preventDefault();

        // STRICT CHECK
        if (selectedCount < minPlayersRequired) {
            alert(`You must select at least ${minPlayersRequired} player(s) to form a team.`);
            return;
        }

        const playerIds = Object.keys(selectedPlayers);
        for (let id of playerIds) {
            if (!selectedPlayers[id].jerseyNumber) {
                alert("Please assign a jersey number to all selected players.");
                return;
            }
        }

        setIsSubmitting(true);
        const payload = {
            club_id: clubId,
            name: teamDetails.name,
            jersey_color: teamDetails.jerseyColor,
            roster: selectedPlayers 
        };

        // Dynamically change URL and Method based on Edit State
        const url = isEditing 
            ? `https://backend.dhsa.co.in/manager/team/${existingTeam.id}` 
            : `https://backend.dhsa.co.in/manager/team`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`Team successfully ${isEditing ? 'updated' : 'created'}! Sent to Admin for approval.`);
                resetForm();
                fetchTeamData(); 
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save team");
            }
        } catch (error) {
            console.error(error);
            alert("Server error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading team data...</div>;
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Permanent Team</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your official club roster for tournaments.</p>
                </div>
                {!existingTeam && (
                    <button
                        onClick={handleCreateClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Create Permanent Team
                    </button>
                )}
            </header>

            {/* EXISTING TEAM VIEW */}
            {existingTeam ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">

                    {/* Status Badge */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        {existingTeam.status === "Approved" ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Admin Approved</span>
                        ) : (
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Pending Admin Approval</span>
                        )}
                    </div>

                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-inner" style={{ backgroundColor: existingTeam.jersey_color || '#f8fafc' }}>
                            <Shield className={`w-10 h-10 ${existingTeam.jersey_color ? 'text-white mix-blend-difference' : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">{existingTeam.name}</h2>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                <Palette className="w-4 h-4" /> Jersey Color: <span className="uppercase font-bold text-slate-700">{existingTeam.jersey_color}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-8">
                        <button 
                            onClick={handleEditClick}
                            className="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" /> Edit Roster
                        </button>
                        <button 
                            onClick={handleDeleteClick}
                            className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Team
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600" /> Official Roster</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingTeam.players?.map(player => (
                            <div key={player.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                <img 
                                  src={getDriveImageUrl(player.player_photo_url)} 
                                  alt={player.full_name} 
                                  className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-24 h-24 rounded-full object-cover border-4 border-slate-50 opacity-20 group-hover:opacity-100 transition-opacity z-0" 
                                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x150?text=No+Photo"; }}
                                />
                                
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-slate-900 shadow-sm border border-slate-200 relative z-10 shrink-0">
                                    {player.jersey_number}
                                </div>
                                <div className="relative z-10 bg-slate-50/80 backdrop-blur-sm rounded-lg px-2 py-1">
                                    <h4 className="font-bold text-slate-900 leading-tight">{player.full_name}</h4>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{player.assigned_position}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {existingTeam.status !== "Approved" && (
                        <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>This team is currently awaiting admin approval. You will be able to register this team for tournaments once the admin verifies the roster.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                    <Shield className="mx-auto w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900">No Permanent Team</h2>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto mb-6">Create your official club roster to participate in upcoming tournaments. You can only have one permanent team per club.</p>
                    <button onClick={handleCreateClick} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all">
                        Build Team Now
                    </button>
                </div>
            )}

            {/* CREATE/EDIT TEAM MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    {isEditing ? "Edit Permanent Team" : "Create Permanent Team"}
                                </h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Select approved players and assign jerseys.</p>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-colors">✕</button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <form id="create-team-form" onSubmit={handleSubmitTeam} className="space-y-8">

                                {/* BASIC INFO */}
                                <section className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Team Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="E.g., Elite FC Seniors"
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                                            value={teamDetails.name}
                                            onChange={e => setTeamDetails({ ...teamDetails, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Palette className="w-4 h-4" /> Primary Jersey Color</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                className="w-14 h-14 rounded-xl cursor-pointer border-0 p-0"
                                                value={teamDetails.jerseyColor}
                                                onChange={e => setTeamDetails({ ...teamDetails, jerseyColor: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Color name (e.g. Royal Blue)"
                                                className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                                                value={teamDetails.jerseyColor}
                                                onChange={e => setTeamDetails({ ...teamDetails, jerseyColor: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* PLAYER SELECTION */}
                                <section>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                                        <span>Select Squad</span>
                                        <span className="text-sm font-medium bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full">{selectedCount} Selected</span>
                                    </h3>

                                    {approvedPlayers.length === 0 ? (
                                        <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500">
                                            No admin-approved players available. Wait for the admin to approve your trialists.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {approvedPlayers.map(player => {
                                                const isSelected = !!selectedPlayers[player.id];
                                                return (
                                                    <div key={player.id} className={`p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center gap-4 ${isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>

                                                        <div className="flex items-center gap-4 flex-1">
                                                            <input
                                                                type="checkbox"
                                                                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                                                checked={isSelected}
                                                                onChange={() => togglePlayerSelection(player)}
                                                            />
                                                            <img 
                                                              src={getDriveImageUrl(player.player_photo_url)} 
                                                              alt={player.full_name} 
                                                              className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100" 
                                                              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x150?text=No+Photo"; }}
                                                            />
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">{player.full_name}</h4>
                                                                <p className="text-xs text-slate-500 font-medium">Registered: <span className="text-slate-700">{player.position}</span></p>
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="flex gap-3 items-center ml-9 md:ml-0 animate-in fade-in slide-in-from-right-4">
                                                                <div className="relative w-24">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Shirt className="w-4 h-4" /></div>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="No."
                                                                        required
                                                                        min="1" max="99"
                                                                        className="w-full bg-white border border-slate-300 p-2.5 pl-9 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900"
                                                                        value={selectedPlayers[player.id].jerseyNumber}
                                                                        onChange={e => updatePlayerDetail(player.id, 'jerseyNumber', e.target.value)}
                                                                    />
                                                                </div>
                                                                <select
                                                                    className="w-36 bg-white border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
                                                                    value={selectedPlayers[player.id].assignedPosition}
                                                                    onChange={e => updatePlayerDetail(player.id, 'assignedPosition', e.target.value)}
                                                                >
                                                                    <option value="Forward">Forward</option>
                                                                    <option value="Midfielder">Midfielder</option>
                                                                    <option value="Defender">Defender</option>
                                                                    <option value="Goalkeeper">Goalkeeper</option>
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                            </form>
                        </div>

                        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
                            <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-team-form"
                                disabled={isSubmitting || selectedCount < minPlayersRequired}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isSubmitting 
                                    ? "Submitting..." 
                                    : selectedCount < minPlayersRequired 
                                        ? `Select at least ${minPlayersRequired} player` 
                                        : (isEditing ? "Save Changes" : "Send for Approval")
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
