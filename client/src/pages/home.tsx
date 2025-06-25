import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/app-header";
import MobileMenu from "@/components/mobile-menu";
import Dashboard from "@/pages/dashboard";
import EnhancedEssaysPage from "@/components/enhanced-essays-page";
import WritingRepository from "@/pages/writing-repository";
import Persona from "@/pages/persona";
import Admin from "@/pages/admin";
import EnhancedNavigation from "@/components/enhanced-navigation";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "essays":
        return <EnhancedEssaysPage />;
      case "writing-repository":
        return <WritingRepository />;
      case "persona":
        return <Persona />;
      case "admin":
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`tab-btn py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "dashboard" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Dashboard
              </button>
              <button 
                className={`tab-btn py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "essays" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("essays")}
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Essay Polish
              </button>
              <button 
                className={`tab-btn py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "writing-repository" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("writing-repository")}
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                </svg>
                Writing Repository
              </button>
              <button 
                className={`tab-btn py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "persona" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("persona")}
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                Student Persona
              </button>
              {(user?.role === "admin" || user?.role === "counselor") && (
                <button 
                  className={`tab-btn py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "admin" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                  onClick={() => setActiveTab("admin")}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,13H11V3H3M13,21H21V11H13M3,21H11V15H3M13,3V9H21V3"/>
                  </svg>
                  Analytics
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </main>

      <MobileMenu activeTab={activeTab} onTabChange={setActiveTab} userRole={user?.role} />
    </div>
  );
}
