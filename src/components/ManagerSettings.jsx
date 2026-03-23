import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit } from 'lucide-react';

export default function ManagerSettings({ clubId }) {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch questions when component loads
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`http://localhost:5000/manager/questions/${clubId}`);
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data);
                }
            } catch (err) {
                console.error("Failed to fetch questions:", err);
            } finally {
                setLoading(false);
            }
        };

        if (clubId) fetchQuestions();
    }, [clubId]);

    // Add a new question to the backend
    const handleAdd = async () => {
        if (!newQuestion.trim()) return;
        
        try {
            const res = await fetch("http://localhost:5000/manager/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ club_id: clubId, question: newQuestion })
            });
            
            if (res.ok) {
                const addedQuestion = await res.json();
                setQuestions([...questions, addedQuestion]);
                setNewQuestion("");
            }
        } catch (error) {
            console.error("Failed to add question:", error);
        }
    };

    // Delete a question from the backend
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;

        try {
            const res = await fetch(`http://localhost:5000/manager/questions/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setQuestions(questions.filter((q) => q.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete question:", error);
        }
    };

    // Save an edited question to the backend
    const handleSaveEdit = async (id) => {
        if (!editText.trim()) return;

        try {
            const res = await fetch(`http://localhost:5000/manager/questions/${id}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: editText })
            });

            if (res.ok) {
                setQuestions(questions.map((q) => 
                    q.id === id ? { ...q, question: editText } : q
                ));
                setEditingId(null);
            }
        } catch (error) {
            console.error("Failed to update question:", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6 max-w-4xl">
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Evaluation Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure the checklist questions used during player trials.</p>
                </div>
            </header>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Trial Checklist Questions</h3>
                
                <div className="flex gap-3 mb-8">
                    <input 
                        type="text" 
                        value={newQuestion} 
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder="Type a new evaluation question..." 
                        className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800 transition-all"
                    />
                    <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Add
                    </button>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                        No custom questions added yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-emerald-200 hover:shadow-sm transition-all">
                                
                                {editingId === q.id ? (
                                    <div className="flex-1 flex gap-2 mr-4">
                                        <input 
                                            type="text" 
                                            className="flex-1 border-2 border-emerald-500 rounded-lg p-2 text-sm focus:outline-none bg-white font-medium"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(q.id)}
                                            autoFocus
                                        />
                                        <button onClick={() => handleSaveEdit(q.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700">Save</button>
                                        <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-300">Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3 flex-1 pr-4">
                                            <span className="text-emerald-600 font-bold opacity-50 mt-0.5">{idx + 1}.</span>
                                            <span className="font-semibold text-slate-700 leading-tight">{q.question}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button 
                                                onClick={() => { setEditingId(q.id); setEditText(q.question); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-lg shadow-sm transition-colors border border-slate-100"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(q.id)} 
                                                className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm transition-colors border border-slate-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}