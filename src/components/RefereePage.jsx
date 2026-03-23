import React, { useState, useEffect } from 'react';
import { Plus, Flag, Phone, X, Edit, ShieldCheck, KeyRound, Trash2, Mail, MapPin, Calendar, Camera } from 'lucide-react';

// 🌟 Google Drive Image Helper
const getDriveImageUrl = (url) => { 
    if (!url) return "https://placehold.co/150x150?text=No+Photo"; 
    
    // Extract the file ID from the Google Drive URL
    const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/); 
    const fileId = match ? match[1] : null; 
    
    if (!fileId) return url; 
    
    // Convert to direct image URL
    return `https://drive.google.com/uc?export=view&id=${fileId}`; 
};

export default function RefereePage() {
    const [referees, setReferees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({ 
        id: null, full_name: '', phone: '', email: '', mpin: '', 
        date_of_birth: '', gender: 'Male', city: '', address: '', status: 'Active' 
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReferees();
    }, []);

    const fetchReferees = async () => {
        try {
            const res = await fetch('https://backend.dhsa.co.in/admin/referees');
            if (res.ok) setReferees(await res.json());
        } catch (error) {
            console.error("Error fetching referees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (referee = null) => {
        if (referee) {
            setFormData({ ...referee, date_of_birth: referee.date_of_birth ? referee.date_of_birth.split('T')[0] : '' });
        } else {
            setFormData({ 
                id: null, full_name: '', phone: '', email: '', mpin: '', 
                date_of_birth: '', gender: 'Male', city: '', address: '', status: 'Active' 
            });
        }
        setPhotoFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const isEditing = !!formData.id;
        const url = isEditing ? `https://backend.dhsa.co.in/admin/referees/${formData.id}` : 'https://backend.dhsa.co.in/admin/referees';
        const method = isEditing ? 'PUT' : 'POST';

        // Use FormData because we are sending a file!
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) submitData.append(key, formData[key]);
        });
        if (photoFile) submitData.append('photo_file', photoFile);

        try {
            const res = await fetch(url, { method, body: submitData });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                fetchReferees();
                setIsModalOpen(false);
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            alert("Server Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this referee?")) return;
        try {
            const res = await fetch(`https://backend.dhsa.co.in/admin/referees/${id}`, { method: 'DELETE' });
            if (res.ok) fetchReferees();
        } catch (error) { alert("Error deleting referee"); }
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-medium">Loading Referees...</div>;

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Referee Directory</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage official profiles, contact info, and match access.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Register Official
                </button>
            </header>

            {/* Referee Cards */}
            {referees.length === 0 ? (
                 <div className="bg-white border border-dashed rounded-3xl p-12 text-center text-slate-500">
                    <Flag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-800">No referees added yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {referees.map((ref) => (
                        <div key={ref.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all group relative overflow-hidden flex flex-col">
                            
                            <div className="flex justify-between items-start mb-4">
                                {/* 🌟 UPDATED: Profile Photo using Helper Function */}
                                <img 
                                    src={getDriveImageUrl(ref.photo_url)} 
                                    alt={ref.full_name} 
                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm bg-slate-50" 
                                />
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${ref.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {ref.status}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2 truncate">{ref.full_name}</h3>
                            
                            <div className="space-y-2 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                    <Phone className="w-4 h-4 text-slate-400" /> {ref.phone}
                                </div>
                                {ref.email && (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium truncate">
                                        <Mail className="w-4 h-4 text-slate-400" /> <span className="truncate">{ref.email}</span>
                                    </div>
                                )}
                                {ref.city && (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                        <MapPin className="w-4 h-4 text-slate-400" /> {ref.city}
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-4 border-t border-slate-50 flex gap-2">
                                <button onClick={() => handleOpenModal(ref)} className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 font-bold py-2 rounded-xl text-sm transition-colors border border-emerald-100 flex items-center justify-center gap-2">
                                    <Edit className="w-4 h-4" /> Edit Profile
                                </button>
                                <button onClick={() => handleDelete(ref.id)} className="bg-white hover:bg-rose-50 text-rose-500 font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-rose-100 flex items-center justify-center">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Referee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 py-10">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
                        
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" /> {formData.id ? 'Edit Profile' : 'Register Official'}
                            </h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 bg-white shadow-sm p-2 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Scrollable Form Area */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                            
                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Profile Photo (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setPhotoFile(e.target.files[0])} 
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-2 bg-slate-50"
                                />
                            </div>

                            {/* Grid Layout for Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                    <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="Pierluigi Collina" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email (Optional)</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="referee@fifa.com" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number (Login ID)</label>
                                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="9876543210" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Login MPIN (4-Digits)</label>
                                    <input type="text" required maxLength="4" value={formData.mpin} onChange={(e) => setFormData({...formData, mpin: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl tracking-widest font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="1234" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Date of Birth</label>
                                    <input type="date" required value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Gender</label>
                                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
                                    <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="London" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Account Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium">
                                        <option value="Active">Active (Can Login)</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Full Width Address Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Address</label>
                                <textarea required rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" placeholder="123 Stadium Ave..." />
                            </div>
                        </div>
                        
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-70">
                                {isSubmitting ? 'Uploading Profile...' : 'Save Profile'}
                            </button>
                        </div>

                    </form>
                </div>
            )}
        </div>
    );
}
