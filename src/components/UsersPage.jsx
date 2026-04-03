import React, { useState, useEffect } from 'react';
import { Search, Edit, UserX, Shield, User, Loader2, X, Save, AlertCircle } from 'lucide-react';
import API from '../services/api';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', role: '', status: '' });
    const [saving, setSaving] = useState(false);

    const tabs = ['All', 'Players', 'Secretary', 'Admins'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
        🌟 OMNI-SEARCH & FILTER LOGIC
    ================================ */
    const filteredUsers = users.filter(user => {
        // 1. Tab Matching: Maps "Players" to "Player", etc.
        const matchesTab = activeTab === 'All' || user.role === activeTab.replace('s', ''); 
        
        // 2. Omni-Search Matching
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            user.name?.toLowerCase().includes(query) || 
            user.phone?.includes(query) ||
            user.role?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.status?.toLowerCase().includes(query); // Now you can search by status!

        return matchesTab && matchesSearch;
    });

    /* ===============================
        EDIT HANDLERS
    ================================ */
    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            phone: user.phone || '',
            email: user.email || '',
            role: user.role || 'Player',
            status: user.status || 'Pending'
        });
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await API.put(`/admin/users/${editingUser.id}`, editForm);
            alert("User updated successfully!");
            setEditingUser(null);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`🚨 Are you sure you want to permanently delete ${name}?`)) return;
        
        try {
            await API.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            alert("User deleted.");
        } catch (error) {
            alert("Failed to delete user.");
        }
    };

    const getRoleStyles = (role) => {
        switch(role) {
            case 'Admin': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'Manager': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Registered': return 'text-emerald-600 bg-emerald-50';
            case 'Blacklisted': return 'text-slate-900 bg-slate-200';
            case 'Hold': return 'text-amber-600 bg-amber-50';
            case 'Rejected': return 'text-rose-600 bg-rose-50';
            default: return 'text-blue-600 bg-blue-50'; // Pending/Others
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all system users, roles, and access.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-xl overflow-x-auto w-full xl:w-auto custom-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full xl:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name, phone, role, status..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium" 
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Role & Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Contact</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500 font-medium italic">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200 uppercase shadow-sm">
                                                {user.name?.charAt(0) || <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-900 block">{user.name || "Unnamed User"}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">ID: {user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-y-1.5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs border ${getRoleStyles(user.role)}`}>
                                            {user.role === 'Admin' ? <Shield className="w-3 h-3" /> : null}
                                            {user.role}
                                        </span>
                                        {/* Show Status Badge for Players */}
                                        {user.role === 'Player' && (
                                            <span className={`block w-max px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-100 ${getStatusColor(user.status)}`}>
                                                {user.status || 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-800 font-bold block">{user.phone || "N/A"}</span>
                                        {user.email && <span className="text-xs text-slate-500 font-medium">{user.email}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => openEditModal(user)} 
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="Edit User"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all ml-1"
                                            title="Delete User"
                                        >
                                            <UserX className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===============================
                EDIT USER MODAL
            ================================ */}
            {editingUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">Edit User Details</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase mt-1">ID: {editingUser.id}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none font-semibold text-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                                    <input 
                                        type="text" 
                                        value={editForm.phone} 
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none font-semibold text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={editForm.email} 
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none font-semibold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System Role</label>
                                    <select 
                                        value={editForm.role} 
                                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none font-semibold text-slate-800"
                                    >
                                        <option value="Player">Player</option>
                                        <option value="Manager">Secretary</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                
                                {/* 🌟 NEW: Status Dropdown */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Status</label>
                                    <select 
                                        value={editForm.status} 
                                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                        disabled={editForm.role !== 'Player'} // Usually only players have these specific statuses
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none font-semibold text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="Registered">Active / Registered</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Hold">Hold</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Blacklisted">Blacklisted</option>
                                    </select>
                                </div>
                            </div>
                            
                            {editForm.status === 'Blacklisted' && (
                                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p className="text-xs font-semibold">Warning: Blacklisted users will be banned from applying to clubs.</p>
                                </div>
                            )}

                        </div>

                        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                            <button onClick={() => setEditingUser(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={saving} className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95 transition-all flex items-center gap-2">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
