import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Calendar, Plus, X, UploadCloud, MapPin, Coins, QrCode, Trash2, Edit } from 'lucide-react';
import TournamentBracketManager from './TournamentBracketManager'; 

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [managingBracket, setManagingBracket] = useState(null);

    // Track if we are editing an existing tournament
    const [editingId, setEditingId] = useState(null);

    // Form State
    const bannerInputRef = useRef(null);
    const qrInputRef = useRef(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [qrFile, setQrFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [qrPreview, setQrPreview] = useState(null);
    
    // Default blank form state
    const defaultFormState = {
        name: '', description: '', format: 'Knockout',
        registration_deadline: '', start_date: '', end_date: '',
        venue: '', city: '', age_category: 'Open', gender: 'Men\'s',
        max_teams: 16, entry_fee: 0, prize_pool: '',
        registration_mode: ['Offline'], 
        upi_id: ''
    };
    
    const [formData, setFormData] = useState(defaultFormState);

    const getDriveImageUrl = (url) => { if (!url) return "https://placehold.co/150x150?text=No+Photo"; const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); const fileId = match ? match[1] : null; if (!fileId) return url; return `https://lh3.googleusercontent.com/d/${fileId}`; };
    useEffect(() => { fetchTournaments(); }, []);

    const fetchTournaments = async () => {
        try {
            const res = await fetch("https://backend.dhsa.co.in/tournaments");
            if (res.ok) setTournaments(await res.json());
        } catch (error) { console.error("Error fetching:", error); }
        finally { setLoading(false); }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleRegMode = (mode) => {
        setFormData(prev => {
            const modes = [...prev.registration_mode];
            if (modes.includes(mode)) {
                return { ...prev, registration_mode: modes.filter(m => m !== mode) };
            } else {
                return { ...prev, registration_mode: [...modes, mode] };
            }
        });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'banner') {
                setBannerFile(file);
                setBannerPreview(URL.createObjectURL(file));
            } else {
                setQrFile(file);
                setQrPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleManageBracket = (tournament) => {
        setManagingBracket(tournament);
    };

    // Format Date Helper for editing inputs
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    };

    // 🌟 Handle Edit Button Click
    const handleEditClick = (tournament) => {
        setEditingId(tournament.id);
        
        let parsedModes = ['Offline'];
        if (tournament.registration_mode) {
            try {
                parsedModes = typeof tournament.registration_mode === 'string' ? JSON.parse(tournament.registration_mode) : tournament.registration_mode;
            } catch(e) { console.error("Error parsing modes", e); }
        }

        setFormData({
            name: tournament.name || '', 
            description: tournament.description || '', 
            format: tournament.format || 'Knockout',
            registration_deadline: formatDateForInput(tournament.registration_deadline), 
            start_date: formatDateForInput(tournament.start_date), 
            end_date: formatDateForInput(tournament.end_date),
            venue: tournament.venue || '', 
            city: tournament.city || '', 
            age_category: tournament.age_category || 'Open', 
            gender: tournament.gender || 'Men\'s',
            max_teams: tournament.max_teams || 16, 
            entry_fee: tournament.entry_fee || 0, 
            prize_pool: tournament.prize_pool || '',
            registration_mode: parsedModes, 
            upi_id: tournament.upi_id || ''
        });

        setBannerPreview(tournament.banner_url ? getDriveImageUrl(tournament.banner_url) : null);
        setQrPreview(tournament.qr_code_url ? getDriveImageUrl(tournament.qr_code_url) : null);
        setBannerFile(null);
        setQrFile(null);
        
        setIsCreating(true);
    };

    // Reset form when closing modal
    const closeFormModal = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData(defaultFormState);
        setBannerFile(null); setBannerPreview(null);
        setQrFile(null); setQrPreview(null);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you absolutely sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/tournaments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTournaments(tournaments.filter(t => t.id !== id));
            } else {
                alert("Failed to delete the tournament.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Server error occurred while trying to delete.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.registration_mode.length === 0) {
            alert("Please select at least one Registration Mode.");
            return;
        }

        setIsSubmitting(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'registration_mode') {
                submitData.append(key, JSON.stringify(formData[key]));
            } else {
                submitData.append(key, formData[key]);
            }
        });
        
        if (bannerFile) submitData.append('banner_file', bannerFile);
        if (qrFile) submitData.append('qr_code_file', qrFile);

        // Dynamically switch between Create (POST) and Edit (PUT)
        const url = editingId 
            ? `https://backend.dhsa.co.in/admin/tournaments/${editingId}` 
            : `https://backend.dhsa.co.in/admin/tournaments`;
        
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                body: submitData
            });

            if (res.ok) {
                alert(editingId ? "Tournament updated successfully!" : "Tournament created!");
                closeFormModal();
                fetchTournaments();
            } else {
                alert("Failed to save tournament.");
            }
        } catch (error) {
            alert("Server Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading...</div>;

    const isOnlineSelected = formData.registration_mode.includes('Online');

    return (
        <div className="animate-in fade-in duration-500 space-y-8 relative">
            
            {managingBracket ? (
                <TournamentBracketManager 
                    tournament={managingBracket} 
                    onClose={() => setManagingBracket(null)} 
                />
            ) : (
                <>
                    <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900">Tournament Hub</h1>
                            <p className="text-slate-500 mt-1">Manage and publish official competitions.</p>
                        </div>
                        <button onClick={() => { closeFormModal(); setIsCreating(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2 active:scale-95">
                            <Plus className="w-5 h-5" /> Create Tournament
                        </button>
                    </header>

                    {tournaments.length === 0 ? (
                        <div className="bg-white border border-dashed rounded-3xl p-12 text-center text-slate-500">
                            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="font-medium text-lg">No tournaments created yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {tournaments.map(t => (
                                <div key={t.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col relative">
                                    <div className="h-40 bg-slate-200 relative overflow-hidden">
                                        <img src={getDriveImageUrl(t.banner_url)} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700 rounded-full shadow-sm">{t.status}</div>
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-extrabold text-xl text-slate-900 leading-tight mb-3">{t.name}</h3>
                                        <div className="space-y-2 mb-6 flex-1">
                                            <p className="text-slate-600 text-sm font-medium"><MapPin className="w-4 h-4 text-blue-500 inline mr-1"/> {t.city}</p>
                                            <p className="text-slate-600 text-sm font-medium"><Calendar className="w-4 h-4 text-amber-500 inline mr-1"/> {new Date(t.start_date).toLocaleDateString()}</p>
                                            <p className="text-slate-600 text-sm font-medium">
                                                <Coins className="w-4 h-4 text-emerald-500 inline mr-1"/> 
                                                Entry: {t.entry_fee > 0 ? `₹${t.entry_fee}` : 'Free'}
                                            </p>
                                        </div>
                                        
                                        {/* 🌟 ACTION BUTTONS: Permanently visible and beautifully laid out */}
                                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                    {t.registered_teams_count || 0} / {t.max_teams} Teams
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditClick(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Tournament">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(t.id, t.name)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Tournament">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <button onClick={() => handleManageBracket(t)} className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-colors text-sm">
                                                Manage Bracket
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MODAL FOR CREATING OR EDITING */}
                    {isCreating && (
                        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
                                
                                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            {editingId ? "Edit Tournament" : "Create Tournament"}
                                        </h2>
                                    </div>
                                    <button onClick={closeFormModal} className="w-8 h-8 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors">✕</button>
                                </div>

                                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                                    <form id="tourney-form" onSubmit={handleSubmit} className="space-y-10">
                                        
                                        {/* 1. Core & Banner */}
                                        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-5">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3"><Trophy className="w-5 h-5 text-emerald-500"/> Core Details</h3>
                                            
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Tournament Banner</label>
                                                <div onClick={() => bannerInputRef.current.click()} className="w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer overflow-hidden relative">
                                                    {bannerPreview ? <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner Preview" /> : <><UploadCloud className="w-8 h-8 text-slate-400 mb-2" /><span className="text-sm font-bold text-emerald-600">Upload Banner</span></>}
                                                    <input type="file" accept="image/*" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} className="hidden" />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">Name</label><input type="text" name="name" required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.name} onChange={handleInputChange} /></div>
                                                <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">Description</label><textarea name="description" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.description} onChange={handleInputChange} /></div>
                                                <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">Format</label>
                                                    <select name="format" className="w-full border p-3 rounded-xl" value={formData.format} onChange={handleInputChange}>
                                                        <option>Knockout</option><option>League</option><option>Group Stages + Knockout</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </section>

                                        {/* 2. Dates */}
                                        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-5">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3"><Calendar className="w-5 h-5 text-blue-500"/> Logistics</h3>
                                            <div className="grid md:grid-cols-3 gap-5">
                                                <div><label className="block text-sm font-bold mb-2 text-rose-600">Reg. Deadline</label><input type="date" name="registration_deadline" required className="w-full border p-3 rounded-xl" value={formData.registration_deadline} onChange={handleInputChange} /></div>
                                                <div><label className="block text-sm font-bold mb-2">Start Date</label><input type="date" name="start_date" required className="w-full border p-3 rounded-xl" value={formData.start_date} onChange={handleInputChange} /></div>
                                                <div><label className="block text-sm font-bold mb-2">End Date</label><input type="date" name="end_date" required className="w-full border p-3 rounded-xl" value={formData.end_date} onChange={handleInputChange} /></div>
                                                <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">Venue</label><input type="text" name="venue" required className="w-full border p-3 rounded-xl" value={formData.venue} onChange={handleInputChange} /></div>
                                                <div><label className="block text-sm font-bold mb-2">City</label><input type="text" name="city" required className="w-full border p-3 rounded-xl" value={formData.city} onChange={handleInputChange} /></div>
                                            </div>
                                        </section>

                                        {/* 3. Registration & Payment */}
                                        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-5">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3"><Coins className="w-5 h-5 text-amber-500"/> Registration & Payment</h3>
                                            
                                            <div className="grid md:grid-cols-3 gap-5">
                                                <div><label className="block text-sm font-bold mb-2">Age</label><select name="age_category" className="w-full border p-3 rounded-xl" value={formData.age_category} onChange={handleInputChange}><option>Under-15</option><option>Under-18</option><option>Seniors</option><option>Open</option></select></div>
                                                <div><label className="block text-sm font-bold mb-2">Gender</label><select name="gender" className="w-full border p-3 rounded-xl" value={formData.gender} onChange={handleInputChange}><option>Men's</option><option>Women's</option><option>Mixed</option></select></div>
                                                <div><label className="block text-sm font-bold mb-2">Max Teams</label><input type="number" name="max_teams" min="2" className="w-full border p-3 rounded-xl" value={formData.max_teams} onChange={handleInputChange} /></div>
                                                
                                                <div><label className="block text-sm font-bold mb-2">Entry Fee (₹)</label><input type="number" name="entry_fee" min="0" className="w-full border p-3 rounded-xl" value={formData.entry_fee} onChange={handleInputChange} /></div>
                                                <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">Prize Pool</label><input type="text" name="prize_pool" className="w-full border p-3 rounded-xl" value={formData.prize_pool} onChange={handleInputChange} /></div>
                                            </div>

                                            {/* PAYMENT MODES */}
                                            <div className="border-t border-slate-100 pt-5 mt-5">
                                                <label className="block text-sm font-bold text-slate-700 mb-3">Acceptable Payment Modes (Select multiple)</label>
                                                <div className="flex gap-4">
                                                    <button type="button" onClick={() => toggleRegMode('Offline')} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${formData.registration_mode.includes('Offline') ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                                        Cash / Offline
                                                    </button>
                                                    <button type="button" onClick={() => toggleRegMode('Online')} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${isOnlineSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                                        <QrCode className="w-5 h-5"/> UPI / Online
                                                    </button>
                                                </div>
                                            </div>

                                            {/* CONDITIONAL QR UPLOAD */}
                                            {isOnlineSelected && (
                                                <div className="grid md:grid-cols-2 gap-5 bg-blue-50/50 p-5 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95">
                                                    <div>
                                                        <label className="block text-sm font-bold text-blue-900 mb-2">UPI ID</label>
                                                        <input type="text" name="upi_id" placeholder="e.g., clubname@upi" className="w-full border border-blue-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.upi_id} onChange={handleInputChange} />
                                                        <p className="text-xs text-blue-600 mt-2 font-medium">Managers will use this to pay the entry fee.</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-blue-900 mb-2">Upload Payment QR Code</label>
                                                        <div onClick={() => qrInputRef.current.click()} className="w-full h-32 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center bg-white cursor-pointer overflow-hidden">
                                                            {qrPreview ? <img src={qrPreview} className="h-full object-contain" alt="QR Preview" /> : <span className="text-sm font-bold text-blue-600 flex items-center gap-2"><UploadCloud className="w-5 h-5"/> Select QR Image</span>}
                                                            <input type="file" accept="image/*" ref={qrInputRef} onChange={(e) => handleFileChange(e, 'qr')} className="hidden" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    </form>
                                </div>

                                <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
                                    <button type="button" onClick={closeFormModal} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button type="submit" form="tourney-form" disabled={isSubmitting} className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-colors">
                                        {isSubmitting ? "Saving..." : (editingId ? "Save Changes" : "Publish Tournament")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
