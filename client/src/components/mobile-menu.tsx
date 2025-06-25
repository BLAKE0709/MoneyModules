interface MobileMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: string;
}

export default function MobileMenu({ activeTab, onTabChange, userRole }: MobileMenuProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
      <div className="grid grid-cols-4 gap-1 p-2">
        <button 
          className={`flex flex-col items-center py-2 px-1 transition-colors ${
            activeTab === "dashboard" ? "text-primary" : "text-neutral-500"
          }`}
          onClick={() => onTabChange("dashboard")}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button 
          className={`flex flex-col items-center py-2 px-1 transition-colors ${
            activeTab === "essays" ? "text-primary" : "text-neutral-500"
          }`}
          onClick={() => onTabChange("essays")}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          <span className="text-xs font-medium">Essays</span>
        </button>
        
        <button 
          className={`flex flex-col items-center py-2 px-1 transition-colors ${
            activeTab === "persona" ? "text-primary" : "text-neutral-500"
          }`}
          onClick={() => onTabChange("persona")}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
          <span className="text-xs font-medium">Profile</span>
        </button>
        
        <button 
          className={`flex flex-col items-center py-2 px-1 transition-colors ${
            activeTab === "admin" ? "text-primary" : "text-neutral-500"
          } ${(userRole === "admin" || userRole === "counselor") ? "" : "opacity-50"}`}
          onClick={() => {
            if (userRole === "admin" || userRole === "counselor") {
              onTabChange("admin");
            }
          }}
          disabled={!(userRole === "admin" || userRole === "counselor")}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3,13H11V3H3M13,21H21V11H13M3,21H11V15H3M13,3V9H21V3"/>
          </svg>
          <span className="text-xs font-medium">
            {userRole === "admin" ? "Admin" : "Analytics"}
          </span>
        </button>
      </div>
    </div>
  );
}
