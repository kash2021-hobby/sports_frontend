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
// 🌟 IMPORT YOUR API HERE (Adjust the path if needed)
import { clubAPI } from "../services/api"; 

export default function ManagerDashboard({ clubId = 1 }) {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // 🌟 1. CREATE STATE FOR NOTIFICATIONS
    const [pendingTrialsCount, setPendingTrialsCount] = useState(0);

    // 🌟 2. FETCH THE NOTIFICATION COUNT IN THE BACKGROUND
    useEffect(() => {
        const fetchNotificationCounts = async () => {
            try {
                const response = await clubAPI.getApplications(clubId);
                const players = response.data.applications || response.data || [];
                
                // Count how many players are in the "Applied" state
                const newApplications = players.filter(p => p.status === "Applied");
                setPendingTrialsCount(newApplications.length);
            } catch (error) {
                console.error("Failed to fetch notification counts:", error);
            }
        };

        fetchNotificationCounts(); // Initial Load

        // Optional: Poll every 10 seconds to keep the badge updated live!
        const interval = setInterval(fetchNotificationCounts, 10000);
        return () => clearInterval(interval);
    }, [clubId]);

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
            {/* Mobile Sidebar Overlay */}
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
                // 🌟 3. PASS THE COUNT TO THE SIDEBAR AS A PROP
                pendingTrialsCount={pendingTrialsCount} 
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-extrabold text-slate-900 text-lg">Coach<span className="text-emerald-500">Pro</span></span>
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
