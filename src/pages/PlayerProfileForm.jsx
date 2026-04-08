import React, { useState, useEffect } from "react";
import { playerAPI } from "../services/api"; 
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react"; 

const PlayerProfileForm = () => {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const playerId = currentUser?.id || null;

    const [loading, setLoading] = useState(false);
    const [clubs, setClubs] = useState([]); 
    
    const [declarationAccepted, setDeclarationAccepted] = useState(false);

    const [aadhaarError, setAadhaarError] = useState("");
    const [panError, setPanError] = useState("");

    const [formData, setFormData] = useState({
        full_name: "",
        dob: "",
        age: "",
        gender: "",
        nationality: "Indian",
        height: "",
        weight: "",
        blood_group: "",
        aadhaar_number: "",
        pan_number: "", 
        position: "",
        strong_foot: "",
        preferred_team: "",
        current_club: "",
        past_clubs: "",
        experience_years: "",
        city: "",
        district: "",
        pincode: "",
        email: "",
        phone: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        club_applied: "", 
        injury_last_6_months: "",
        pain_running: "",
        medical_treatment: ""
    });

    const [files, setFiles] = useState({
        player_photo: null,
        gov_doc_1: null,
        gov_doc_2: null,
        gov_doc_3: null,
        fitness_certificate: null
    });

    useEffect(() => {
        if (!playerId) {
            navigate("/login");
            return;
        }

        const loadClubs = async () => {
            try {
                const res = await fetch("https://backend.dhsa.co.in/clubs"); 
                const data = await res.json();
                setClubs(data);
            } catch (err) {
                console.error("Failed to fetch clubs", err);
            }
        };

        loadClubs();
    }, [playerId, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    // 🌟 HELPER FUNCTION: Calculate exact age based on DOB
    const calculateAge = (dobString) => {
        if (!dobString) return "";
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // If the birth month hasn't happened yet this year, or it's the birth month but the day hasn't happened yet, subtract 1
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // 🌟 NEW: Automatically calculate Age if DOB is changed
            if (name === "dob") {
                newData.age = calculateAge(value);
            }
            
            return newData;
        });
        
        if (name === 'aadhaar_number') setAadhaarError("");
        if (name === 'pan_number') setPanError("");
    };

    const handleFileChange = (e) => {
        const { name, files: uploadedFiles } = e.target;
        setFiles(prev => ({
            ...prev,
            [name]: uploadedFiles[0]
        }));
    };

    const checkDuplicateDocument = async (field, value) => {
        if (!value) return;
        
        try {
            const res = await fetch(`https://backend.dhsa.co.in/players/check-document?field=${field}&value=${value}`);
            const data = await res.json();
            
            if (data.exists) {
                if (field === 'aadhaar_number') {
                    setAadhaarError("This Aadhaar number is already registered!");
                }
                if (field === 'pan_number') {
                    setPanError("This PAN number is already registered!");
                }
            }
        } catch (err) {
            console.error("Error checking document", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (aadhaarError || panError) {
            alert("Please fix the errors with your Aadhaar or PAN number before submitting.");
            return;
        }

        if (!declarationAccepted) {
            alert("You must accept the declaration before submitting.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("id", playerId);

            Object.keys(formData).forEach(key => {
                if (formData[key] !== "") {
                    data.append(key, formData[key]);
                }
            });

            Object.keys(files).forEach(key => {
                if (files[key]) {
                    data.append(key, files[key]);
                }
            });

            await playerAPI.createProfile(data);
            alert("Application Submitted Successfully");
            navigate("/player-dashboard");

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || "Submission Failed. Please check your details.";
            alert(errorMessage);
        }

        setLoading(false);
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200 text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal";
    const labelClasses = "block text-slate-700 text-sm font-bold mb-2 ml-1 tracking-wide";
    
    // Check if player is 18 or older
    const isAdult = parseInt(formData.age) >= 18;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                
                <header className="relative mb-10 text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    
                    <button 
                        onClick={handleLogout}
                        type="button"
                        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-xl font-bold text-sm transition-colors shadow-sm"
                    >
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                    </button>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4 text-emerald-600 shadow-sm border border-emerald-200 mt-2 sm:mt-0">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Player Profile</h2>
                    <p className="text-slate-500 mt-2 font-medium">Please provide accurate details to finalize your registration.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* --- 1. PERSONAL DETAILS --- */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">1</span> 
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Full Legal Name</label>
                                <input name="full_name" placeholder="Enter your full name" value={formData.full_name} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Age</label>
                                {/* 🌟 UPDATED: Made Age read-only so they don't mess up the calculation! */}
                                <input type="number" name="age" placeholder="Calculated from DOB" value={formData.age} className={`${inputClasses} bg-slate-100 cursor-not-allowed text-slate-500`} readOnly required />
                            </div>
                            <div>
                                <label className={labelClasses}>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses} required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Nationality</label>
                                <input name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleChange} className={inputClasses} required />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Aadhaar Number (or National ID)</label>
                                <input 
                                    name="aadhaar_number" 
                                    placeholder="Enter 12-digit Aadhaar Number" 
                                    value={formData.aadhaar_number} 
                                    onChange={handleChange} 
                                    onBlur={(e) => checkDuplicateDocument('aadhaar_number', e.target.value)} 
                                    className={`${inputClasses} ${aadhaarError ? 'border-rose-500 ring-rose-500/20 focus:ring-rose-500/40 focus:border-rose-500' : ''}`} 
                                    required 
                                />
                                {aadhaarError && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{aadhaarError}</p>}
                            </div>

                            {isAdult && (
                                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className={labelClasses}>PAN Number <span className="text-rose-500">*</span></label>
                                    <input 
                                        name="pan_number" 
                                        placeholder="Enter 10-character PAN Number" 
                                        value={formData.pan_number} 
                                        onChange={handleChange} 
                                        onBlur={(e) => checkDuplicateDocument('pan_number', e.target.value)}
                                        className={`${inputClasses} ${panError ? 'border-rose-500 ring-rose-500/20 focus:ring-rose-500/40 focus:border-rose-500' : ''}`} 
                                        required 
                                    />
                                    <p className="text-slate-400 text-xs mt-1.5 ml-1 font-medium">Required since you are 18 or older.</p>
                                    {panError && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{panError}</p>}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* --- 2. PHYSICAL ATTRIBUTES --- */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">2</span> 
                            Physical Attributes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClasses}>Height (cm)</label>
                                <input type="number" name="height" placeholder="e.g. 180" value={formData.height} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Weight (kg)</label>
                                <input type="number" name="weight" placeholder="e.g. 75" value={formData.weight} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Blood Group</label>
                                <input name="blood_group" placeholder="e.g. O+" value={formData.blood_group} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </div>
                    </div>

                    {/* --- 3. PLAYING PROFILE --- */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">3</span> 
                            Playing Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Primary Position</label>
                                <select name="position" value={formData.position} onChange={handleChange} className={inputClasses} required>
                                    <option value="">Select Position</option>
                                    <option value="Goalkeeper">Goalkeeper</option>
                                    <option value="Defender">Defender</option>
                                    <option value="Midfielder">Midfielder</option>
                                    <option value="Forward">Forward</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Dominant Foot</label>
                                <select name="strong_foot" value={formData.strong_foot} onChange={handleChange} className={inputClasses} required>
                                    <option value="">Select Strong Foot</option>
                                    <option value="Right">Right</option>
                                    <option value="Left">Left</option>
                                    <option value="Both">Both (Ambidextrous)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Years of Experience</label>
                                <input type="number" name="experience_years" placeholder="Years playing" value={formData.experience_years} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </div>
                    </div>

                    {/* --- 4. CONTACT & LOCATION --- */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">4</span> 
                            Contact & Location
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className={labelClasses}>Email Address</label>
                                <input type="email" name="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Phone Number</label>
                                <input type="tel" name="phone" placeholder="Mobile Number" value={formData.phone} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className={labelClasses}>City</label>
                                <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>District</label>
                                <input name="district" placeholder="District" value={formData.district} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Pincode</label>
                                <input name="pincode" placeholder="Postal Code" value={formData.pincode} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </div>
                    </div>

                    {/* --- 5. EMERGENCY & MEDICAL --- */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            
                            {/* Emergency Contact */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">5</span> 
                                    Emergency Contact
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Contact Person Name</label>
                                        <input name="emergency_contact_name" placeholder="Full Name" value={formData.emergency_contact_name} onChange={handleChange} className={inputClasses} required />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Emergency Phone</label>
                                        <input type="tel" name="emergency_contact_phone" placeholder="Emergency Number" value={formData.emergency_contact_phone} onChange={handleChange} className={inputClasses} required />
                                    </div>
                                </div>
                            </div>

                            {/* Medical Questionnaire */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg></span> 
                                    Medical History
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Had any injury in the last 6 months?</label>
                                        <select name="injury_last_6_months" value={formData.injury_last_6_months} onChange={handleChange} className={inputClasses} required>
                                            <option value="">Select Answer</option>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Do you experience pain while running?</label>
                                        <select name="pain_running" value={formData.pain_running} onChange={handleChange} className={inputClasses} required>
                                            <option value="">Select Answer</option>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Are you under medical treatment?</label>
                                        <select name="medical_treatment" value={formData.medical_treatment} onChange={handleChange} className={inputClasses} required>
                                            <option value="">Select Answer</option>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 6. DOCUMENTS UPLOAD --- */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">6</span> 
                            Required Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            <div className="space-y-2">
                                <label className={labelClasses}>Player Photo <span className="text-rose-500">*</span></label>
                                <input type="file" name="player_photo" onChange={handleFileChange} required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className={labelClasses}>Gov Document 1 (e.g., Aadhaar) <span className="text-rose-500">*</span></label>
                                <input type="file" name="gov_doc_1" onChange={handleFileChange} required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClasses}>Gov Document 2 (e.g., PAN Card/Birth Certificate) <span className="text-rose-500">*</span></label>
                                <input type="file" name="gov_doc_2" onChange={handleFileChange} required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClasses}>Gov Document 3 (e.g., Passport/Voter ID) <span className="text-rose-500">*</span></label>
                                <input type="file" name="gov_doc_3" onChange={handleFileChange} required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className={labelClasses}>Fitness Certificate <span className="text-slate-400 text-xs font-medium ml-1">(Optional)</span></label>
                                <input type="file" name="fitness_certificate" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
                            </div>

                        </div>
                    </div>

                    {/* --- 7. FINAL SUBMISSION & DECLARATION --- */}
                    <div className="bg-emerald-900 p-8 md:p-10 rounded-3xl shadow-xl flex flex-col gap-8 transform transition-transform hover:scale-[1.01]">
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="w-full md:w-1/2">
                                <h3 className="text-2xl font-bold text-white mb-2">Ready to Apply?</h3>
                                <p className="text-emerald-200 mb-4 font-medium">Select the Club you wish to join from the list below.</p>
                                
                                <select 
                                    name="club_applied" 
                                    value={formData.club_applied} 
                                    onChange={handleChange} 
                                    className="w-full bg-emerald-800/50 border border-emerald-700 p-4 rounded-xl focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all text-white font-bold tracking-wide cursor-pointer appearance-none"
                                    required
                                >
                                    <option value="" className="text-slate-900">-- Select Target Club --</option>
                                    {clubs.map(club => (
                                        <option key={club.id} value={club.id} className="text-slate-900">
                                            {club.name} ({club.city})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                        <div className="w-full border-t border-emerald-800/70 pt-6">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    required
                                    checked={declarationAccepted}
                                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                                    className="mt-1 w-6 h-6 rounded border-emerald-700 bg-emerald-800/50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-emerald-900 cursor-pointer transition-colors shrink-0"
                                />
                                <span className="text-emerald-100/90 text-sm leading-relaxed font-medium group-hover:text-white transition-colors">
                                    I hereby declare that all information provided in this form is true, complete, and accurate to the best of my knowledge. I understand that providing false or misleading information may result in strict disciplinary action by DHSA, for which I accept full responsibility.
                                </span>
                            </label>
                        </div>
                            <div className="w-full md:w-auto flex-shrink-0 mt-4 md:mt-0">
                                <button 
                                    type="submit" 
                                    disabled={loading || !declarationAccepted || aadhaarError || panError}
                                    className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-emerald-950 font-extrabold text-lg px-12 py-5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {loading ? "Uploading..." : "Submit Application"}
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PlayerProfileForm;
