import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/schema";

interface AppHeaderProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AppHeader({ user, activeTab, onTabChange }: AppHeaderProps) {
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getDisplayName = (firstName?: string | null, lastName?: string | null) => {
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "User";
  };

  return (
    <header className="bg-white shadow-material sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-neutral-800">StudentOS</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => onTabChange("dashboard")}
                className={`text-neutral-800 hover:text-primary transition-colors font-medium ${
                  activeTab === "dashboard" ? "text-primary" : ""
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => onTabChange("essays")}
                className={`text-neutral-800 hover:text-primary transition-colors font-medium ${
                  activeTab === "essays" ? "text-primary" : ""
                }`}
              >
                Essay Polish
              </button>
              <button 
                onClick={() => onTabChange("writing-repository")}
                className={`text-neutral-800 hover:text-primary transition-colors font-medium ${
                  activeTab === "writing-repository" ? "text-primary" : ""
                }`}
              >
                Writing Repository
              </button>
              <button 
                onClick={() => onTabChange("persona")}
                className={`text-neutral-800 hover:text-primary transition-colors font-medium ${
                  activeTab === "persona" ? "text-primary" : ""
                }`}
              >
                My Profile
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {(user?.role === "admin" || user?.role === "counselor") && (
              <Button 
                variant="default"
                className="hidden md:block bg-primary text-white hover:bg-blue-700 font-medium"
                onClick={() => onTabChange("admin")}
              >
                {user?.role === "admin" ? "Admin Panel" : "For Schools"}
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 bg-neutral-100 rounded-lg px-3 py-2 hover:bg-neutral-200 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
                    <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block font-medium">
                    {getDisplayName(user?.firstName, user?.lastName)}
                  </span>
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onTabChange("persona")}>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTabChange("essays")}>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  My Essays
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17,7L15.59,8.41L18.17,11H8V13H18.17L15.59,15.59L17,17L22,12L17,7M4,5H12V3H4A2,2 0 0,0 2,5V19A2,2 0 0,0 4,21H12V19H4V5Z"/>
                  </svg>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
