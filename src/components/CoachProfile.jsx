import React, { useState } from 'react';
import { UserCircle, Shield, Key } from 'lucide-react';

export default function CoachProfile() {
    const [activeTab, setActiveTab] = useState('About');

    return (
        <div className="animate-in fade-in duration-500 space-y-6 max-w-3xl">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex items-center gap-6">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full border-4 border-slate-800 flex items-center justify-center text-3xl font-bold">M</div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Secretary Name</h1>
                        <p className="text-emerald-400 font-semibold mt-1">Head Secretary</p>
                    </div>
                </div>

                <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-2">
                    {['About', 'Credentials'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === tab ? 'border-emerald-500 text-emerald-700 bg-white rounded-t-lg' : 'border-transparent text-slate-500'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'About' && (
                        <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                            <div><p className="text-xs font-bold text-slate-400 uppercase">Phone</p><p className="font-bold text-slate-900">+91 9876543210</p></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase">Role</p><p className="font-bold text-slate-900">Head Secretary</p></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase">Experience</p><p className="font-bold text-slate-900">5 Years</p></div>
                        </div>
                    )}

                    {activeTab === 'Credentials' && (
                        <div className="space-y-5 animate-in fade-in max-w-md">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Key className="w-4 h-4 text-emerald-600" /> Update MPIN</h3>
                            <input type="password" placeholder="Current MPIN" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500/20 tracking-[0.3em] font-bold" />
                            <input type="password" placeholder="New MPIN" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500/20 tracking-[0.3em] font-bold" />
                            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md">Update Security PIN</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
