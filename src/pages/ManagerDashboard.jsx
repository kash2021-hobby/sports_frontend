import React, { useState, useEffect } from "react";
import ManagerSidebar from "../components/ManagerSidebar";
import ManagerDashboardHome from "../components/ManagerDashboardHome";
import AssignedTrials from "../components/AssignedTrials";
import MyTeams from "../components/MyTeams";
import MyPlayers from "../components/MyPlayers";
import TournamentHub from "../components/TournamentHub";
import CoachProfile from "../components/CoachProfile";
import ManagerSettings from "../components/ManagerSettings";
import MyTournaments from "../components/MyTournaments";
import { Menu, LogOut } from "lucide-react";
import { clubAPI } from "../services/api"; 

export default function ManagerDashboard({ clubId = 1 }) {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [pendingTrialsCount, setPendingTrialsCount] = useState(0);
    const [clubInfo, setClubInfo] = useState(null);

    // 🌟 NEW: States for tracking total and new counts
    const [totalTournaments, setTotalTournaments] = useState(0);
    const [newTournamentsCount, setNewTournamentsCount] = useState(0);
    
    const [totalMatches, setTotalMatches] = useState(0);
    const [newMatchesCount, setNewMatchesCount] = useState(0);

    // 🌟 1. Fetching all the data
    useEffect(() => {
        const fetchAllData = async () => {
            // A. Fetch Trial Applications
            try {
                const response = await clubAPI.getApplications(clubId);
                const players = response.data.applications || response.data || [];
                const newApplications = players.filter(p => p.status === "Applied");
                setPendingTrialsCount(newApplications.length);
            } catch (error) {
                console.error("Failed to fetch notification counts:", error);
            }

            // B. Fetch Tournaments
            try {
                const tRes = await fetch("https://backend.dhsa.co.in/tournaments");
                if (tRes.ok) {
                    const tData = await tRes.json();
                    const count = tData.length;
                    setTotalTournaments(count);
                    
                    // Compare against what the user has already seen
                    const seenTournaments = parseInt(localStorage.getItem("seenTournaments") || "0");
                    setNewTournamentsCount(Math.max(0, count - seenTournaments));
                }
            } catch (error) { console.error("Failed to fetch tournaments:", error); }

            // C. Fetch Assigned Matches
            try {
                const mRes = await fetch(`https://backend.dhsa.co.in/clubs/${clubId}/matches`);
                if (mRes.ok) {
                    const mData = await mRes.json();
                    const count = mData.length;
                    setTotalMatches(count);
                    
                    // Compare against what the user has already seen
                    const seenMatches = parseInt(localStorage.getItem(`seenMatches_${clubId}`) || "0");
                    setNewMatchesCount(Math.max(0, count - seenMatches));
                }
            } catch (error) { console.error("Failed to fetch matches:", error); }
        };

        const fetchClubInfo = async () => {
            try {
                const res = await fetch(`https://backend.dhsa.co.in/clubs`);
                const data = await res.json();
                const myClub = data.find(c => parseInt(c.id) === parseInt(clubId));
                if (myClub) setClubInfo(myClub);
            } catch (error) {
                console.error("Failed to fetch club info:", error);
            }
        };

        fetchAllData();
        fetchClubInfo(); 

        const interval = setInterval(fetchAllData, 10000);
        return () => clearInterval(interval);
    }, [clubId]);

    // 🌟 2. The "Disappearing Badge" Logic
    // Whenever the active tab changes, check if we need to clear a badge
    useEffect(() => {
        if (activeTab === "Tournament") {
            // Save the current total to localStorage so the badge drops to 0
            localStorage.setItem("seenTournaments", totalTournaments.toString());
            setNewTournamentsCount(0);
        } else if (activeTab === "My Tournaments") {
            // Save the current total to localStorage so the badge drops to 0
            localStorage.setItem(`seenMatches_${clubId}`, totalMatches.toString());
            setNewMatchesCount(0);
        }
    }, [activeTab, totalTournaments, totalMatches, clubId]);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Dashboard": return <ManagerDashboardHome setActiveTab={setActiveTab} clubId={clubId} />;
            case "Assigned Trials": return <AssignedTrials clubId={clubId} />;
            case "My Teams": return <MyTeams clubId={clubId} />;
            case "My Players": return <MyPlayers clubId={clubId} />;
            case "Tournament": return <TournamentHub clubId={clubId} />;
            case "My Tournaments": return <MyTournaments clubId={clubId} />;
            case "Profile": return <CoachProfile />;
            case "Settings": return <ManagerSettings clubId={clubId} />;
            default: return <ManagerDashboardHome setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <ManagerSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                handleLogout={handleLogout}
                pendingTrialsCount={pendingTrialsCount} 
                clubInfo={clubInfo}
                /* 🌟 3. Pass the new counts down to the sidebar! */
                newTournamentsCount={newTournamentsCount} 
                newMatchesCount={newMatchesCount}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-extrabold text-slate-900 text-lg">
                            {clubInfo ? clubInfo.name : "Manager Dashboard"}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center">
                        <LogOut className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
